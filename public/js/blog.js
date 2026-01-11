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
        this.setupEventListeners();
        this.renderFeaturedPost();
        this.renderPosts();
        this.renderCategories();
        this.renderPopularPosts();
        this.setupNewsletter();
    }

    async loadBlogData() {
        try {
            const res = await fetch('/api/blog/posts');
            if (!res.ok) throw new Error('DB unavailable');
            this.posts = await res.json();
        } catch (err) {
            console.warn('Falling back to JSON blog posts');
            const fallback = await fetch('/content/blog-posts.json');
            this.posts = await fallback.json();
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
            if (!post.category) return;
            if (!this.categories[post.category]) {
                this.categories[post.category] = {
                    name: this.formatCategoryName(post.category),
                    count: 0
                };
            }
            this.categories[post.category].count++;
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
            posts = posts.filter(p => p.category === this.currentCategory);
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
                <img src="${this.featuredPost.featuredImage || '/assets/blog-placeholder.jpg'}">
            </div>
            <div class="featured-content">
                <div class="featured-meta">
                    <span>${this.featuredPost.readTime || '5 min read'}</span>
                    <span>${new Date(this.featuredPost.publishedAt).toDateString()}</span>
                </div>
                <h2>${this.featuredPost.title}</h2>
                <p class="featured-excerpt">${this.featuredPost.excerpt}</p>
                <span class="read-more">Read Article →</span>
            </div>
        </a>`;
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        const pagination = document.getElementById('pagination');

        const posts = this.getFilteredPosts();
        const start = (this.currentPage - 1) * this.postsPerPage;
        const pagePosts = posts.slice(start, start + this.postsPerPage);

        container.innerHTML = pagePosts.map(p => `
        <article class="post-card">
            <a href="/blog/${p.slug}">
                <div class="post-image">
                    <img src="${p.featuredImage || '/assets/blog-placeholder.jpg'}">
                </div>
                <div class="post-content">
                    <span class="post-category">${this.formatCategoryName(p.category)}</span>
                    <h3>${p.title}</h3>
                    <p class="post-excerpt">${p.excerpt}</p>
                </div>
            </a>
        </article>
        `).join('');

        pagination.innerHTML = '';
    }

    renderCategories() {
        const el = document.getElementById('categories-list');
        if (!el) return;

        el.innerHTML = Object.entries(this.categories).map(([k, v]) => `
        <li>
            <a href="#" data-category="${k}">
                <span>${v.name}</span>
                <span class="category-count">${v.count}</span>
            </a>
        </li>`).join('');
    }

    renderPopularPosts() {
        const el = document.getElementById('popular-posts');
        if (!el) return;

        el.innerHTML = [...this.posts]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3)
            .map(p => `
            <div class="popular-post">
                <img src="${p.featuredImage || '/assets/blog-placeholder.jpg'}">
                <a href="/blog/${p.slug}">${p.title}</a>
            </div>`).join('');
    }

    setupNewsletter() {}
}

document.addEventListener('DOMContentLoaded', () => new BlogManager());
