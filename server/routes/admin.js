const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, 'session before:', req.session?.isAdmin);
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.admin = { username }; // Save session
    console.log('Login success, session set:', req.session.isAdmin);
    
    // Explicitly save session before sending response
    req.session.save((err) => {
      if (err) {
        console.log('Session save error:', err);
        return res.status(500).json({ message: 'Session error' });
      }
      console.log('Session saved successfully');
      return res.json({ message: 'Logged in' });
    });
  } else {
    console.log('Login failed: invalid credentials');
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
