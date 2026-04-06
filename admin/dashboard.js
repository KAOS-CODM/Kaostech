// Global variables
let allBlogs = [];
let editingBlogId = null;
let devtoPosts = [];
let savedDevtoUsernames = [];

// DOM elements (will be set when DOM is ready)
let blogForm, formTitle, submitBtn, cancelBtn, blogTitle, blogExcerpt, blogContent,
    blogCategory, blogTags, blogFeaturedImage, blogFeatured, blogSource, blogSourceUrl, blogTable,
    searchInput, categoryFilter, featuredFilter, selectAllCheckbox,
    bulkActions, bulkDeleteBtn, selectAllBtn,
    devtoUsernameInput, savedDevtoUsernamesSelect, fetchDevtoBtn, saveDevtoUsernameBtn,
    devtoPostsContainer, devtoMessage;

// Global functions
function updateBulkActionsVisibility() {
  if (!bulkActions) return;
  const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');
  bulkActions.style.display = checkedBoxes.length > 0 ? 'block' : 'none';
}

// Global fetch blogs function
function fetchBlogs() {
  console.log('Fetching blogs from API');
  fetch('/api/blog')
    .then(r => {
      console.log('Blog API response status:', r.status);
      return r.json();
    })
    .then(blogs => {
      console.log('Blogs received:', blogs.length, 'blogs');
      allBlogs = blogs;
      renderBlogs(allBlogs);
    })
    .catch(err => console.error('Failed to fetch blogs:', err));
}

// Global render blogs function
function renderBlogs(blogs) {
  if (!blogTable) {
    console.error('blogTable element not found');
    return;
  }
  console.log('Rendering', blogs.length, 'blogs');
  blogTable.innerHTML = '';
  blogs.forEach(blog => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="blog-checkbox" data-id="${blog.id}" /></td>
      <td>${blog.id || 'N/A'}</td>
      <td>${blog.title}</td>
      <td>${blog.category || 'N/A'}</td>
      <td>${blog.featured ? '✓' : ''}</td>
      <td>${blog.publishedAt || 'N/A'}</td>
      <td>
        <button class="action-btn edit-btn" data-blog-id="${blog.id}">Edit</button>
        <button class="action-btn delete-btn" data-blog-id="${blog.id}">Delete</button>
        <button class="action-btn preview-btn" data-blog-id="${blog.id}">Preview</button>
      </td>
    `;
    blogTable.appendChild(tr);
  });
  updateBulkActionsVisibility();
  console.log('Blogs rendered successfully');
}

async function loadSavedDevtoUsernames() {
  try {
    const res = await fetch('/api/devto/usernames');
    if (!res.ok) throw new Error(`Failed to load usernames (${res.status})`);
    savedDevtoUsernames = await res.json();
  } catch (err) {
    console.warn('Failed to load saved Dev.to usernames:', err);
    savedDevtoUsernames = [];
  }
}

async function saveDevtoUsername(username) {
  if (!username) return;
  try {
    const res = await fetch('/api/devto/usernames', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    if (!res.ok) {
      throw new Error(`Failed to save username (${res.status})`);
    }

    savedDevtoUsernames = await res.json();
    renderDevtoUsernameOptions();
  } catch (err) {
    console.error('Failed to save Dev.to username:', err);
    setDevtoMessage('Unable to save username. Please try again.', true);
  }
}

function renderDevtoUsernameOptions() {
  if (!savedDevtoUsernamesSelect) return;
  const options = ['<option value="">Select saved username</option>'];
  savedDevtoUsernames.forEach(username => {
    options.push(`<option value="${username}">${username}</option>`);
  });
  savedDevtoUsernamesSelect.innerHTML = options.join('');
}

function setDevtoMessage(text, isError = false) {
  if (!devtoMessage) return;
  devtoMessage.textContent = text;
  devtoMessage.style.color = isError ? '#fca5a5' : '#d1d5db';
}

async function fetchDevtoPosts(username) {
  if (!username) {
    setDevtoMessage('Please enter a Dev.to username.', true);
    return;
  }

  setDevtoMessage(`Fetching posts for ${username}...`);
  try {
    const res = await fetch(`/api/devto?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error(`Dev.to fetch failed with status ${res.status}`);
    }

    const posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      setDevtoMessage('No posts were found for that username.', true);
      devtoPosts = [];
      renderDevtoPosts();
      return;
    }

    devtoPosts = posts;
    setDevtoMessage(`Loaded ${posts.length} Dev.to post(s). Preview and import the one you want.`);
    renderDevtoPosts();
  } catch (err) {
    console.error('Dev.to fetch error:', err);
    setDevtoMessage('Unable to fetch Dev.to posts. Please check the username and try again.', true);
    devtoPosts = [];
    renderDevtoPosts();
  }
}

