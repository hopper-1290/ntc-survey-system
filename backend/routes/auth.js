const express = require("express");
const router = express.Router();
const { readAll } = require("../utils/jsonStore");
const { sign } = require("../utils/token");

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const users = readAll("users");
  const user = users.find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase()
  );

  // NOTE: passwords are stored/compared in plain text for demo purposes only.
  // Before deploying for real, hash passwords (e.g. bcrypt) and never store
  // them in a flat JSON file.
  if (!user || user.password !== password) {
    
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = sign({ id: user.id, username: user.username, role: user.role });

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
  });
});

module.exports = router;
