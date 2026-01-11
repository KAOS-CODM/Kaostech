// server/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const { requireAdmin, adminAuth } = require('./middleware/adminAuth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- Supabase --------------------
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
app.locals.supabase = supabase;

// -------------------- Security --------------------
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100
});
app.use('/api/', limiter);

// -------------------- Body Parsing --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Sessions --------------------
app.use(session({
    name: 'kaostech-admin',
    secret: process.env.ADMIN_SESSION_SECRET || 'kaostech-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,        // set true if HTTPS
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

// -------------------- Static Files --------------------
app.use(express.static(path.join(__dirname, '../public')));
app.use('/content', express.static(path.join(__dirname, '../content')));

// -------------------- Admin Protection --------------------

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// -------------------- API Routes --------------------
app.use('/api/contact', require('./routes/contact'));
app.use('/api/contact/fallback', require('./routes/contact-fallback'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/content', require('./routes/content'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/admin', require('./routes/admin'));

// -------------------- Admin Dashboard --------------------
app.get('/admin/dashboard.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Protect all /admin pages except login
app.use('/admin', (req, res, next) => {
  if (req.path === '/login.html') return next();
  return adminAuth(req, res, next);
});

// -------------------- Public Pages --------------------
const pageRoutes = [
    { url: '/', file: 'index.html' },
    { url: '/about', file: 'about.html' },
    { url: '/services', file: 'services.html' },
    { url: '/portfolio', file: 'portfolio.html' },
    { url: '/blog', file: 'blog.html' },
    { url: '/contact', file: 'contact.html' }
];

pageRoutes.forEach(route => {
    app.get(route.url, (req, res) => {
        res.sendFile(path.join(__dirname, '../public', route.file));
    });
});

// -------------------- SPA Fallback --------------------
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Kaos Tech server running on port ${PORT}`);
});