function renderDevtoPosts() {
  if (!devtoPostsContainer) return;
  if (!devtoPosts.length) {
    devtoPostsContainer.innerHTML = '<p>No Dev.to posts loaded yet.</p>';
    return;
  }

  devtoPostsContainer.innerHTML = devtoPosts.map(post => {
    const cover = post.cover_image || post.social_image || post.user?.profile_image || '/assets/blog/default.jpg';
    const excerpt = post.description || post.title || 'No description available';
    const author = post.user?.name || post.user?.username || 'Dev.to User';
    const tags = Array.isArray(post.tag_list) ? post.tag_list.join(', ') : '';
    const publishedAt = post.published_at ? new Date(post.published_at).toLocaleDateString() : '';

    return `
      <div class="devto-post" data-id="${post.id}">
        <img src="${cover}" alt="${post.title}" />
        <div class="devto-post-content">
          <div class="devto-meta">
            <span>${author}</span>
            <span>${publishedAt}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${excerpt}</p>
          <p><strong>Tags:</strong> ${tags}</p>
        </div>
        <div class="devto-actions">
          <button type="button" class="import-devto-btn" data-id="${post.id}">Import</button>
          <a href="${post.url}" target="_blank" rel="noopener noreferrer">View on Dev.to</a>
        </div>
      </div>`;
  }).join('');
}

function importDevtoPost(postId) {
  const post = devtoPosts.find(p => String(p.id) === String(postId));
  if (!post) {
    alert('Selected Dev.to post could not be found.');
    return;
  }

  const excerpt = post.description || '';
  const content = `${excerpt}\n\nImported from Dev.to: ${post.url}`;

  if (blogTitle) blogTitle.value = post.title || '';
  if (blogExcerpt) blogExcerpt.value = excerpt;
  if (blogContent) blogContent.value = content;
  if (blogCategory) blogCategory.value = (post.tag_list && post.tag_list.length) ? post.tag_list[0] : 'insights';
  if (blogTags) blogTags.value = (post.tag_list || []).join(', ');
  if (blogFeaturedImage) blogFeaturedImage.value = post.cover_image || post.social_image || '/assets/blog/default.jpg';
  if (blogSource) blogSource.value = 'devto';
  if (blogSourceUrl) blogSourceUrl.value = post.url || '';

  if (formTitle) formTitle.textContent = 'Import Dev.to Post';
  if (submitBtn) submitBtn.textContent = 'Save Imported Post';
  if (cancelBtn) cancelBtn.classList.add('visible');

  if (blogForm) blogForm.scrollIntoView({ behavior: 'smooth' });
}

// Global filter function
function filterBlogs() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const categoryValue = categoryFilter ? categoryFilter.value : '';
  const featuredValue = featuredFilter ? featuredFilter.value : '';

  let filteredBlogs = allBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm) ||
                         blog.content.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryValue || blog.category === categoryValue;
    const matchesFeatured = !featuredValue ||
                           (featuredValue === 'true' && blog.featured) ||
                           (featuredValue === 'false' && !blog.featured);

    return matchesSearch && matchesCategory && matchesFeatured;
  });

  renderBlogs(filteredBlogs);
}

