import express from 'express';
import * as db from '../database.js';

const router = express.Router();

// Create a new session
router.post('/', (req, res) => {
    try {
        const {title, description, mode, resultDisplay, positions, invitedEmails} = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({error: 'Title is required'});
        }

        if (!mode || !['casual', 'official'].includes(mode)) {
            return res.status(400).json({error: 'Invalid mode. Must be "casual" or "official"'});
        }

        if (resultDisplay && !['realtime', 'after-closes'].includes(resultDisplay)) {
            return res.status(400).json({error: 'Invalid resultDisplay. Must be "realtime" or "after-closes"'});
        }

        // Official mode requires at least one invited voter
        if (mode === 'official' && (!invitedEmails || invitedEmails.length === 0)) {
            return res.status(400).json({error: 'Official mode requires at least one invited email'});
        }

        if (!positions || positions.length === 0) {
            return res.status(400).json({error: 'At least one position is required'});
        }

        for (const position of positions) {
            if (!position.title || !position.title.trim()) {
                return res.status(400).json({error: 'All positions must have a title'});
            }
            if (!position.candidates || position.candidates.length === 0) {
                return res.status(400).json({error: `Position "${position.title}" must have at least one candidate`});
            }
        }

        const sessionId = db.generateId();
        const votingCode = db.generateCode(6);
        const adminCode = db.generateCode(8);
        const currentTimestamp = db.getCurrentTimestamp();

        const insertSession = db.getDb().prepare(`
            INSERT INTO VotingSession (id, title, description, mode, resultDisplay, votingCode, adminCode,
                                       isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `);

        insertSession.run(
            sessionId,
            title.trim(),
            description ? description.trim() : null,
            mode,
            resultDisplay || 'after-closes',
            votingCode,
            adminCode,
            currentTimestamp,
            currentTimestamp
        );

        const insertPosition = db.getDb().prepare(`
            INSERT INTO Position (id, sessionId, title, description, maxSelections, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const insertCandidate = db.getDb().prepare(`
            INSERT INTO Candidate (id, positionId, name, description, photoUrl, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        positions.forEach((position, posIndex) => {
            const positionId = db.generateId();

            insertPosition.run(
                positionId,
                sessionId,
                position.title.trim(),
                position.description ? position.description.trim() : null,
                position.maxSelections || 1,
                posIndex
            );

            position.candidates.forEach((candidate, candIndex) => {
                const candidateId = db.generateId();

                insertCandidate.run(
                    candidateId,
                    positionId,
                    candidate.name.trim(),
                    candidate.description ? candidate.description.trim() : null,
                    candidate.photoUrl ? candidate.photoUrl.trim() : null,
                    candIndex
                );
            });
        });

        // Add invited voters (official mode only)
        if (mode === 'official' && invitedEmails && invitedEmails.length > 0) {
            const insertVoter = db.getDb().prepare(`
                INSERT INTO InvitedVoter (id, sessionId, email, hasVoted, votedAt, createdAt)
                VALUES (?, ?, ?, 0, NULL, ?)
            `);

            invitedEmails.forEach(email => {
                const voterId = db.generateId();
                insertVoter.run(voterId, sessionId, email.toLowerCase().trim(), currentTimestamp);
            });
        }

        res.status(201).json({
            message: 'Session created successfully',
            sessionId,
            votingCode,
            adminCode,
            mode,
            invitedVotersCount: mode === 'official' ? invitedEmails.length : 0
        });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({error: 'Failed to create session'});
    }
});

// Get session by voting or admin code
router.get('/:code', (req, res) => {
    try {
        const {code} = req.params;

        const session = db.getDb().prepare(`
            SELECT id, title, description, mode, isActive, createdAt
            FROM VotingSession
            WHERE votingCode = ?
               OR adminCode = ?
        `).get(code, code);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        if (!session.isActive) {
            return res.status(403).json({error: 'Session is closed'});
        }

        const positions = db.getDb().prepare(`
            SELECT id, title, description, maxSelections, displayOrder
            FROM Position
            WHERE sessionId = ?
            ORDER BY displayOrder ASC
        `).all(session.id);

        positions.forEach(position => {
            position.candidates = db.getDb().prepare(`
                SELECT id, name, description, photoUrl, displayOrder
                FROM Candidate
                WHERE positionId = ?
                ORDER BY displayOrder ASC
            `).all(position.id);
        });

        res.json({
            session: {
                id: session.id,
                title: session.title,
                description: session.description,
                mode: session.mode,
                isActive: session.isActive,
                createdAt: session.createdAt
            },
            positions
        });

    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({error: 'Failed to fetch session'});
    }
});

// Get admin session with stats and invited voters
router.get('/admin/:adminCode', (req, res) => {
    try {
        const {adminCode} = req.params;

        const session = db.getDb().prepare(`
            SELECT id,
                   title,
                   description,
                   mode,
                   resultDisplay,
                   votingCode,
                   adminCode,
                   isActive,
                   createdAt,
                   closedAt
            FROM VotingSession
            WHERE adminCode = ?
        `).get(adminCode);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        const positions = db.getDb().prepare(`
            SELECT id, title, description, maxSelections, displayOrder
            FROM Position
            WHERE sessionId = ?
            ORDER BY displayOrder ASC
        `).all(session.id);

        positions.forEach(position => {
            position.candidates = db.getDb().prepare(`
                SELECT id, name, description, photoUrl, displayOrder
                FROM Candidate
                WHERE positionId = ?
                ORDER BY displayOrder ASC
            `).all(position.id);
        });

        // Get vote counts for each candidate
        positions.forEach(position => {
            position.candidates.forEach(candidate => {
                const voteCount = db.getDb().prepare(`
                    SELECT COUNT(*) as count
                    FROM Vote
                    WHERE candidateId = ?
                `).get(candidate.id);
                candidate.voteCount = voteCount.count;
            });
        });

        let invitedVoters = [];
        if (session.mode === 'official') {
            invitedVoters = db.getDb().prepare(`
                SELECT id, email, hasVoted, votedAt
                FROM InvitedVoter
                WHERE sessionId = ?
                ORDER BY email ASC
            `).all(session.id);
        }

        const totalVotes = db.getDb().prepare(`
            SELECT COUNT(DISTINCT voterId) as count
            FROM Vote
            WHERE sessionId = ?
        `).get(session.id);

        res.json({
            session,
            positions,
            invitedVoters,
            stats: {
                totalVotes: totalVotes.count,
                totalInvited: invitedVoters.length,
                turnoutPercentage: invitedVoters.length > 0
                    ? Math.round((totalVotes.count / invitedVoters.length) * 100)
                    : null
            }
        });

    } catch (error) {
        console.error('Error fetching admin session:', error);
        res.status(500).json({error: 'Failed to fetch session'});
    }
});

// Close a session (stop voting)
router.post('/close', (req, res) => {
    try {
        const {adminCode} = req.body;

        if (!adminCode) {
            return res.status(400).json({error: 'Admin code is required'});
        }

        const session = db.getDb().prepare(`
            SELECT id, isActive
            FROM VotingSession
            WHERE adminCode = ?
        `).get(adminCode);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        if (!session.isActive) {
            return res.status(400).json({error: 'Session is already closed'});
        }

        const currentTimestamp = db.getCurrentTimestamp();
        db.getDb().prepare(`
            UPDATE VotingSession
            SET isActive = 0,
                closedAt = ?
            WHERE id = ?
        `).run(currentTimestamp, session.id);

        res.json({
            message: 'Session closed successfully',
            closedAt: currentTimestamp
        });

    } catch (error) {
        console.error('Error closing session:', error);
        res.status(500).json({error: 'Failed to close session'});
    }
});

// Reopen a closed session
router.post('/reopen', (req, res) => {
    try {
        const {adminCode} = req.body;

        if (!adminCode) {
            return res.status(400).json({error: 'Admin code is required'});
        }

        const session = db.getDb().prepare(`
            SELECT id, isActive
            FROM VotingSession
            WHERE adminCode = ?
        `).get(adminCode);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        if (session.isActive) {
            return res.status(400).json({error: 'Session is already open'});
        }

        db.getDb().prepare(`
            UPDATE VotingSession
            SET isActive = 1,
                closedAt = NULL
            WHERE id = ?
        `).run(session.id);

        res.json({
            message: 'Session reopened successfully'
        });

    } catch (error) {
        console.error('Error reopening session:', error);
        res.status(500).json({error: 'Failed to reopen session'});
    }
});

// Delete a session
router.delete('/:sessionId', (req, res) => {
    try {
        const {sessionId} = req.params;

        if (!sessionId) {
            return res.status(400).json({error: 'Session ID is required'});
        }

        const session = db.getDb().prepare(`
            SELECT id
            FROM VotingSession
            WHERE id = ?
        `).get(sessionId);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        // Cascade delete via foreign keys
        db.getDb().prepare(`
            DELETE
            FROM VotingSession
            WHERE id = ?
        `).run(sessionId);

        res.json({
            message: 'Session deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({error: 'Failed to delete session'});
    }
});

export default router;
