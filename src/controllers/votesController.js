const getDBConnection = require("../db");

// Cast a vote
function castVote(req, res) {
  const { user_id, election_id, candidate_id, vote_time } = req.body;
  if (!user_id || !election_id || !candidate_id || !vote_time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const db = getDBConnection();

  // Optional: check if user already voted
  db.get(
    "SELECT * FROM votes WHERE user_id = ? AND election_id = ?",
    [user_id, election_id],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ message: "DB error", error: err.message });
      }
      if (row) {
        db.close();
        return res.status(400).json({ message: "User has already voted in this election" });
      }

      // Insert the vote
      db.run(
        `INSERT INTO votes (user_id, election_id, candidate_id, vote_time) VALUES (?, ?, ?, ?)`,
        [user_id, election_id, candidate_id, vote_time],
        function(err) {
          db.close();
          if (err) {
            return res.status(500).json({ message: "Error casting vote", error: err.message });
          }
          res.json({ message: "✅ Vote recorded successfully!", vote_id: this.lastID });
        }
      );
    }
  );
}

// Get all votes for a specific election
function getVotesByElection(req, res) {
  const { election_id } = req.params;
  if (!election_id) return res.status(400).json({ message: "Election ID required" });

  const db = getDBConnection();
  db.all(
    `SELECT v.vote_id, u.fullname AS voter_name, c.fullname AS candidate_name, v.vote_time
     FROM votes v
     JOIN users u ON v.user_id = u.user_id
     JOIN candidates c ON v.candidate_id = c.candidate_id
     WHERE v.election_id = ?`,
    [election_id],
    (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ message: "Error fetching votes", error: err.message });
      res.json(rows);
    }
  );
}

module.exports = { castVote, getVotesByElection };
