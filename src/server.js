// server.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const electionsRoutes = require("./routes/elections");
const votesRoutes = require("./routes/votes");
const candidatesRoutes = require("./routes/candidates");
const getDBConnection = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Test server route
app.get("/", (req, res) => res.send("Voting System Backend is running ✅"));

// Test database route
app.get("/test-db", (req, res) => {
  const db = getDBConnection();
  db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    res.json({ tables: rows });
    db.close();
  });
});

// Auth routes
app.use("/auth", authRoutes);

// Elections routes
app.use("/elections", electionsRoutes);

// Votes routes
app.use("/votes", votesRoutes);

// Candidates routes
app.use("/candidates", candidatesRoutes);

// Start the server

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