// Global reset form function
function resetForm() {
  if (!blogForm) return;
  console.log('Resetting form');
  editingBlogId = null;
  if (formTitle) formTitle.textContent = 'Add Blog';
  if (submitBtn) submitBtn.textContent = 'Add Blog';
  if (cancelBtn) cancelBtn.classList.remove('visible');
  blogForm.reset();
  if (blogFeaturedImage) blogFeaturedImage.value = '/assets/blog/default.jpg';
  if (blogSource) blogSource.value = 'local';
  if (blogSourceUrl) blogSourceUrl.value = '';
  console.log('Form reset complete');
}

// Global populate form function
function populateForm(blog) {
  if (!formTitle || !submitBtn || !cancelBtn) {
    console.error('Form elements not found');
    return;
  }
  
  console.log('Populating form for blog ID:', blog.id);
  editingBlogId = blog.id;
  formTitle.textContent = 'Edit Blog';
  submitBtn.textContent = 'Update Blog';
  cancelBtn.classList.add('visible');

  if (blogTitle) blogTitle.value = blog.title;
  if (blogExcerpt) blogExcerpt.value = blog.excerpt || '';
  if (blogContent) blogContent.value = blog.content;
  if (blogCategory) blogCategory.value = blog.category || 'insights';
  if (blogTags) blogTags.value = (blog.tags || []).join(', ');
  if (blogFeaturedImage) blogFeaturedImage.value = blog.featuredImage || '/assets/blog/default.jpg';
  if (blogFeatured) blogFeatured.checked = blog.featured || false;
  console.log('Form populated successfully');
}

// Global delete blog function
async function deleteBlog(id) {
  console.log('Delete blog requested for ID:', id);
  if (!confirm('Are you sure you want to delete this blog?')) {
    console.log('Delete cancelled');
    return;
  }

  try {
    console.log('Sending DELETE request to /api/blog/' + id);
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    console.log('Delete response status:', res.status);
    
    if (res.ok) {
      console.log('Blog deleted successfully:', id);
      fetchBlogs();
      alert('Blog deleted successfully!');
    } else {
      console.error('Delete failed with status:', res.status);
      alert('Failed to delete blog');
    }
  } catch (err) {
    console.error('Delete fetch error:', err);
    alert('Error deleting blog: ' + err.message);
  }
}

