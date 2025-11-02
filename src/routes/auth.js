// routes/auth.js
const express = require("express");
const { registerUser, loginUser, deleteUser, getAllUsers, updateUser } = require("../controllers/authController");

const router = express.Router();

// POST /auth/register
router.post("/register", registerUser);

// POST /auth/login
router.post("/login", loginUser);

// DELETE /auth/delete/:user_id
router.delete("/delete/:user_id", deleteUser);

// GET /auth/users
router.get("/users", getAllUsers);

// PUT /auth/update/:user_id
router.put("/update/:user_id", updateUser);

module.exports = router;
