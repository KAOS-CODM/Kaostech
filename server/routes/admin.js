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

const fs = require('fs');
const path = require('path');

/* Admin Quotes API */
const QUOTES_FILE = path.join(__dirname, '../../content/fallback-quotes.json');

// GET all quotes
router.get('/quotes', requireAdmin, (req, res) => {
  try {
    let quotes = [];
    if (fs.existsSync(QUOTES_FILE)) {
      const data = fs.readFileSync(QUOTES_FILE, 'utf-8');
      quotes = JSON.parse(data);
    }
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read quotes' });
  }
});

// DELETE quote by index
router.delete('/quotes/:index', requireAdmin, (req, res) => {
  const index = parseInt(req.params.index);
  try {
    let quotes = [];
    if (fs.existsSync(QUOTES_FILE)) {
      const data = fs.readFileSync(QUOTES_FILE, 'utf-8');
      quotes = JSON.parse(data);
    }
    
    if (index >= 0 && index < quotes.length) {
      quotes.splice(index, 1);
      fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2));
      res.json({ message: 'Quote deleted' });
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// PUT mark quote as read
router.put('/quotes/:index/read', requireAdmin, (req, res) => {
  const index = parseInt(req.params.index);
  try {
    let quotes = [];
    if (fs.existsSync(QUOTES_FILE)) {
      const data = fs.readFileSync(QUOTES_FILE, 'utf-8');
      quotes = JSON.parse(data);
    }
    
    if (index >= 0 && index < quotes.length) {
      quotes[index].read = true;
      quotes[index].readAt = new Date().toISOString();
      fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2));
      res.json({ message: 'Quote marked as read' });
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

module.exports = router;
