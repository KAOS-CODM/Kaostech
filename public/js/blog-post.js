// ==================== Blog Post Detail Page ====================

let currentPost = null;
let allPosts = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Blog post detail page loaded');

  // Get slug from URL
  const slug = window.location.pathname.split('/').pop();
  console.log('Loading blog post with slug:', slug);

  try {
    // Fetch the blog post
    const response = await fetch(`/api/blog/slug/${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        showError('Blog post not found', 'The post you\'re looking for doesn\'t exist.');
        return;
      }
      throw new Error(`Failed to load blog post: ${response.status}`);
    }

    currentPost = await response.json();
    console.log('Blog post loaded:', currentPost);

    // Load all posts for related posts and navigation
    const allPostsResponse = await fetch('/api/blog');
    allPosts = await allPostsResponse.json();

    // Render the post
    renderBlogPost();

    // Update page title and meta tags
    updatePageMetaTags();

    // Render related posts
    renderRelatedPosts();

    // Setup post navigation
    setupPostNavigation();

    // Setup share buttons
    setupShareButtons();

  } catch (err) {
    console.error('Error loading blog post:', err);
    showError('Error', 'Failed to load the blog post. Please try again.');
  }
});

/**
 * Render the blog post content
 */
function renderBlogPost() {
  if (!currentPost) return;

  // Update title
  const titleElement = document.getElementById('post-title');
  if (titleElement) titleElement.textContent = currentPost.title;

  // Update breadcrumb
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumbTitle) breadcrumbTitle.textContent = currentPost.title;

  // Update author
  const authorElement = document.getElementById('post-author');
  if (authorElement) authorElement.textContent = currentPost.author || 'Kaos Tech Team';

  // Update date
  const dateElement = document.getElementById('post-date');
  if (dateElement) {
    const date = new Date(currentPost.publishedAt);
    dateElement.textContent = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    dateElement.setAttribute('datetime', currentPost.publishedAt);
  }

  // Update category
  const categoryElement = document.getElementById('post-category');
  if (categoryElement) {
    categoryElement.textContent = currentPost.category || 'Uncategorized';
    categoryElement.href = `/blog?category=${currentPost.category}`;
  }

  // Update read time
  const readTimeElement = document.getElementById('post-read-time');
  if (readTimeElement) readTimeElement.textContent = currentPost.readTime || '5 min read';

  // Update featured image
  const imageElement = document.getElementById('featured-image');
  if (imageElement) {
    imageElement.src = currentPost.featuredImage || '/assets/blog/default.jpg';
    imageElement.alt = currentPost.title;
  }

  // Update content
  const contentElement = document.getElementById('post-content');
  if (contentElement) {
    contentElement.innerHTML = formatContent(currentPost.content);
    // Highlight code blocks if present
    if (window.Prism) {
      Prism.highlightAllUnder(contentElement);
    }
  }

  // Render tags
  renderTags();

  console.log('Blog post rendered successfully');
}

/**
 * Format content with paragraphs and proper formatting
 */
function formatContent(content) {
  // Split by double newlines to create paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

/**
 * Render tags
 */
function renderTags() {
  if (!currentPost || !currentPost.tags || !currentPost.tags.length) return;

  const tagsContainer = document.getElementById('post-tags');
  if (!tagsContainer) return;

  const tagsHTML = currentPost.tags
    .map(tag => `<a href="/blog?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`)
    .join('');

  tagsContainer.innerHTML = `<div class="tags">${tagsHTML}</div>`;
}

/**
 * Render related posts (same category, different post)
 */
function renderRelatedPosts() {
  if (!currentPost || !allPosts) return;

  const relatedPosts = allPosts
    .filter(post => 
      post.id !== currentPost.id && 
      post.category === currentPost.category
    )
    .slice(0, 3);

  const relatedContainer = document.getElementById('related-posts');
  if (!relatedContainer) return;

  if (relatedPosts.length === 0) {
    relatedContainer.innerHTML = '<p>No related posts found.</p>';
    return;
  }

  const postsHTML = relatedPosts
    .map(post => `
      <article class="post-card">
        <a href="/blog/${post.slug}" class="post-card-link">
          <img src="${post.featuredImage || '/assets/blog/default.jpg'}" alt="${post.title}" loading="lazy">
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="post-meta">
            <span>${post.readTime}</span>
            <span>${new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
        </a>
      </article>
    `)
    .join('');

  relatedContainer.innerHTML = postsHTML;
}

/**
 * Setup post navigation (previous/next posts)
 */
function setupPostNavigation() {
  if (!currentPost || !allPosts) return;

  // Sort posts by date
  const sortedPosts = [...allPosts].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  const currentIndex = sortedPosts.findIndex(p => p.id === currentPost.id);

  // Next post (newer)
  if (currentIndex > 0) {
    const nextPost = sortedPosts[currentIndex - 1];
    const nextElement = document.getElementById('next-post');
    if (nextElement) {
      nextElement.innerHTML = `
        <p>Next Post →</p>
        <a href="/blog/${nextPost.slug}" title="${nextPost.title}">${nextPost.title}</a>
      `;
    }
  }

  // Previous post (older)
  if (currentIndex < sortedPosts.length - 1) {
    const prevPost = sortedPosts[currentIndex + 1];
    const prevElement = document.getElementById('prev-post');
    if (prevElement) {
      prevElement.innerHTML = `
        <p>← Previous Post</p>
        <a href="/blog/${prevPost.slug}" title="${prevPost.title}">${prevPost.title}</a>
      `;
    }
  }
}

/**
 * Setup share buttons
 */
function setupShareButtons() {
  if (!currentPost) return;

  const currentUrl = window.location.href;
  const title = encodeURIComponent(currentPost.title);
  const description = encodeURIComponent(currentPost.excerpt || currentPost.content.substring(0, 100));

  // Twitter
  const twitterBtn = document.getElementById('share-twitter');
  if (twitterBtn) {
    twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${title}`;
  }

  // Facebook
  const facebookBtn = document.getElementById('share-facebook');
  if (facebookBtn) {
    facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  }

  // LinkedIn
  const linkedinBtn = document.getElementById('share-linkedin');
  if (linkedinBtn) {
    linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
  }

  // Copy link
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Link Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    });
  }
}

/**
 * Update page meta tags for SEO
 */
function updatePageMetaTags() {
  if (!currentPost) return;

  // Update page title
  document.title = `${currentPost.title} | Kaos Tech Blog`;

  // Update description meta tag
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', currentPost.excerpt || currentPost.content.substring(0, 160));

  // Update keywords meta tag
  let keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (!keywordsMeta) {
    keywordsMeta = document.createElement('meta');
    keywordsMeta.setAttribute('name', 'keywords');
    document.head.appendChild(keywordsMeta);
  }
  keywordsMeta.setAttribute('content', (currentPost.tags || []).join(', '));

  // Update canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', window.location.href);

  // Update Open Graph tags
  updateOGTag('og:title', currentPost.title);
  updateOGTag('og:description', currentPost.excerpt || currentPost.content.substring(0, 160));
  updateOGTag('og:image', currentPost.featuredImage || '/assets/blog/default.jpg');
  updateOGTag('og:url', window.location.href);

  // Update Twitter Card tags
  updateMetaTag('twitter:title', currentPost.title);
  updateMetaTag('twitter:description', currentPost.excerpt || currentPost.content.substring(0, 160));
  updateMetaTag('twitter:image', currentPost.featuredImage || '/assets/blog/default.jpg');

  // Update article specific meta tags
  updateOGTag('article:published_time', currentPost.publishedAt);

  // Update JSON-LD structured data
  updateStructuredData();

  console.log('Meta tags updated for SEO');
}

/**
 * Update or create Open Graph meta tag
 */
function updateOGTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update or create regular meta tag
 */
function updateMetaTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update JSON-LD structured data
 */
function updateStructuredData() {
  if (!currentPost) return;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': currentPost.title,
    'description': currentPost.excerpt || currentPost.content.substring(0, 160),
    'image': currentPost.featuredImage || '/assets/blog/default.jpg',
    'datePublished': currentPost.publishedAt,
    'dateModified': currentPost.publishedAt,
    'author': {
      '@type': 'Organization',
      'name': currentPost.author || 'Kaos Tech Team',
      'url': 'https://kaos-tech.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Kaos Tech',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://kaos-tech.com/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.href
    }
  };

  const jsonLdScript = document.getElementById('json-ld');
  if (jsonLdScript) {
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
  }
}

/**
 * Show error message
 */
function showError(title, message) {
  const content = document.getElementById('post-content');
  if (content) {
    content.innerHTML = `
      <div class="error-message">
        <h2>${title}</h2>
        <p>${message}</p>
        <a href="/blog" class="btn btn-primary">Back to Blog</a>
      </div>
    `;
  }
}
