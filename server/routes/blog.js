const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const blogFile = path.join(__dirname, '../../content/blog-posts.json');

// Read blogs
function readBlogs() {
  if (!fs.existsSync(blogFile)) {
    fs.writeFileSync(blogFile, '[]', 'utf-8');
  }
  const data = fs.readFileSync(blogFile, 'utf-8');
  return JSON.parse(data);
}

// Write blogs
function writeBlogs(blogs) {
  fs.writeFileSync(blogFile, JSON.stringify(blogs, null, 2));
}

// GET all blogs
router.get('/', (req, res) => {
  try {
    const blogs = readBlogs();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read blogs', error: err.message });
  }
});

// POST new blog
router.post('/', (req, res) => {
  const { title, excerpt, content, category, tags, featuredImage, featured } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const blogs = readBlogs();
    const newBlog = {
      id: Date.now(),
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      excerpt: excerpt || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      content,
      author: 'Kaos Tech Team',
      publishedAt: new Date().toISOString().split('T')[0],
      category: category || 'insights',
      tags: tags || ['blog'],
      featuredImage: featuredImage || '/assets/blog/default.jpg',
      readTime: Math.ceil(content.split(' ').length / 200) + ' min read',
      featured: featured || false
    };

    blogs.push(newBlog);
    writeBlogs(blogs);

    console.log('Blog added:', newBlog);
    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Error adding blog:', err);
    res.status(500).json({ message: 'Failed to add blog', error: err.message });
  }
});

// GET blog by slug (for pretty URLs)
router.get('/slug/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.slug === slug);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get blog', error: err.message });
  }
});

// GET blog by ID
router.get('/:id', (req, res) => {
  const blogId = Number(req.params.id);
  try {
    let blogs = readBlogs();
    const exists = blogs.find(b => b.id === blogId);
    if (!exists) return res.status(404).json({ message: 'Blog not found' });

    blogs = blogs.filter(b => b.id !== blogId);
    writeBlogs(blogs);

    console.log('Blog deleted:', blogId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ message: 'Failed to delete blog', error: err.message });
  }
});

// PUT update blog
router.put('/:id', (req, res) => {
  const blogId = Number(req.params.id);
  const { title, excerpt, content, category, tags, featuredImage, featured } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    let blogs = readBlogs();
    const blogIndex = blogs.findIndex(b => b.id === blogId);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updatedBlog = {
      ...blogs[blogIndex],
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      excerpt: excerpt || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      content,
      category: category || 'insights',
      tags: tags || ['blog'],
      featuredImage: featuredImage || '/assets/blog/default.jpg',
      readTime: Math.ceil(content.split(' ').length / 200) + ' min read',
      featured: featured || false
    };

    blogs[blogIndex] = updatedBlog;
    writeBlogs(blogs);

    console.log('Blog updated:', updatedBlog);
    res.json(updatedBlog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ message: 'Failed to update blog', error: err.message });
  }
});

module.exports = router;
