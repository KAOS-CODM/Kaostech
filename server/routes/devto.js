const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const response = await fetch('https://dev.to/api/articles?per_page=20');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Dev.to fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch Dev.to posts' });
    }
});

module.exports = router;