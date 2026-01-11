const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JSON_FILE = path.join(__dirname, '../../content/fallback-quotes.json');

router.post('/', (req, res) => {
    try {
        const data = req.body;

        let existing = [];
        if (fs.existsSync(JSON_FILE)) {
            existing = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
        }

        existing.push(data);
        fs.writeFileSync(JSON_FILE, JSON.stringify(existing, null, 2));

        res.json({ success: true, message: 'Saved to local JSON fallback' });
    } catch (err) {
        console.error('Fallback JSON error:', err);
        res.status(500).json({ success: false, message: 'Failed to save fallback' });
    }
});

module.exports = router;
