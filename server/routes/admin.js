const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = { username }; // Save session
    return res.json({ message: 'Logged in' });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Admin logout
router.post('/logout', requireAdmin, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('kaostech-admin'); // Clear cookie
    return res.json({ message: 'Logged out' });
  });
});

module.exports = router;
