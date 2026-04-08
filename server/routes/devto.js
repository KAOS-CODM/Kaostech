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

// NEW: Full content import endpoint
router.post('/import', async (req, res) => {
    try {
        const usernames = readUsernames();
        const blogPostsFile = path.join(__dirname, '../../content/blog-posts.json');
        
        // Read existing local posts
        let existingPosts = [];
        if (fs.existsSync(blogPostsFile)) {
            existingPosts = JSON.parse(fs.readFileSync(blogPostsFile, 'utf-8'));
        }
        
        const postMap = new Map();
        const imported = [];
        
        // Preserve existing local/featured posts
        existingPosts.forEach(post => {
            if (post.source === 'local' || post.featured) {
                postMap.set(post.id || post.slug, post);
            }
        });
        
        // Import from each Dev.to username
        for (const username of usernames) {
            console.log(`Importing from Dev.to username: ${username}`);
            const apiUrl = `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=100`;
            
            const response = await fetch(apiUrl);
            const articles = await response.json();
            
            articles.forEach(article => {
                const post = {
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.description || article.cover_image ? '' : (article.body_medium || '').slice(0, 160) + '...',
                    content: article.body_html || article.body_markdown,
                    author: article.user?.name || `Dev.to (${username})`,
                    category: article.tag_list?.[0] || 'insights',
                    tags: article.tag_list || [],
                    featuredImage: article.cover_image || '/assets/blog/cms-guide.jpg',
                    publishedAt: article.published_at,
                    readTime: article.reading_time_minutes ? `${article.reading_time_minutes} min read` : '5 min read',
                    featured: false,
                    source: 'devto',
                    sourceUrl: `https://dev.to/${article.user.username}/${article.slug}`
                };
                
                postMap.set(article.id, post);
                imported.push(article.id);
            });
        }
        
        // Write updated posts
        const updatedPosts = Array.from(postMap.values())
            .sort((a, b) => new Date(b.publishedAt || b.published_at) - new Date(a.publishedAt || a.published_at));
        
        fs.writeFileSync(blogPostsFile, JSON.stringify(updatedPosts, null, 2), 'utf-8');
        
        res.json({
            success: true,
            imported: imported.length,
            totalPosts: updatedPosts.length,
            usernames: usernames,
            file: '/content/blog-posts.json'
        });
        
    } catch (error) {
        console.error('Dev.to import error:', error);
        res.status(500).json({ error: 'Import failed', details: error.message });
    }
});

module.exports = router;
