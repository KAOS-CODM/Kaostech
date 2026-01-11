const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const supabase = req.app.locals.supabase;
    const { name, email, phone, company, project_type, budget_range, message, source, timestamp } = req.body;

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([{ name, email, phone, company, project_type, budget_range, message, source, created_at: timestamp }]);

        if (error) throw error;

        res.json({ success: true, message: 'Message sent successfully!', data });
    } catch (err) {
        console.error('Supabase contact error:', err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

module.exports = router;
