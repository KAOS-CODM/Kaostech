const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usernamesFile = path.join(__dirname, '../../content/devto-usernames.json');

function readUsernames() {
  if (!fs.existsSync(usernamesFile)) {
    fs.writeFileSync(usernamesFile, '[]', 'utf-8');
  }
  return JSON.parse(fs.readFileSync(usernamesFile, 'utf-8'));
}

function writeUsernames(usernames) {
  fs.writeFileSync(usernamesFile, JSON.stringify(usernames, null, 2), 'utf-8');
}

router.get('/usernames', (req, res) => {
  try {
    const usernames = readUsernames();
    res.json(usernames);
  } catch (error) {
    console.error('Dev.to username read error:', error);
    res.status(500).json({ error: 'Failed to read saved usernames' });
  }
});

router.post('/usernames', (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const usernames = readUsernames();
    const normalized = username.trim();
    if (!usernames.includes(normalized)) {
      usernames.unshift(normalized);
      writeUsernames(usernames.slice(0, 20));
    }
    res.json(readUsernames());
  } catch (error) {
    console.error('Dev.to username save error:', error);
    res.status(500).json({ error: 'Failed to save username' });
  }
});

router.get('/', async (req, res) => {
    try {
        const username = req.query.username;
        const apiUrl = username
            ? `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=20`
            : 'https://dev.to/api/articles?per_page=20';

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (username && Array.isArray(data) && data.length === 0) {
            return res.status(404).json({ error: 'No posts found for that username' });
        }

        res.json(data);
    } catch (error) {
        console.error('Dev.to fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch Dev.to posts' });
    }
});

module.exports = router;