const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const blogFile = path.join(__dirname, '../content/blog.json');

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
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const blogs = readBlogs();
    const newBlog = {
      id: Date.now(),  // unique id
      title,
      content
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

// DELETE blog
router.delete('/:id', (req, res) => {
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

module.exports = router;
