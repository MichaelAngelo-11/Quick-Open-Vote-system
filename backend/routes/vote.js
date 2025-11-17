import express from 'express';
import * as db from '../database.js';

const router = express.Router();

// Submit votes for a session
router.post('/', (req, res) => {
    try {
        const {sessionId, voterEmail, voterName, votes} = req.body;

        if (!sessionId) {
            return res.status(400).json({error: 'Session ID is required'});
        }

        if (!votes || !Array.isArray(votes) || votes.length === 0) {
            return res.status(400).json({error: 'Votes are required'});
        }

        const session = db.getDb().prepare('SELECT * FROM VotingSession WHERE id = ?').get(sessionId);

        if (!session) {
            return res.status(404).json({error: 'Session not found'});
        }

        if (!session.isActive) {
            return res.status(400).json({error: 'This voting session has been closed'});
        }

        // Official mode: validate invited voter + prevent duplicate votes
        if (session.mode === 'official') {
            if (!voterEmail) {
                return res.status(400).json({error: 'Email is required for official voting'});
            }

            const invitedVoter = db.getDb().prepare(`
                SELECT *
                FROM InvitedVoter
                WHERE sessionId = ?
                  AND email = ?
            `).get(sessionId, voterEmail);

            if (!invitedVoter) {
                return res.status(403).json({error: 'You are not invited to this voting session'});
            }

            if (invitedVoter.hasVoted) {
                return res.status(400).json({error: 'You have already voted in this session'});
            }
        } else {
            // Casual mode: prevent duplicate votes per name
            if (voterName && voterName.trim()) {
                const existingVote = db.getDb().prepare(`
                    SELECT voterId
                    FROM Vote
                    WHERE sessionId = ?
                      AND voterName = ? LIMIT 1
                `).get(sessionId, voterName.trim());

                if (existingVote) {
                    return res.status(400).json({
                        error: 'This name has already been used to vote in this session',
                        alreadyVoted: true,
                        voterId: existingVote.voterId
                    });
                }
            }
        }

        const voterId = db.generateId();
        const currentTimestamp = db.getCurrentTimestamp();

        const insertVote = db.getDb().prepare(`
            INSERT INTO Vote (id, sessionId, positionId, candidateId, voterId, voterEmail, voterName, votedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        votes.forEach(vote => {
            const voteId = db.generateId();
            insertVote.run(
                voteId,
                sessionId,
                vote.positionId,
                vote.candidateId,
                voterId,
                voterEmail || null,
                voterName || null,
                currentTimestamp
            );
        });

        // Mark voter as having voted (official mode only)
        if (session.mode === 'official') {
            db.getDb().prepare(`
                UPDATE InvitedVoter
                SET hasVoted = 1,
                    votedAt  = ?
                WHERE sessionId = ?
                  AND email = ?
            `).run(currentTimestamp, sessionId, voterEmail);
        }

        res.json({
            success: true,
            message: 'Vote submitted successfully',
            voterId
        });

    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({error: 'Failed to submit vote'});
    }
});

export default router;