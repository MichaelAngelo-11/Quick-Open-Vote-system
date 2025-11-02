const getDBConnection = require("../db");

// Create a new election
async function createElection(req, res) {
  try {
    const { title, description, start_date, end_date, status } = req.body;
    const db = getDBConnection();

    db.run(
      `INSERT INTO elections (title, description, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, start_date, end_date, status],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "❌ Error creating election", error: err.message });
        }
        res.json({ message: "✅ Election created successfully!" });
        db.close();
      }
    );
  } catch (error) {
    res.status(500).json({ message: "❌ Error creating election", error: error.message });
  }
}

// Fetch all elections
async function getAllElections(req, res) {
  try {
    const db = getDBConnection();
    db.all("SELECT * FROM elections", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "❌ Error fetching elections", error: err.message });
      }
      res.json(rows);
      db.close();
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching elections", error: error.message });
  }
}

module.exports = { createElection, getAllElections };
