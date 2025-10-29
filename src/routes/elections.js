const express = require("express");
const { createElection, getAllElections } = require("../controllers/electionsController");

const router = express.Router();

router.post("/create", createElection);
router.get("/", getAllElections);

module.exports = router;
