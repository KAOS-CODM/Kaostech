class BlogManager {
    constructor() {
        this.posts = [];
        this.featuredPost = null;
        this.categories = {};
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.init();
    }

    async init() {
        await this.loadBlogData();
        this.renderFeaturedPost();
        this.renderPosts();
        this.renderCategories();
        this.renderFilterTabs(); // 👈 ADD THIS
        this.renderPopularPosts();
        this.setupEventListeners();
        this.setupInfiniteScroll();
    }

    async loadBlogData() {
        try {
            // Fetch Dev.to posts
            const devRes = await fetch('https://dev.to/api/articles?username=kaoscodm');
            const devPosts = devRes.ok ? await devRes.json() : [];

            // Fetch Medium posts via RSS to JSON converter
            // Example: https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yourusername
            const mediumRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@klasikyemite');
            const mediumPosts = mediumRes.ok ? (await mediumRes.json()).items : [];

            // Fetch local JSON posts
            const localRes = await fetch(`/content/blog-posts.json?_=${Date.now()}`);
            const localPosts = await localRes.json();

            const allPostsMap = new Map();

            // Normalize Dev.to posts
            devPosts.forEach(p => allPostsMap.set(p.id, {
                id: p.id,
                title: p.title,
                slug: p.slug,
                url: `/blog/${p.slug}`,  
                excerpt: p.description || '',
                content: p.body_html || '',
                author: p.user?.name || 'Dev.to',
                publishedAt: p.published_at,
                category: (p.tag_list && p.tag_list.length) ? p.tag_list[0] : 'dev',
                tags: p.tag_list || [],
                featuredImage: p.cover_image || '/assets/blog-placeholder.jpg',
                readTime: p.reading_time_minutes ? `${p.reading_time_minutes} min read` : '5 min read',
                source: 'dev'
            }));

            // Normalize Medium posts
            mediumPosts.forEach(p => allPostsMap.set(p.guid, {
                id: p.guid,
                title: p.title,
                slug: p.guid,
                url: `/blog/${p.guid}`,
                excerpt: p.description || '',
                content: p.content || '',
                author: p.author || 'Medium',
                publishedAt: p.pubDate,
                category: 'medium',
                tags: [],
                featuredImage: p.thumbnail || '/assets/blog-placeholder.jpg',
                readTime: '5 min read',
                source: 'medium'
            }));

            // Normalize Local posts
            localPosts.forEach(p => allPostsMap.set(p.id, {
                ...p,
                url: `/blog/${p.slug}`,
                source: 'local'
            }));

            this.posts = Array.from(allPostsMap.values());

        } catch (err) {
            console.warn('⚠️ Blog fetch failed, using local JSON only');
            const fallback = await fetch(`/content/blog-posts.json?_=${Date.now()}`);
            const localPosts = await fallback.json();
            this.posts = localPosts.map(p => ({
                ...p,
                url: `/blog/${p.slug}`,
                source: 'local'
            }));
        }

        this.pickFeaturedPost();
        this.processCategories();
    }

    pickFeaturedPost() {
        const featured = this.posts.filter(p => p.featured === true);
        this.featuredPost = featured.length
            ? featured[Math.floor(Math.random() * featured.length)]
            : this.posts[0];
    }

    processCategories() {
        this.categories = { all: { name: 'All Posts', count: this.posts.length } };

        this.posts.forEach(post => {
            const tags = Array.isArray(post.tags) && post.tags.length
                ? post.tags
                : [post.category || 'uncategorized'];

            tags.forEach(tag => {
                const key = tag.toLowerCase();

                if (!this.categories[key]) {
                    this.categories[key] = {
                        name: this.formatCategoryName(tag),
                        count: 0
                    };
                }

                this.categories[key].count++;
            });
        });
    }

    formatCategoryName(category) {
        const map = {
            tutorials: 'Tutorials',
            insights: 'Insights & Thoughts',
            'case-studies': 'Case Studies',
            industry: 'Industry News'
        };
        return map[category] || category;
    }

    setupTagToggles() {
        document.querySelectorAll('.tags-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const container = btn.closest('.tags-container');
                const hiddenTags = JSON.parse(btn.dataset.tags);
                
                hiddenTags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'post-tag';
                    span.textContent = tag;
                    container.appendChild(span);
                });
                
                btn.remove();
                container.style.flexWrap = 'wrap';
            });
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;

                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderPosts();
            });
        });

        const search = document.getElementById('blog-search');
        if (search) {
            search.addEventListener('input', e => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.renderPosts();
            });
        }
    }


    getFilteredPosts() {
        let posts = [...this.posts];

        if (this.currentCategory !== 'all') {
            posts = posts.filter(p => {
            const tags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [];
            return tags.includes(this.currentCategory.toLowerCase());
        });
        }

        if (this.searchTerm) {
            posts = posts.filter(p =>
                p.title.toLowerCase().includes(this.searchTerm) ||
                p.excerpt.toLowerCase().includes(this.searchTerm)
            );
        }

        return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    renderFeaturedPost() {
        if (!this.featuredPost) return;
        const el = document.getElementById('featured-post');
        el.innerHTML = `
        <a href="/blog/${this.featuredPost.slug}">
            <div class="featured-image">
                <img src="${this.featuredPost.featuredImage}" alt="${this.featuredPost.title}">
            </div>
            <div class="featured-content">
                <div class="featured-meta">
                    <span>${this.featuredPost.readTime}</span>
                    <span>${new Date(this.featuredPost.publishedAt).toDateString()}</span>
                </div>
                <h2>${this.featuredPost.title}</h2>
                <p class="featured-excerpt">${this.featuredPost.excerpt}</p>
                <span class="read-more">Read Article →</span>
            </div>
        </a>`;
    }

    renderTags(tags) {
        const maxVisible = 5;
        if (!tags || tags.length === 0) return '<span class="no-tags">No tags</span>';
        
        const visibleTags = tags.slice(0, maxVisible);
        const hiddenTags = tags.slice(maxVisible);
        
        if (hiddenTags.length === 0) {
            return visibleTags.map(tag => `<span class="post-tag">${tag}</span>`).join('');
        }
        
        return `
            <div class="tags-container">
                ${visibleTags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                <button class="tags-toggle" data-tags='${JSON.stringify(hiddenTags)}'>+${hiddenTags.length}</button>
            </div>
        `;
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        const posts = this.getFilteredPosts();
        const start = (this.currentPage - 1) * this.postsPerPage;
        const pagePosts = posts.slice(start, start + this.postsPerPage);

        container.innerHTML = pagePosts.map(p => `
            <article class="post-card">
                <a href="/blog/${p.slug}">
                    <div class="post-image">
                        <img src="${p.featuredImage || '/assets/blog-placeholder.jpg'}" alt="${p.title}">
                    </div>
                    <div class="post-content">
                        <div class="post-tags">
                            ${this.renderTags(p.tags || [])}
                        </div>
                        <h3>${p.title}</h3>
                        <p class="post-excerpt">${p.excerpt}</p>
                    </div>
                </a>
            </article>
        `).join('');

        this.setupTagToggles();
    }


renderCategories() {
        const el = document.getElementById('categories-list');
        if (!el) return;

        const allEntries = Object.entries(this.categories);
        const sortedEntries = allEntries
            .filter(([,v]) => v && v.count !== undefined)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0));
        
        const visibleEntries = sortedEntries.slice(0, 10);
        const hiddenKeys = sortedEntries.slice(10).map(([k]) => k);

        let html = visibleEntries.map(([k, v]) => `
            <li>
                <a href="#" data-category="${k}" class="category-link">
                    <span>${v.name}</span>
                    <span class="category-count">${v.count}</span>
                </a>
            </li>
        `).join('');

        if (hiddenKeys.length > 0) {
            html += `
                <li class="see-more-item">
                    <button class="see-more-btn" data-type="categories" data-hidden='${JSON.stringify(hiddenKeys)}'>
                        See more categories (${hiddenKeys.length})
                    </button>
                </li>
            `;
        }

        el.innerHTML = html;

        // Setup events
        this.setupCategoryEvents(el);
        this.setupSeeMoreToggles(el);
    }

    setupCategoryEvents(container) {
        container.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const category = e.target.closest('a').dataset.category;
                this.currentCategory = category;
                this.currentPage = 1;
                this.renderPosts();
                
                // Update active state in filter tabs too
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                const matchingTab = document.querySelector(`.filter-tab[data-category="${category}"]`);
                if (matchingTab) matchingTab.classList.add('active');
            });
        });
    }

    renderPopularPosts() {
        const el = document.getElementById('popular-posts');
        if (!el) return;

        el.innerHTML = [...this.posts]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3)
            .map(p => `
            <div class="popular-post">
                <img src="${p.featuredImage}">
                <a href="/blog/${p.slug}">${p.title}</a>
            </div>`).join('');
    }

