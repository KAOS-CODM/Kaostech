const express = require('express');
const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
    const supabase = req.app.locals.supabase;

    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Supabase leads error:', err);
        res.status(500).json({ message: 'Failed to fetch leads' });
    }
});

module.exports = router;
