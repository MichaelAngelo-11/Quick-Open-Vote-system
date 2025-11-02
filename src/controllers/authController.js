const getDBConnection = require("../db");

// Register User
function registerUser(req, res) {
  const { username, password, fullname, national_id, role_id, email } = req.body;
  const db = getDBConnection();

  // time_registered will be automatically set by the database DEFAULT value
  db.run(
    `INSERT INTO users (username, password, fullname, national_id, role_id, email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, fullname, national_id, role_id, email],
    function(err) {
      if (err) {
        return res.status(500).json({ message: "❌ Error registering user", error: err.message });
      }
      res.json({ message: "✅ User registered successfully!", user_id: this.lastID });
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

// Get All Users
function getAllUsers(req, res) {
  const db = getDBConnection();

  db.all("SELECT * FROM users", [], (err, users) => {
    if (err) {
      return res.status(500).json({ message: "❌ Error fetching users", error: err.message });
    }
    res.json(users);
  });

  db.close();
}

// Update User
function updateUser(req, res) {
  const { user_id } = req.params;
  const { fullname, username, email, national_id, password, currentPassword } = req.body;
  const db = getDBConnection();

  // First verify the current password if password change is requested
  if (password && currentPassword) {
    db.get("SELECT password FROM users WHERE user_id = ?", [user_id], (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ message: "❌ Error verifying password", error: err.message });
      }
      if (!user) {
        db.close();
        return res.status(404).json({ message: "❌ User not found" });
      }
      if (user.password !== currentPassword) {
        db.close();
        return res.status(401).json({ message: "❌ Current password is incorrect" });
      }
      
      // Password verified, proceed with update including new password
      performUpdate(true);
    });
  } else {
    // No password change, just update other fields
    performUpdate(false);
  }

  function performUpdate(includePassword) {
    let query, params;
    
    if (includePassword) {
      query = `UPDATE users SET fullname = ?, username = ?, email = ?, national_id = ?, password = ? WHERE user_id = ?`;
      params = [fullname, username, email, national_id, password, user_id];
    } else {
      query = `UPDATE users SET fullname = ?, username = ?, email = ?, national_id = ? WHERE user_id = ?`;
      params = [fullname, username, email, national_id, user_id];
    }

    db.run(query, params, function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ message: "❌ Error updating user", error: err.message });
      }
      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ message: "❌ User not found" });
      }
      
      // Fetch updated user to return
      db.get("SELECT user_id, username, fullname, email, national_id, role_id FROM users WHERE user_id = ?", [user_id], (err, updatedUser) => {
        db.close();
        if (err) {
          return res.status(500).json({ message: "⚠️ Updated but error fetching data", error: err.message });
        }
        res.json({ 
          message: "✅ Profile updated successfully", 
          user: updatedUser 
        });
      });
    });
  }
}

module.exports = { registerUser, loginUser, deleteUser, getAllUsers, updateUser };
