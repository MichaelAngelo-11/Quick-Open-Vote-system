// routes/auth.js
const express = require("express");
const { registerUser, loginUser, deleteUser } = require("../controllers/authController");

const router = express.Router();

// POST /auth/register
router.post("/register", registerUser);

// POST /auth/login
router.post("/login", loginUser);

// DELETE /auth/delete/:user_id
router.delete("/delete/:user_id", deleteUser);

module.exports = router;