// Global edit blog function
function editBlog(id) {
  console.log('Edit blog requested for ID:', id);
  fetch('/api/blog')
    .then(r => {
      console.log('Edit fetch response status:', r.status);
      return r.json();
    })
    .then(blogs => {
      console.log('All blogs received, searching for ID:', id);
      const blog = blogs.find(b => b.id == id);
      if (blog) {
        console.log('Blog found:', blog.title);
        populateForm(blog);
        // Scroll to form
        if (blogForm) {
          console.log('Scrolling to form');
          blogForm.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        console.error('Blog with ID', id, 'not found');
        alert('Blog not found');
      }
    })
    .catch(err => {
      console.error('Failed to load blog for editing:', err);
      alert('Error loading blog for editing');
    });
}

// Global preview blog function
function previewBlog(id) {
  console.log('Preview blog requested for ID:', id);
  fetch('/api/blog')
    .then(r => {
      console.log('Preview fetch response status:', r.status);
      return r.json();
    })
    .then(blogs => {
      console.log('All blogs received, searching for ID:', id);
      const blog = blogs.find(b => b.id == id);
      if (blog) {
        console.log('Blog found for preview:', blog.title);
        showPreviewModal(blog);
      } else {
        console.error('Blog with ID', id, 'not found');
        alert('Blog not found');
      }
    })
    .catch(err => {
      console.error('Failed to load blog for preview:', err);
      alert('Error loading blog for preview');
    });
}

// Global modal function
function showPreviewModal(blog) {
  const modal = document.getElementById('previewModal');
  if (!modal) {
    console.error('Preview modal element not found');
    return;
  }
  
  console.log('Opening preview modal for blog:', blog.title);
  const modalTitle = document.getElementById('modalTitle');
  const modalAuthor = document.getElementById('modalAuthor');
  const modalDate = document.getElementById('modalDate');
  const modalCategory = document.getElementById('modalCategory');
  const modalReadTime = document.getElementById('modalReadTime');
  const modalExcerpt = document.getElementById('modalExcerpt');
  const modalContent = document.getElementById('modalContent');

  if (modalTitle) modalTitle.textContent = blog.title;
  if (modalAuthor) modalAuthor.textContent = blog.author || 'Unknown Author';
  if (modalDate) modalDate.textContent = new Date(blog.publishedAt).toLocaleDateString();
  if (modalCategory) modalCategory.textContent = blog.category || 'Uncategorized';
  if (modalReadTime) modalReadTime.textContent = blog.readTime || '5 min read';
  if (modalExcerpt) modalExcerpt.textContent = blog.excerpt || '';
  if (modalContent) modalContent.textContent = blog.content || '';

  modal.style.display = 'block';
  console.log('Modal displayed');

  // Close modal functionality
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      console.log('Closing modal');
      modal.style.display = 'none';
    };
  }

  // Close modal when clicking outside
  window.onclick = (event) => {
    if (event.target === modal) {
      console.log('Closing modal (clicked outside)');
      modal.style.display = 'none';
    }
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard DOMContentLoaded triggered');
  // Set DOM elements
  blogForm = document.getElementById('addBlogForm');
  formTitle = document.getElementById('formTitle');
  submitBtn = document.getElementById('submitBtn');
  cancelBtn = document.getElementById('cancelBtn');
  blogTitle = document.getElementById('blogTitle');
  blogExcerpt = document.getElementById('blogExcerpt');
  blogContent = document.getElementById('blogContent');
  blogCategory = document.getElementById('blogCategory');
  blogTags = document.getElementById('blogTags');
  blogFeaturedImage = document.getElementById('blogFeaturedImage');
  blogFeatured = document.getElementById('blogFeatured');
  blogSource = document.getElementById('blogSource');
  blogSourceUrl = document.getElementById('blogSourceUrl');
  blogTable = document.getElementById('blogTable');
  searchInput = document.getElementById('searchInput');
  categoryFilter = document.getElementById('categoryFilter');
  featuredFilter = document.getElementById('featuredFilter');
  selectAllCheckbox = document.getElementById('selectAllCheckbox');
  bulkActions = document.querySelector('.bulk-actions');
  bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
  selectAllBtn = document.getElementById('selectAllBtn');
  devtoUsernameInput = document.getElementById('devtoUsernameInput');
  savedDevtoUsernamesSelect = document.getElementById('savedDevtoUsernames');
  fetchDevtoBtn = document.getElementById('fetchDevtoBtn');
  saveDevtoUsernameBtn = document.getElementById('saveDevtoUsernameBtn');
  devtoPostsContainer = document.getElementById('devtoPostsContainer');
  devtoMessage = document.getElementById('devtoMessage');

  console.log('All DOM elements initialized');

  await loadSavedDevtoUsernames();
  renderDevtoUsernameOptions();

  if (fetchDevtoBtn) {
    fetchDevtoBtn.addEventListener('click', () => {
      const username = (devtoUsernameInput?.value || '').trim();
      fetchDevtoPosts(username);
    });
  }

  if (saveDevtoUsernameBtn) {
    saveDevtoUsernameBtn.addEventListener('click', async () => {
      const username = (devtoUsernameInput?.value || '').trim();
      if (!username) {
        setDevtoMessage('Enter a Dev.to username before saving.', true);
        return;
      }
      await saveDevtoUsername(username);
      setDevtoMessage(`Saved ${username} for future use.`);
    });
  }

  if (savedDevtoUsernamesSelect) {
    savedDevtoUsernamesSelect.addEventListener('change', (e) => {
      const username = e.target.value;
      if (username) {
        if (devtoUsernameInput) devtoUsernameInput.value = username;
        fetchDevtoPosts(username);
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('import-devto-btn')) {
      const postId = e.target.dataset.id;
      importDevtoPost(postId);
    }
  });

  // Event delegation for action buttons (Edit, Delete, Preview)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const blogId = parseInt(e.target.dataset.blogId);
      console.log('Edit button clicked for blog ID:', blogId);
      editBlog(blogId);
    } else if (e.target.classList.contains('delete-btn')) {
      const blogId = parseInt(e.target.dataset.blogId);
      console.log('Delete button clicked for blog ID:', blogId);
      deleteBlog(blogId);
    } else if (e.target.classList.contains('preview-btn')) {
      const blogId = parseInt(e.target.dataset.blogId);
      console.log('Preview button clicked for blog ID:', blogId);
      previewBlog(blogId);
    }
  });

  // Handle form submission (add/edit)
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted, editingBlogId:', editingBlogId);
      const title = blogTitle.value.trim();
      const excerpt = blogExcerpt.value.trim() || blogContent.value.substring(0, 150) + (blogContent.value.length > 150 ? '...' : '');
      const content = blogContent.value.trim();
      const category = blogCategory.value;
      const tags = blogTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      const featuredImage = blogFeaturedImage.value.trim() || '/assets/blog/default.jpg';
      const featured = blogFeatured.checked;

      if (!title || !content) {
        alert('Please enter title and content');
        return;
      }

      const blogData = {
        title,
        excerpt,
        content,
        category,
        tags,
        featuredImage,
        featured,
        source: blogSource?.value || 'local',
        sourceUrl: blogSourceUrl?.value || ''
      };

      try {
        const method = editingBlogId ? 'PUT' : 'POST';
        const url = editingBlogId ? `/api/blog/${editingBlogId}` : '/api/blog';

        console.log('Sending', method, 'request to', url);
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogData)
        });

        const data = await res.json();
        if (res.ok) {
          console.log('Blog saved:', data);
          resetForm();
          fetchBlogs();
          alert(`Blog ${editingBlogId ? 'updated' : 'added'} successfully!`);
        } else {
          console.error('Failed to save blog:', data.message);
          alert('Error saving blog: ' + data.message);
        }
      } catch (err) {
        console.error('Form submission error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Cancel editing
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log('Cancel button clicked');
      resetForm();
    });
  }

  // Search and filter event listeners
  if (searchInput) searchInput.addEventListener('input', filterBlogs);
  if (categoryFilter) categoryFilter.addEventListener('change', filterBlogs);
  if (featuredFilter) featuredFilter.addEventListener('change', filterBlogs);

  // Select all functionality
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      console.log('Select all checkbox changed');
      const checkboxes = document.querySelectorAll('.blog-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
      updateBulkActionsVisibility();
    });
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      console.log('Select all button clicked');
      const checkboxes = document.querySelectorAll('.blog-checkbox');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
      if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;
      updateBulkActionsVisibility();
    });
  }

  // Bulk delete
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      console.log('Bulk delete button clicked');
      const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');
      const idsToDelete = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.id));

      if (idsToDelete.length === 0) {
        alert('Please select blogs to delete');
        return;
      }

      if (!confirm(`Are you sure you want to delete ${idsToDelete.length} blog(s)?`)) {
        return;
      }

      try {
        const deletePromises = idsToDelete.map(id =>
          fetch(`/api/blog/${id}`, { method: 'DELETE' })
        );

        await Promise.all(deletePromises);
        console.log('Bulk delete completed');
        fetchBlogs();
        alert(`${idsToDelete.length} blog(s) deleted successfully!`);
      } catch (err) {
        console.error('Bulk delete failed:', err);
        alert('Error deleting blogs: ' + err.message);
      }
    });
  }

  // Update bulk actions on checkbox change
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('blog-checkbox')) {
      updateBulkActionsVisibility();
      const checkboxes = document.querySelectorAll('.blog-checkbox');
      const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
      }
    }
  });

  // Initial fetch
  console.log('Fetching initial blog list');
  fetchBlogs();
});
