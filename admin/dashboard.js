// =====================================================
// Full Unified Dashboard JS - Blogs + Leads + Dev.to
// =====================================================

// ===== SIMPLE TOAST FUNCTION =====
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(400px); opacity: 0; transition: all 0.3s ease; max-width: 350px;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== GLOBAL VARIABLES =====
let allBlogs = [];
let allQuotes = [];
let editingBlogId = null;

let devtoPosts = [];
let savedDevtoUsernames = [];

// ===== DOM ELEMENTS =====
let blogForm, formTitle, submitBtn, cancelBtn;
let blogTitle, blogExcerpt, blogContent, blogCategory, blogTags;
let blogFeaturedImage, blogFeatured, blogSource, blogSourceUrl;
let blogTable, searchInput, categoryFilter, featuredFilter;
let selectAllCheckbox, bulkActions, bulkDeleteBtn, selectAllBtn;

let leadsTable, leadsSearch, leadsFilter, leadsCount;

let devtoUsernameInput, savedDevtoUsernamesSelect, fetchDevtoBtn, saveDevtoUsernameBtn;
let devtoPostsContainer, devtoMessage;

let refreshLeadsBtn;
let blogTab, leadsTab;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🟢 Unified Admin Dashboard Loaded');

  initElements();
  setupEventListeners();

  await Promise.all([
    loadBlogs(),
    loadQuotes(),
    loadSavedDevtoUsernames()
  ]);

  renderDevtoUsernameOptions();
  renderBlogs(allBlogs);
  renderLeadsTable(allQuotes);

  console.log('✅ Dashboard JS Ready - Blogs + Leads + Dev.to Enabled');
});

// ===== ELEMENT INITIALIZATION =====
function initElements() {
  // Blog form elements
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

  // Blog table and filters
  blogTable = document.getElementById('blogTable');
  searchInput = document.getElementById('searchInput');
  categoryFilter = document.getElementById('categoryFilter');
  featuredFilter = document.getElementById('featuredFilter');

  // Bulk actions
  selectAllCheckbox = document.getElementById('selectAllCheckbox');
  bulkActions = document.querySelector('.bulk-actions');
  bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
  selectAllBtn = document.getElementById('selectAllBtn');

  // Leads elements
  leadsTable = document.getElementById('leadsTable');
  leadsSearch = document.getElementById('leadsSearch');
  leadsFilter = document.getElementById('leadsFilter');
  leadsCount = document.getElementById('leadsCount');
  refreshLeadsBtn = document.getElementById('refreshLeadsBtn');

  // Tabs
  blogTab = document.querySelector('[data-tab="blog"]') || document.querySelector('.tab[data-tab="blog"]');
  leadsTab = document.querySelector('[data-tab="leads"]') || document.querySelector('.tab[data-tab="leads"]');

  // Dev.to elements
  devtoUsernameInput = document.getElementById('devtoUsernameInput');
  savedDevtoUsernamesSelect = document.getElementById('savedDevtoUsernames');
  fetchDevtoBtn = document.getElementById('fetchDevtoBtn');
  saveDevtoUsernameBtn = document.getElementById('saveDevtoUsernameBtn');
  devtoPostsContainer = document.getElementById('devtoPostsContainer');
  devtoMessage = document.getElementById('devtoMessage');
}

// ===== BLOG LOADING =====
async function loadBlogs() {
  try {
    const res = await fetch('/api/blog');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    allBlogs = await res.json();
    console.log(`📚 Loaded ${allBlogs.length} blogs`);
    renderBlogs(allBlogs);
  } catch (e) {
    console.error('Blogs load failed:', e);
    allBlogs = [];
    renderBlogs([]);
  }
}

// Alias so both old names still work
function fetchBlogs() {
  return loadBlogs();
}

