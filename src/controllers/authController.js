const getDBConnection = require("../db");

// Register User
function registerUser(req, res) {
  const { username, password, fullname, national_id, role_id, email, time_registered } = req.body;
  const db = getDBConnection();

  db.run(
    `INSERT INTO users (username, password, fullname, national_id, role_id, email, time_registered)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, password, fullname, national_id, role_id, email, time_registered],
    function(err) {
      if (err) {
        return res.status(500).json({ message: "❌ Error registering user", error: err.message });
      }
      res.json({ message: "✅ User registered successfully!" });
    }
  );
}

// Login User
function loginUser(req, res) {
  const { username, password } = req.body;
  const db = getDBConnection();

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "❌ Error during login", error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: "❌ Invalid username or password" });
      }
      res.json({
        message: "✅ Login successful",
        user_id: user.user_id,
        fullname: user.fullname,
        role_id: user.role_id,
      });
    }
  );
}

// Delete User
function deleteUser(req, res) {
  const { user_id } = req.params;
  const db = getDBConnection();

  db.run("DELETE FROM users WHERE user_id = ?", [user_id], function (err) {
    if (err) {
      return res.status(500).json({ message: "❌ Error deleting user", error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "❌ User not found" });
    }
    res.json({ message: "✅ User deleted successfully" });
  });

  db.close();
}

module.exports = { registerUser, loginUser, deleteUser };
