document.addEventListener('DOMContentLoaded', () => {
  const blogForm = document.getElementById('blogForm');
  const blogTitle = document.getElementById('blogTitle');
  const blogContent = document.getElementById('blogContent');
  const blogList = document.getElementById('blogList');

  // Fetch and render blogs
  async function fetchBlogs() {
    try {
      const res = await fetch('/api/blog');
      const blogs = await res.json();
      blogList.innerHTML = '';
      blogs.forEach(blog => {
        const li = document.createElement('li');
        li.textContent = blog.title;
        li.dataset.id = blog.id;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.marginLeft = '10px';
        delBtn.addEventListener('click', async () => {
          try {
            const res = await fetch(`/api/blog/${blog.id}`, { method: 'DELETE' });
            if (res.ok) {
              console.log('Deleted blog', blog.id);
              fetchBlogs();
            } else {
              console.error('Failed to delete blog');
            }
          } catch (err) {
            console.error(err);
          }
        });

        li.appendChild(delBtn);
        blogList.appendChild(li);
      });
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
  }

  fetchBlogs();

  // Handle new blog submission
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = blogTitle.value.trim();
    const content = blogContent.value.trim();

    if (!title || !content) {
      alert('Please enter title and content');
      return;
    }

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Blog added:', data);
        blogTitle.value = '';
        blogContent.value = '';
        fetchBlogs();
      } else {
        console.error('Failed to add blog:', data.message);
      }
    } catch (err) {
      console.error(err);
    }
  });
});
