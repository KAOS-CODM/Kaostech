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
            const localRes = await fetch('/content/blog-posts.json');
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
            const fallback = await fetch('/content/blog-posts.json');
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
            const cat = post.category || 'dev';
            if (!this.categories[cat]) {
                this.categories[cat] = {
                    name: this.formatCategoryName(cat),
                    count: 0
                };
            }
            this.categories[cat].count++;
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
            posts = posts.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
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
                        <span class="post-category">${this.formatCategoryName(p.category)}</span>
                        <h3>${p.title}</h3>
                        <p class="post-excerpt">${p.excerpt}</p>
                    </div>
                </a>
            </article>
        `).join('');
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
                <img src="${p.featuredImage}">
                <a href="/blog/${p.slug}">${p.title}</a>
            </div>`).join('');
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