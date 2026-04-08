# 🚀 Kaos Tech - Portfolio & Tech Blog

Modern portfolio website with integrated tech blog, contact management, and admin dashboard. Built for developers showcasing work while sharing insights.

[![GitHub](https://img.shields.io/github/license/username/kaostech)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-orange)](https://supabase.com)

## ✨ Features

- **📂 Portfolio** - Showcase projects with tech stacks, case studies
- **📝 Tech Blog** - Dev.to integration + custom posts (JSON → PostgreSQL migration ready)  
- **✉️ Contact Forms** - Lead capture → Supabase leads table
- **👨‍💼 Admin Dashboard** - Content management, leads dashboard
- **📱 Fully Responsive** - Mobile-first design (ongoing improvements)
- **⚡ Fast** - Static assets + compression + caching
- **🔒 Secure** - Helmet, rate limiting, session auth, RLS policies
- **🔍 SEO Optimized** - Sitemap, meta tags, structured data ready

## 🛠 Tech Stack

```
Frontend: HTML5 + Vanilla JS + CSS (no frameworks 🚀)
Backend: Node.js + Express.js
Database: PostgreSQL (Supabase) + perfect-schema.sql
Content: JSON files (migratable) + Dev.to RSS
Auth: Session-based admin dashboard
Deployment: Vercel/Netlify (static) + Supabase (DB)
```

## 📁 Project Structure

```
Kaostech/
├── public/                 # Static frontend
│   ├── css/               # Styles (responsive.css, blog.css)
│   ├── js/                # Client scripts
│   └── pages/             # HTML templates
├── server/                # Node.js backend
│   ├── routes/            # API endpoints (blog, leads, admin)
│   └── middleware/        # Auth, security
├── content/               # JSON content (→ DB migration)
│   ├── blog-posts.json    # 50+ imported posts
│   ├── portfolio.json     # Case studies
│   └── testimonials.json
├── database/              # Schema
│   └── perfect-schema.sql # Production PostgreSQL schema
├── admin/                 # Admin dashboard (protected)
└── TODO*.md              # AI Development roadmap
```

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/kaostech.git
cd Kaostech
cd server && npm install && cd ..
```

### 2. Environment Variables
```bash
# .env (create from .env.example)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key  
ADMIN_SESSION_SECRET=your_secret
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
CLIENT_URL=http://localhost:3000
```

### 3. Supabase Database
1. Create Supabase project
2. Run `database/perfect-schema.sql`
3. Update `.env` with your Supabase URL + keys

### 4. Migrate Content (Optional)
```bash
# Import JSON to DB (create migration script)
node server/scripts/migrate-content.js
```

### 5. Development
```bash
npm run dev  # or nodemon server/app.js
# Visit http://localhost:3000
```

## 🌐 Supabase Setup

**Production-ready schema:** `database/perfect-schema.sql`

**Features:**
```
✅ Full-text search (blogs)
✅ Row Level Security (RLS)
✅ Categories/Tags normalization
✅ Leads pipeline tracking
✅ Portfolio analytics
✅ Admin users (bcrypt ready)
✅ Indexes + constraints
```

```sql
-- Connect Supabase → SQL Editor → Run perfect-schema.sql
-- All migrations included!
```

## 📝 Content Management

**Current:** JSON files (content/)
```
📂 blog-posts.json (50+ Dev.to imports + custom)
📂 portfolio.json (8 case studies)  
📂 testimonials.json
```

**Future:** Full Supabase (blog_posts, portfolio tables ready)

**Admin Dashboard:** `/admin` (login: env vars)

## 👨‍💼 Admin Features

- **Content:** Blog CRUD, portfolio management
- **Leads:** Contact form submissions + status tracking
- **Dev.to:** Auto-import RSS feeds
- **Analytics:** Page views tracking

```
Username: $ADMIN_USER
Password: $ADMIN_PASSWORD
Session: 2hr cookie
```

## 📱 Responsive Design

**Status:** Mobile-first foundation complete
**Todo:** Featured posts scaling (TODO-blog-responsive.md)

```
✅ Mobile navigation
✅ Card layouts responsive  
✅ Image optimization
🔄 Popular articles → mobile cards (in progress)
```

## 🔧 Development Roadmap

**Active TODOs:**
```
📋 TODO-categories-expander.md → Category filtering
📋 TODO-blog-responsive.md → Mobile featured posts
📋 CSS-RESPONSIVE-TODO.md → Final responsive polish
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Static hosting
vercel --prod

# Backend as serverless functions
vercel --prod server/
```

### Supabase Edge Functions (Advanced)
```
# Run server/app.js as Edge Function
# Connect to same Supabase DB
```

### Docker (Production)
```dockerfile
# docker-compose.yml included
docker-compose up -d
```

## 🤝 Contributing

1. Fork → Clone → Create `feat/xxx` branch
2. `npm install` (server/)
3. Create feature → Test locally  
4. PR to `main` with clear description

**Good first issues:** TODO files!

## 📊 Live Demo

[Kaos Tech](https://kaostech.onrender.com)

## 📞 Contact

- 💼 **Projects**: hello@kaostech.dev  
- 🐛 **Issues**: GitHub Issues
- 💬 **Chat**: Discord (link)

---

**Built with ❤️ by Kaos Tech** | [Twitter](https://twitter.com/kaostech) | [Portfolio](https://kaostech.onrender.com)
