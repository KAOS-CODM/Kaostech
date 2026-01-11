class PortfolioManager {
    constructor() {
        this.portfolioItems = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }
    
    async init() {
        await this.loadPortfolioData();
        this.setupEventListeners();
        this.renderPortfolio();
        this.updateStats();
    }
    
    async loadPortfolioData() {
        try {
            const response = await fetch('/content/portfolio.json');
            this.portfolioItems = await response.json();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        }
    }
    
    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderPortfolio();
            });
        });
        
        const searchInput = document.getElementById('portfolio-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderPortfolio();
            });
        }
        
        const modal = document.getElementById('portfolioModal');
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    getFilteredItems() {
        let items = this.portfolioItems;
        if (this.currentFilter !== 'all') items = items.filter(item => item.category === this.currentFilter);
        if (this.searchTerm) {
            items = items.filter(item => 
                item.title.toLowerCase().includes(this.searchTerm) ||
                item.description.toLowerCase().includes(this.searchTerm) ||
                item.clientName?.toLowerCase().includes(this.searchTerm) ||
                item.technologies?.some(tech => tech.toLowerCase().includes(this.searchTerm))
            );
        }
        return items;
    }
    
    renderPortfolio() {
        const container = document.getElementById('portfolio-items');
        const items = this.getFilteredItems();
        if (items.length === 0) {
            container.innerHTML = `<div class="no-results"><h3>No projects found</h3><p>Try adjusting your filters or search term</p></div>`;
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="portfolio-item" data-id="${item.id}">
                <div class="portfolio-image">
                    <img src="${item.image || '/assets/portfolio-placeholder.jpg'}" alt="${item.title}">
                    <span class="portfolio-category">${this.formatCategory(item.category)}</span>
                </div>
                <div class="portfolio-content">
                    <h3>${item.title}</h3>
                    <p class="portfolio-excerpt">${item.description.substring(0, 100)}...</p>
                    <div class="portfolio-technologies">
                        ${item.technologies.slice(0,3).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                    <div class="portfolio-links">
                        <a href="#" class="view-details" data-id="${item.id}">View Details</a>
                        ${item.liveUrl ? `<a href="${item.liveUrl}" target="_blank">Visit Site</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.view-details').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const id = e.target.closest('.view-details').dataset.id;
                this.openProjectModal(id);
            });
        });
    }
    
    formatCategory(category) {
        const categories = { ecommerce: 'E-commerce', business: 'Business Website', webapp: 'Web Application', redesign: 'Website Redesign' };
        return categories[category] || category;
    }
    
    openProjectModal(projectId) {
        const project = this.portfolioItems.find(p => p.id == projectId);
        if (!project) return;
        const modal = document.getElementById('portfolioModal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `<h2>${project.title}</h2><p>${project.description}</p>`;
        modal.style.display = 'block';
    }
    
    updateStats() {
        document.getElementById('total-projects').textContent = this.portfolioItems.length;
    }
}

document.addEventListener('DOMContentLoaded', () => { new PortfolioManager(); });
