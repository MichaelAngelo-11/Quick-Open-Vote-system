import express from 'express';
import * as db from '../database.js';

const router = express.Router();

// Get results by session code
// Respects resultDisplay setting: realtime or after-closes
router.get('/:code', (req, res) => {
    try {
        const { code } = req.params;

        const session = db.getDb().prepare(`
            SELECT id, title, description, mode, resultDisplay, isActive, createdAt, closedAt
            FROM VotingSession
            WHERE votingCode = ? OR adminCode = ?
        `).get(code, code);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // If results are hidden until session closes, block access for open sessions
        if (session.resultDisplay === 'after-closes' && session.isActive === 1) {
            return res.status(403).json({ 
                error: 'Results will be available after voting closes',
                sessionActive: true,
                resultDisplay: session.resultDisplay,
                session: {
                    id: session.id,
                    title: session.title,
                    description: session.description,
                    mode: session.mode,
                    resultDisplay: session.resultDisplay,
                    isActive: session.isActive,
                    createdAt: session.createdAt,
                    closedAt: session.closedAt
                }
            });
        }

        const positions = db.getDb().prepare(`
            SELECT id, title, description, maxSelections, displayOrder
            FROM Position
            WHERE sessionId = ?
            ORDER BY displayOrder ASC
        `).all(session.id);

        // Get vote counts per candidate, sorted by votes then display order
        positions.forEach(position => {
            position.candidates = db.getDb().prepare(`
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    c.photoUrl,
                    c.displayOrder,
                    COUNT(v.id) as voteCount
                FROM Candidate c
                LEFT JOIN Vote v ON v.candidateId = c.id
                WHERE c.positionId = ?
                GROUP BY c.id
                ORDER BY voteCount DESC, c.displayOrder ASC
            `).all(position.id);
        });

        const totalVotes = db.getDb().prepare(`
            SELECT COUNT(DISTINCT voterId) as count
            FROM Vote
            WHERE sessionId = ?
        `).get(session.id);

        let totalInvited = 0;
        if (session.mode === 'official') {
            const invitedCount = db.getDb().prepare(`
                SELECT COUNT(*) as count
                FROM InvitedVoter
                WHERE sessionId = ?
            `).get(session.id);
            totalInvited = invitedCount.count;
        }

        const turnoutPercentage = totalInvited > 0 
            ? Math.round((totalVotes.count / totalInvited) * 100) 
            : null;

        res.json({
            session,
            positions,
            stats: {
                totalVotes: totalVotes.count,
                totalInvited,
                turnoutPercentage
            }
        });

    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

export default router;