// ===== BLOG RENDERING =====
function renderBlogs(blogs = allBlogs) {
  if (!blogTable) {
    console.error('blogTable element not found');
    return;
  }

  console.log('Rendering', blogs.length, 'blogs');

  const tbody = blogTable.querySelector('tbody') || blogTable;
  if (!tbody) return;

  if (!blogs.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-data">No blogs found</td>
      </tr>
    `;
    updateBulkActionsVisibility();
    return;
  }

  tbody.innerHTML = blogs.map(blog => `
    <tr>
      <td><input type="checkbox" class="blog-checkbox" data-id="${blog.id}" /></td>
      <td>${escapeHtml(String(blog.id || 'N/A'))}</td>
      <td>${escapeHtml(blog.title || '')}</td>
      <td>${escapeHtml(blog.category || 'N/A')}</td>
      <td>${blog.featured ? '✓' : ''}</td>
      <td>${escapeHtml(blog.publishedAt || 'N/A')}</td>
      <td>
        <button class="action-btn edit-btn" data-blog-id="${blog.id}">Edit</button>
        <button class="action-btn delete-btn" data-blog-id="${blog.id}">Delete</button>
        <button class="action-btn preview-btn" data-blog-id="${blog.id}">Preview</button>
      </td>
    </tr>
  `).join('');

  updateBulkActionsVisibility();
  console.log('Blogs rendered successfully');
}

// ===== BLOG FILTERING =====
function filterBlogs() {
  const searchTerm = (searchInput?.value || '').toLowerCase();
  const categoryValue = categoryFilter?.value || '';
  const featuredValue = featuredFilter?.value || '';

  const filteredBlogs = allBlogs.filter(blog => {
    const title = (blog.title || '').toLowerCase();
    const content = (blog.content || '').toLowerCase();
    const category = blog.category || '';

    const matchesSearch = title.includes(searchTerm) || content.includes(searchTerm);
    const matchesCategory = !categoryValue || category === categoryValue;
    const matchesFeatured =
      !featuredValue ||
      (featuredValue === 'true' && blog.featured) ||
      (featuredValue === 'false' && !blog.featured);

    return matchesSearch && matchesCategory && matchesFeatured;
  });

  renderBlogs(filteredBlogs);
}

// ===== BULK ACTIONS =====
function updateBulkActionsVisibility() {
  if (!bulkActions) return;
  const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');
  bulkActions.style.display = checkedBoxes.length > 0 ? 'block' : 'none';
}

// ===== RESET BLOG FORM =====
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

// ===== POPULATE FORM FOR EDITING =====
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

  if (blogTitle) blogTitle.value = blog.title || '';
  if (blogExcerpt) blogExcerpt.value = blog.excerpt || '';
  if (blogContent) blogContent.value = blog.content || '';
  if (blogCategory) blogCategory.value = blog.category || 'insights';
  if (blogTags) blogTags.value = Array.isArray(blog.tags) ? blog.tags.join(', ') : '';
  if (blogFeaturedImage) blogFeaturedImage.value = blog.featuredImage || '/assets/blog/default.jpg';
  if (blogFeatured) blogFeatured.checked = !!blog.featured;

  if (blogSource) blogSource.value = blog.source || 'local';
  if (blogSourceUrl) blogSourceUrl.value = blog.sourceUrl || '';

  console.log('Form populated successfully');
}

// ===== DELETE BLOG =====
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
      await loadBlogs();
      showToast('Blog deleted successfully!', 'success');
    } else {
      console.error('Delete failed with status:', res.status);
      showToast('Failed to delete blog', 'error');
    }
  } catch (err) {
    console.error('Delete fetch error:', err);
    showToast('Error deleting blog: ' + err.message, 'error');
  }
}

// ===== EDIT BLOG =====
function editBlog(id) {
  console.log('Edit blog requested for ID:', id);

  fetch('/api/blog')
    .then(r => {
      console.log('Edit fetch response status:', r.status);
      return r.json();
    })
    .then(blogs => {
      console.log('All blogs received, searching for ID:', id);
      const blog = blogs.find(b => String(b.id) == String(id));

      if (blog) {
        console.log('Blog found:', blog.title);
        populateForm(blog);

        if (blogForm) {
          console.log('Scrolling to form');
          blogForm.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        console.error('Blog with ID', id, 'not found');
        showToast('Blog not found', 'error');
      }
    })
    .catch(err => {
      console.error('Failed to load blog for editing:', err);
      showToast('Error loading blog for editing', 'error');
    });
}

// ===== PREVIEW BLOG =====
function previewBlog(id) {
  console.log('Preview blog requested for ID:', id);

  fetch('/api/blog')
    .then(r => {
      console.log('Preview fetch response status:', r.status);
      return r.json();
    })
    .then(blogs => {
      console.log('All blogs received, searching for ID:', id);
      const blog = blogs.find(b => String(b.id) == String(id));

      if (blog) {
        console.log('Blog found for preview:', blog.title);
        showPreviewModal(blog);
      } else {
        console.error('Blog with ID', id, 'not found');
        showToast('Blog not found', 'error');
      }
    })
    .catch(err => {
      console.error('Failed to load blog for preview:', err);
      showToast('Error loading blog for preview', 'error');
    });
}

// ===== PREVIEW MODAL =====
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

  if (modalTitle) modalTitle.textContent = blog.title || '';
  if (modalAuthor) modalAuthor.textContent = blog.author || 'Unknown Author';
  if (modalDate) modalDate.textContent = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'N/A';
  if (modalCategory) modalCategory.textContent = blog.category || 'Uncategorized';
  if (modalReadTime) modalReadTime.textContent = blog.readTime || '5 min read';
  if (modalExcerpt) modalExcerpt.textContent = blog.excerpt || '';
  if (modalContent) modalContent.textContent = blog.content || '';

  modal.style.display = 'block';
  console.log('Modal displayed');

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      console.log('Closing modal');
      modal.style.display = 'none';
    };
  }

  window.onclick = (event) => {
    if (event.target === modal) {
      console.log('Closing modal (clicked outside)');
      modal.style.display = 'none';
    }
  };
}

// ===== BLOG FORM SUBMISSION =====
async function handleBlogSubmit(e) {
  e.preventDefault();

  if (!blogTitle || !blogContent || !blogCategory || !blogTags || !blogFeaturedImage || !blogFeatured) {
    showToast('Blog form elements are missing.', 'error');
    return;
  }

  console.log('Form submitted, editingBlogId:', editingBlogId);

  const title = blogTitle.value.trim();
  const content = blogContent.value.trim();
  const excerpt =
    blogExcerpt?.value.trim() ||
    content.substring(0, 150) + (content.length > 150 ? '...' : '');
  const category = blogCategory.value;
  const tags = blogTags.value.split(',').map(tag => tag.trim()).filter(Boolean);
  const featuredImage = blogFeaturedImage.value.trim() || '/assets/blog/default.jpg';
  const featured = blogFeatured.checked;

  if (!title || !content) {
    showToast('Please enter title and content', 'error');
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
      await loadBlogs();
      showToast(`Blog ${editingBlogId ? 'updated' : 'added'} successfully!`, 'success');
    } else {
      console.error('Failed to save blog:', data.message);
      showToast('Error saving blog: ' + (data.message || 'Unknown error'), 'error');
    }
  } catch (err) {
    console.error('Form submission error:', err);
    showToast('Error: ' + err.message, 'error');
  }
}

// ===== CANCEL EDITING =====
function handleCancelEdit() {
  console.log('Cancel button clicked');
  resetForm();
}

// ===== SELECT ALL CHECKBOX =====
function handleSelectAllChange(e) {
  console.log('Select all checkbox changed');
  const checkboxes = document.querySelectorAll('.blog-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = e.target.checked;
  });
  updateBulkActionsVisibility();
}

// ===== SELECT ALL BUTTON =====
function handleSelectAllButton() {
  console.log('Select all button clicked');
  const checkboxes = document.querySelectorAll('.blog-checkbox');
  const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);

  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
  });

  if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;
  updateBulkActionsVisibility();
}

// ===== BULK DELETE =====
async function handleBulkDelete() {
  console.log('Bulk delete button clicked');

  const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');
  const idsToDelete = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.id));

  if (idsToDelete.length === 0) {
    showToast('Please select blogs to delete', 'error');
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
    await loadBlogs();
    showToast(`${idsToDelete.length} blog(s) deleted successfully!`, 'success');
  } catch (err) {
    console.error('Bulk delete failed:', err);
    showToast('Error deleting blogs: ' + err.message, 'error');
  }
}

// ===== BLOG CHECKBOX CHANGE =====
function handleBlogCheckboxChange() {
  updateBulkActionsVisibility();

  const checkboxes = document.querySelectorAll('.blog-checkbox');
  const checkedBoxes = document.querySelectorAll('.blog-checkbox:checked');

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
    selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
  }
}

// ===== LEADS LOADING =====
async function loadQuotes() {
  try {
    const res = await fetch('/api/admin/quotes');
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    allQuotes = await res.json();

    if (leadsCount) {
      leadsCount.textContent = `${allQuotes.length} leads`;
    }

    console.log(`📊 Loaded ${allQuotes.length} leads`);
    renderLeadsTable(allQuotes);
  } catch (error) {
    console.error('❌ Quotes load failed:', error);
    allQuotes = [];
    renderLeadsTable([]);
  }
}

// ===== LEADS RENDERING =====
function renderLeadsTable(quotes = allQuotes) {
  const tbody = document.querySelector('#leadsTableBody') || leadsTable?.querySelector('tbody');
  if (!tbody) {
    console.warn('⚠️ Leads table body not found');
    return;
  }

  if (!quotes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="no-data">No leads found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = quotes.map((quote, index) => `
    <tr>
      <td>${escapeHtml(quote.name || '')}</td>
      <td>${escapeHtml(quote.email || '')}</td>
      <td>${escapeHtml(quote.phone || '')}</td>
      <td>${escapeHtml(quote.company || '')}</td>
      <td>${escapeHtml(quote.projectType || '')}</td>
      <td>$${escapeHtml(String(quote.budget || ''))}</td>
      <td>${escapeHtml(quote.timeline || '')}</td>
      <td>
        <span class="status-badge ${quote.read ? 'read' : 'unread'}">
          ${quote.read ? 'Read' : 'Unread'}
        </span>
      </td>
      <td>
        <button class="btn-small ${quote.read ? 'btn-disabled' : 'btn-primary'}" onclick="markQuoteRead(${index})">
          ${quote.read ? '✓' : 'Mark Read'}
        </button>
        <button class="btn-small btn-danger" onclick="deleteQuote(${index})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ===== LEADS MARK READ =====
async function markQuoteRead(index) {
  try {
    showToast('Marking lead as read...', 'info');
const res = await fetch(`/api/admin/quotes/${index}/read`, { method: 'PUT' });
    if (res.ok) {
      await loadQuotes();
      renderLeadsTable();
      showToast('Lead marked as read', 'success');
    } else {
      showToast('Failed to mark as read', 'error');
    }
  } catch (e) {
    console.error('Mark read failed:', e);
    showToast('Error marking lead as read', 'error');
  }
}

// ===== LEADS DELETE =====
async function deleteQuote(index) {
  showToast('Deleting lead...', 'info');
  const confirmed = await new Promise(resolve => {
    const btn = event.target;
    const confirmDiv = document.createElement('div');
    confirmDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:#020617;color:white;padding:20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.8);border:1px solid #374151;text-align:center;max-width:300px;';
    confirmDiv.innerHTML = `
      <div style="margin-bottom:16px;font-weight:500;">Delete this lead?</div>
      <button onclick="this.parentNode.parentNode.remove();resolve(true);deleteQuote(${index});" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:6px;margin-right:8px;cursor:pointer;">Delete</button>
      <button onclick="this.parentNode.parentNode.remove();resolve(false);" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>
    `;
    document.body.appendChild(confirmDiv);
  });
  if (!confirmed) return;

  try {
const res = await fetch(`/api/admin/quotes/${index}`, { method: 'DELETE' });
    if (res.ok) {
      await loadQuotes();
      renderLeadsTable();
      showToast('Lead deleted', 'success');
    } else {
      showToast('Failed to delete lead', 'error');
    }
  } catch (e) {
    console.error('Delete failed:', e);
    showToast('Error deleting lead', 'error');
  }
}

// ===== LEADS FILTER =====
function filterLeads() {
  const term = (leadsSearch?.value || '').toLowerCase();
  const status = leadsFilter?.value || '';

  const filtered = allQuotes.filter(quote => {
    const name = (quote.name || '').toLowerCase();
    const email = (quote.email || '').toLowerCase();
    const company = (quote.company || '').toLowerCase();

    const matchesSearch =
      name.includes(term) ||
      email.includes(term) ||
      company.includes(term);

    const matchesStatus =
      status === '' ||
      status === 'all' ||
      (status === 'unread' && !quote.read) ||
      (status === 'read' && quote.read);

    return matchesSearch && matchesStatus;
  });

  renderLeadsTable(filtered);
}

// ===== DEV.TO LOAD SAVED USERNAMES =====
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

// ===== DEV.TO SAVE USERNAME =====
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
    showToast('Username saved', 'success');
  } catch (err) {
    console.error('Failed to save Dev.to username:', err);
    showToast('Unable to save username', 'error');
  }
}

