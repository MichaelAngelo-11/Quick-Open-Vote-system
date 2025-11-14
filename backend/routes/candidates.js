import express from 'express';
import * as db from '../database.js';

const router = express.Router();

// Add a new candidate to a position
router.post('/', (req, res) => {
    try {
        const { name, description, photoUrl, positionId, sessionId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Candidate name is required' });
        }

        if (!positionId) {
            return res.status(400).json({ error: 'Position ID is required' });
        }

        const position = db.getDb().prepare(`
            SELECT id, sessionId FROM Position WHERE id = ?
        `).get(positionId);

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        if (sessionId && position.sessionId !== sessionId) {
            return res.status(403).json({ error: 'Position does not belong to this session' });
        }

        const maxOrder = db.getDb().prepare(`
            SELECT MAX(displayOrder) as maxOrder FROM Candidate WHERE positionId = ?
        `).get(positionId);

        const displayOrder = (maxOrder.maxOrder || 0) + 1;

        const candidateId = db.generateId();
        const insertCandidate = db.getDb().prepare(`
            INSERT INTO Candidate (id, positionId, name, description, photoUrl, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        insertCandidate.run(
            candidateId,
            positionId,
            name.trim(),
            description ? description.trim() : null,
            photoUrl ? photoUrl.trim() : null,
            displayOrder
        );

        db.getDb().prepare(`
            UPDATE VotingSession 
            SET updatedAt = ? 
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), position.sessionId);

        res.json({
            message: 'Candidate added successfully',
            candidateId
        });

    } catch (error) {
        console.error('Error adding candidate:', error);
        res.status(500).json({ error: 'Failed to add candidate' });
    }
});

// Update a candidate
router.put('/', (req, res) => {
    try {
        const { id, name, description, photoUrl } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Candidate name is required' });
        }

        const candidate = db.getDb().prepare(`
            SELECT c.id, c.positionId, p.sessionId
            FROM Candidate c
            JOIN Position p ON c.positionId = p.id
            WHERE c.id = ?
        `).get(id);

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        db.getDb().prepare(`
            UPDATE Candidate
            SET name = ?, description = ?, photoUrl = ?
            WHERE id = ?
        `).run(
            name.trim(),
            description ? description.trim() : null,
            photoUrl ? photoUrl.trim() : null,
            id
        );

        db.getDb().prepare(`
            UPDATE VotingSession 
            SET updatedAt = ? 
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), candidate.sessionId);

        res.json({ message: 'Candidate updated successfully' });

    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ error: 'Failed to update candidate' });
    }
});

// Delete a candidate (only if no votes)
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const candidate = db.getDb().prepare(`
            SELECT c.id, c.positionId, p.sessionId
            FROM Candidate c
            JOIN Position p ON c.positionId = p.id
            WHERE c.id = ?
        `).get(id);

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Prevent deletion if candidate has votes (data integrity)
        const voteCount = db.getDb().prepare(`
            SELECT COUNT(*) as count FROM Vote WHERE candidateId = ?
        `).get(id);

        if (voteCount.count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete candidate who has received votes' 
            });
        }

        db.getDb().prepare(`DELETE FROM Candidate WHERE id = ?`).run(id);

        db.getDb().prepare(`
            UPDATE VotingSession 
            SET updatedAt = ? 
            WHERE id = ?
        `).run(db.getCurrentTimestamp(), candidate.sessionId);

        res.json({ message: 'Candidate deleted successfully' });

    } catch (error) {
        console.error('Error deleting candidate:', error);
        res.status(500).json({ error: 'Failed to delete candidate' });
    }
});

export default router;