const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to your SQLite database
const dbPath = path.resolve(__dirname, "../database/voting.db");

function getDBConnection() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
    } else {
      console.log("✅ Connected to the database.");
    }
  });
  return db;
}

module.exports = getDBConnection;