renderFilterTabs() {
        const container = document.querySelector('.filter-tabs');
        if (!container) return;

        const allTabs = Object.keys(this.categories);
        const visibleTabs = allTabs.slice(0, 5);
        const hiddenTabs = allTabs.slice(5);

        let html = '';
        if (visibleTabs.length > 0) {
            html = visibleTabs.map(cat => `
                <button class="filter-tab ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
                    ${this.categories[cat].name}
                </button>
            `).join('');
        }

        if (hiddenTabs.length > 0) {
            html += `
                <button class="see-more-btn" data-type="filter" data-hidden='${JSON.stringify(hiddenTabs)}'>
                    See more (${hiddenTabs.length})
                </button>
            `;
        }

        container.innerHTML = html;

        // Rebind all events
        this.setupSeeMoreToggles(container);
        this.setupFilterEvents(container);
    }

    setupFilterEvents(container) {
        container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;

                container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                this.renderPosts();
            });
        });
    }

    setupSeeMoreToggles(container) {
        const seeMoreBtns = container ? container.querySelectorAll('.see-more-btn') : document.querySelectorAll('.see-more-btn');
        seeMoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const hidden = JSON.parse(btn.dataset.hidden);
                const type = btn.dataset.type;
                const nextBatch = hidden.slice(0, 5);
                const remaining = hidden.slice(5);

                // Add next 5
                nextBatch.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'filter-tab';
                    button.dataset.category = item;
                    button.textContent = this.categories[item].name;
                    container.insertBefore(button, btn);
                });

                // Update or remove button
                if (remaining.length > 0) {
                    btn.dataset.hidden = JSON.stringify(remaining);
                    btn.textContent = `See more (${remaining.length})`;
                } else {
                    btn.remove();
                }

                // Rebind events
                this.setupFilterEvents(container);
            });
        });
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                this.currentPage++;
                this.renderPosts();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new BlogManager());