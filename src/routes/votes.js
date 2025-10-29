const express = require("express");
const { castVote, getVotesByElection } = require("../controllers/votesController");

const router = express.Router();

router.post("/cast", castVote);
router.get("/:election_id", getVotesByElection);

module.exports = router;
