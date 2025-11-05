const getDBConnection = require("../db");

// Register a new candidate
function registerCandidate(req, res) {
  const { fullname, bio, photo_url, election_id } = req.body;
  const db = getDBConnection();

  db.run(
    `INSERT INTO candidates (fullname, bio, photo_url, election_id) VALUES (?, ?, ?, ?)`,
    [fullname, bio, photo_url, election_id],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ message: "❌ Error registering candidate", error: err.message });
      }
      res.json({ message: "✅ Candidate registered successfully!", candidate_id: this.lastID });
      db.close();
    }
  );
}

// Get all candidates
function getAllCandidates(req, res) {
  const db = getDBConnection();

  db.all(`SELECT * FROM candidates`, [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ message: "❌ Error fetching candidates", error: err.message });
    }
    res.json(rows);
    db.close();
  });
}

// Get candidates by election
function getCandidatesByElection(req, res) {
  const { election_id } = req.params;
  const db = getDBConnection();

  db.all(
    `SELECT * FROM candidates WHERE election_id = ?`,
    [election_id],
    (err, rows) => {
      if (err) {
        db.close();
        return res.status(500).json({ message: "❌ Error fetching candidates for election", error: err.message });
      }
      res.json(rows);
      db.close();
    }
  );
}

module.exports = { registerCandidate, getAllCandidates, getCandidatesByElection };
