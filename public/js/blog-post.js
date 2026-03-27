class BlogPostPage {
    constructor() {
        this.posts = [];
        this.postId = new URLSearchParams(window.location.search).get('id');
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.renderPost();
    }

    async loadPosts() {
        try {
            const [userRes, trendingRes] = await Promise.all([
                fetch('https://dev.to/api/articles?username=kaoscodm'),
                fetch('https://dev.to/api/articles?per_page=30')
            ]);

            const userPosts = userRes.ok ? await userRes.json() : [];
            const trendingPosts = trendingRes.ok ? await trendingRes.json() : [];

            const allPostsMap = new Map();
            [...userPosts, ...trendingPosts].forEach(p => allPostsMap.set(p.id, p));

            this.posts = Array.from(allPostsMap.values()).map(p => ({
                id: p.id,
                title: p.title,
                url: p.url,
                excerpt: p.description || '',
                content: p.body_html || '',
                author: p.user?.name || 'Dev.to',
                publishedAt: p.published_at,
                category: (p.tag_list && p.tag_list.length) ? p.tag_list[0] : 'dev',
                tags: p.tag_list || [],
                featuredImage: p.cover_image || '/assets/blog-placeholder.jpg',
                readTime: p.reading_time_minutes ? `${p.reading_time_minutes} min read` : '5 min read',
                source: p.user?.username === 'kaoscodm' ? 'yours' : 'external'
            }));
        } catch (err) {
            console.warn('⚠️ Dev.to failed, loading local JSON');
            const fallback = await fetch('/content/blog-posts.json');
            this.posts = await fallback.json();
        }
    }

    renderPost() {
        const post = this.posts.find(p => p.id == this.postId);
        if (!post) {
            document.getElementById('post-title').textContent = 'Post not found';
            return;
        }

        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-meta').textContent = `${post.readTime || '5 min read'} • ${new Date(post.publishedAt).toDateString()}`;
        document.getElementById('post-image').src = post.featuredImage || '/assets/blog-placeholder.jpg';
        document.getElementById('post-content').innerHTML = post.content;
    }
}

document.addEventListener('DOMContentLoaded', () => new BlogPostPage());