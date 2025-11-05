// routes/candidates.js
const express = require("express");
const { registerCandidate, getAllCandidates, getCandidatesByElection } = require("../controllers/candidatesController");

const router = express.Router();

// POST /candidates/register
router.post("/register", registerCandidate);

// GET /candidates
router.get("/", getAllCandidates);

// GET /candidates/election/:election_id
router.get("/election/:election_id", getCandidatesByElection);

module.exports = router;