// ===== DEV.TO USERNAME OPTIONS =====
function renderDevtoUsernameOptions() {
  if (!savedDevtoUsernamesSelect) return;

  const options = ['<option value="">Select saved username</option>'];
  savedDevtoUsernames.forEach(username => {
    options.push(`<option value="${escapeHtml(username)}">${escapeHtml(username)}</option>`);
  });

  savedDevtoUsernamesSelect.innerHTML = options.join('');
}

// ===== DEV.TO MESSAGE =====
function setDevtoMessage(text, isError = false) {
  if (!devtoMessage) return;
  devtoMessage.textContent = text;
  devtoMessage.style.color = isError ? '#fca5a5' : '#d1d5db';
}

// ===== DEV.TO FETCH POSTS =====
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

// ===== DEV.TO RENDER POSTS =====
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
        <img src="${escapeHtml(cover)}" alt="${escapeHtml(post.title || 'Dev.to post')}" />
        <div class="devto-post-content">
          <div class="devto-meta">
            <span>${escapeHtml(author)}</span>
            <span>${escapeHtml(publishedAt)}</span>
          </div>
          <h3>${escapeHtml(post.title || '')}</h3>
          <p>${escapeHtml(excerpt)}</p>
          <p><strong>Tags:</strong> ${escapeHtml(tags)}</p>
        </div>
        <div class="devto-actions">
          <button type="button" class="import-devto-btn" data-id="${post.id}">Import</button>
          <a href="${post.url}" target="_blank" rel="noopener noreferrer">View on Dev.to</a>
        </div>
      </div>
    `;
  }).join('');
}

// ===== DEV.TO IMPORT POST =====
function importDevtoPost(postId) {
  const post = devtoPosts.find(p => String(p.id) === String(postId));

  if (!post) {
    showToast('Selected Dev.to post could not be found.', 'error');
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
  showToast('Dev.to post loaded to form!', 'success');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Blog form
  if (blogForm) {
    blogForm.addEventListener('submit', handleBlogSubmit);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleCancelEdit);
  }

  // Blog filters
  searchInput?.addEventListener('input', filterBlogs);
  categoryFilter?.addEventListener('change', filterBlogs);
  featuredFilter?.addEventListener('change', filterBlogs);

  // Bulk actions
  selectAllCheckbox?.addEventListener('change', handleSelectAllChange);
  selectAllBtn?.addEventListener('click', handleSelectAllButton);
  bulkDeleteBtn?.addEventListener('click', handleBulkDelete);

  // Leads refresh
  refreshLeadsBtn?.addEventListener('click', loadQuotes);
  leadsSearch?.addEventListener('input', filterLeads);
  leadsFilter?.addEventListener('change', filterLeads);

  // Dev.to buttons
  fetchDevtoBtn?.addEventListener('click', () => {
    const username = (devtoUsernameInput?.value || '').trim();
    fetchDevtoPosts(username);
  });

  saveDevtoUsernameBtn?.addEventListener('click', async () => {
    const username = (devtoUsernameInput?.value || '').trim();
    if (!username) {
      showToast('Enter a Dev.to username before saving.', 'error');
      return;
    }
    await saveDevtoUsername(username);
  });

  savedDevtoUsernamesSelect?.addEventListener('change', (e) => {
    const username = e.target.value;
    if (username) {
      if (devtoUsernameInput) devtoUsernameInput.value = username;
      fetchDevtoPosts(username);
    }
  });

  // Import Dev.to posts
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('import-devto-btn')) {
      const postId = e.target.dataset.id;
      importDevtoPost(postId);
    }
  });

  // Blog action buttons
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

  // Blog checkbox change
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('blog-checkbox')) {
      handleBlogCheckboxChange();
    }
  });

  // Tabs
  blogTab?.addEventListener('click', () => {
    document.querySelector('.blog-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  leadsTab?.addEventListener('click', () => {
    document.querySelector('.leads-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ===== SIDEBAR NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const blogSection = document.getElementById('blogsSection');
  const leadsSection = document.getElementById('leadsSection');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (item.dataset.tab === 'blogs') {
        blogSection.classList.add('active');
        leadsSection.classList.remove('active');
      } else {
        leadsSection.classList.add('active');
        blogSection.classList.remove('active');
      }
    });
  });
});

// ===== STATS =====
// inside fetchBlogs()
document.getElementById('totalBlogs').textContent = allBlogs.length;

// inside loadQuotes()
document.getElementById('leadsCount').textContent = `${allQuotes.length} leads`;
document.getElementById('unreadLeads').textContent =
  allQuotes.filter(q => !q.read).length;

// ===== UTILS =====
function escapeHtml(text) {
  const str = String(text ?? '');
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

