// server/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
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

// -------------------- Compression & Security --------------------
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://dev.to", "https://api.rss2json.com"],
        imgSrc: ["'self'", 'https:', 'data:'],
      },
    },
  })
);
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

// -------------------- Static Files with Caching --------------------
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
    }
}));
app.use('/content', express.static(path.join(__dirname, '../content'), {
    maxAge: '5m'
}));

// -------------------- Admin Protection --------------------

// Protect all /admin pages except login assets
app.use('/admin', (req, res, next) => {
  // Allow login page and its assets to load without auth
  if (req.path === '/login.html' || req.path === '/login.js' || req.path === '/login.css') {
    return next();
  }
  // All other /admin pages require authentication
  return adminAuth(req, res, next);
});

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// -------------------- API Routes --------------------
app.use('/api/contact', require('./routes/contact'));
app.use('/api/contact/fallback', require('./routes/contact-fallback'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/content', require('./routes/content'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/devto', require('./routes/devto'));

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

// -------------------- Blog Post Detail Pages (Pretty URLs) --------------------
app.get('/blog/:slug', (req, res) => {
  console.log('Blog slug route hit:', req.params.slug);
  res.sendFile(path.join(__dirname, '../public/blog-post-detail.html'));
});

// -------------------- Admin Pages --------------------
app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// -------------------- SPA Fallback --------------------
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/404.html'));
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Kaos Tech server running on port ${PORT}`);
});
