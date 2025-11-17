import express from 'express';
import * as db from '../database.js';

const router = express.Router();

// Add invited voters (official mode only)
router.post('/', (req, res) => {
    try {
        const {sessionId, emails} = req.body;

        if (!sessionId) {
            return res.status(400).json({error: 'Session ID is required'});
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({error: 'At least one email is required'});
        }

        const session = db.getDb().prepare(`
            SELECT id, mode
            FROM VotingSession
            WHERE id = ?
        `).get(sessionId);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        if (session.mode !== 'official') {
            return res.status(400).json({
                error: 'Can only add voters to official mode sessions'
            });
        }

        const existingEmails = db.getDb().prepare(`
            SELECT email
            FROM InvitedVoter
            WHERE sessionId = ?
        `).all(sessionId).map(row => row.email.toLowerCase());

        const validEmails = [];
        const duplicates = [];
        const invalid = [];

        emails.forEach(email => {
            const trimmedEmail = email.trim().toLowerCase();

            if (!trimmedEmail || !trimmedEmail.includes('@')) {
                invalid.push(email);
                return;
            }

            if (existingEmails.includes(trimmedEmail)) {
                duplicates.push(email);
                return;
            }

            if (!validEmails.includes(trimmedEmail)) {
                validEmails.push(trimmedEmail);
            }
        });

        const insertVoter = db.getDb().prepare(`
            INSERT INTO InvitedVoter (id, sessionId, email, hasVoted, votedAt, createdAt)
            VALUES (?, ?, ?, 0, NULL, ?)
        `);

        const timestamp = db.getCurrentTimestamp();

        validEmails.forEach(email => {
            insertVoter.run(db.generateId(), sessionId, email, timestamp);
        });

        db.getDb().prepare(`
            UPDATE VotingSession
            SET updatedAt = ?
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), sessionId);

        res.json({
            message: `Successfully added ${validEmails.length} voter(s)`,
            added: validEmails.length,
            duplicates: duplicates.length,
            invalid: invalid.length,
            details: {
                addedEmails: validEmails,
                ...(duplicates.length > 0 && {duplicateEmails: duplicates}),
                ...(invalid.length > 0 && {invalidEmails: invalid})
            }
        });

    } catch (error) {
        console.error('Error adding voters:', error.message, error);
        res.status(500).json({error: 'Failed to add voters', details: error.message});
    }
});

// Update a voter's email (only before they vote)
router.put('/', (req, res) => {
    try {
        const {id, email} = req.body;

        if (!id) {
            return res.status(400).json({error: 'Voter ID is required'});
        }

        if (!email || !email.trim() || !email.includes('@')) {
            return res.status(400).json({error: 'Valid email is required'});
        }

        const voter = db.getDb().prepare(`
            SELECT id, sessionId, hasVoted
            FROM InvitedVoter
            WHERE id = ?
        `).get(id);

        if (!voter) {
            return res.status(404).json({error: 'Voter not found'});
        }

        if (voter.hasVoted) {
            return res.status(400).json({
                error: 'Cannot edit email of a voter who has already voted'
            });
        }

        const newEmail = email.trim().toLowerCase();

        const duplicate = db.getDb().prepare(`
            SELECT id
            FROM InvitedVoter
            WHERE sessionId = ?
              AND email = ?
              AND id != ?
        `).get(voter.sessionId, newEmail, id);

        if (duplicate) {
            return res.status(400).json({
                error: 'This email is already in the voter list'
            });
        }

        db.getDb().prepare(`
            UPDATE InvitedVoter
            SET email = ?
            WHERE id = ?
        `).run(newEmail, id);

        db.getDb().prepare(`
            UPDATE VotingSession
            SET updatedAt = ?
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), voter.sessionId);

        res.json({message: 'Voter email updated successfully'});

    } catch (error) {
        console.error('Error updating voter:', error);
        res.status(500).json({error: 'Failed to update voter'});
    }
});

// Remove a voter (only before they vote)
router.delete('/:id', (req, res) => {
    try {
        const {id} = req.params;

        const voter = db.getDb().prepare(`
            SELECT id, sessionId, hasVoted
            FROM InvitedVoter
            WHERE id = ?
        `).get(id);

        if (!voter) {
            return res.status(404).json({error: 'Voter not found'});
        }

        if (voter.hasVoted) {
            return res.status(400).json({
                error: 'Cannot delete a voter who has already voted'
            });
        }

        db.getDb().prepare(`DELETE
                            FROM InvitedVoter
                            WHERE id = ?`).run(id);

        db.getDb().prepare(`
            UPDATE VotingSession
            SET updatedAt = ?
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), voter.sessionId);

        res.json({message: 'Voter removed successfully'});

    } catch (error) {
        console.error('Error deleting voter:', error);
        res.status(500).json({error: 'Failed to delete voter'});
    }
});

export default router;