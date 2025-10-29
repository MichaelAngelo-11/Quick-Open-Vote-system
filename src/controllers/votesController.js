const getDBConnection = require("../db");

// ✅ Cast a vote
async function castVote(req, res) {
  try {
    const { user_id, election_id, candidate_id, vote_time } = req.body;
    const db = getDBConnection();

    db.run(
      `INSERT INTO votes (user_id, election_id, candidate_id, vote_time)
       VALUES (?, ?, ?, ?)`,
      [user_id, election_id, candidate_id, vote_time],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "❌ Error casting vote", error: err.message });
        }
        res.json({ message: "✅ Vote recorded successfully!" });
        db.close();
      }
    );
  } catch (error) {
    res.status(500).json({ message: "❌ Error casting vote", error: error.message });
  }
}

// ✅ Get all votes for a specific election
async function getVotesByElection(req, res) {
  try {
    const { election_id } = req.params;
    const db = getDBConnection();

    db.all(
      `SELECT v.vote_id, u.fullname AS voter_name, c.fullname AS candidate_name, v.vote_time
       FROM votes v
       JOIN users u ON v.user_id = u.user_id
       JOIN candidates c ON v.candidate_id = c.candidate_id
       WHERE v.election_id = ?`,
      [election_id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "❌ Error fetching votes", error: err.message });
        }
        res.json(rows);
        db.close();
      }
    );
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching votes", error: error.message });
  }
}

module.exports = { castVote, getVotesByElection };
