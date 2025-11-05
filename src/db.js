const sqlite3 = require("sqlite3").verbose();
const path = require("path");

function getDBConnection() {
  const dbPath = path.resolve(__dirname, "../database/voting.db");
  console.log("📁 Using database at:", dbPath); 
  return new sqlite3.Database(dbPath);
}

module.exports = getDBConnection;
