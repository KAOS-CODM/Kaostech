// Generic JSON loader for any container
async function loadJSONContent(url, containerId, renderFn) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = renderFn(data);
    } catch (err) {
        console.error(`Failed to load ${url}:`, err);
    }
}

// Render Functions
function renderFooter(footer) {
    return `
    <div class="footer-grid">
        <div class="footer-brand">
            <h3>${footer.brand.name}</h3>
            <p class="tagline">${footer.brand.tagline}</p>
            <p class="mission">${footer.brand.mission}</p>
        </div>
        <div class="footer-links">
            <h4>Quick Links</h4>
            ${footer.links.map(link => `<a href="${link.url}">${link.title}</a>`).join('')}
        </div>
        <div class="footer-services">
            <h4>Services</h4>
            ${footer.services.map(s => `<a href="${s.url}">${s.title}</a>`).join('')}
        </div>
        <div class="footer-contact">
            <h4>Contact Us</h4>
            <p><a href="mailto:${footer.contact.email}">${footer.contact.email}</a></p>
            <p>${footer.contact.responseTime}</p>
            <div class="newsletter">
                <h5>Stay Updated</h5>
                <form id="newsletter-form" class="newsletter-form">
                    <input type="email" placeholder="${footer.newsletter.placeholder}" required>
                    <button type="submit">${footer.newsletter.buttonText}</button>
                </form>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; <span id="current-year"></span> ${footer.brand.name}. All rights reserved.</p>
        <div class="legal-links">
            ${footer.legal.map(l => `<a href="${l.url}">${l.title}</a>`).join('')}
        </div>
    </div>`;
}

function renderServices(services) {
    return services.map(s => `
        <div class="service-card">
            <h4>${s.title}</h4>
            <p>${s.description}</p>
        </div>
    `).join('');
}

function renderPortfolio(items) {
    return items.map(p => `
        <div class="portfolio-card">
            <img src="${p.image}" alt="${p.title}">
            <h4>${p.title}</h4>
        </div>
    `).join('');
}

function renderValues(values) {
    return values.map(v => `
        <div class="value-card">
            <div class="value-icon" style="background-color: ${v.color}20;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${v.color}" stroke-width="2">
                    ${getValueIcon(v.icon)}
                </svg>
            </div>
            <h4>${v.title}</h4>
            <p>${v.description}</p>
        </div>
    `).join('');
}

function getValueIcon(iconName) {
    const icons = {
        collaboration: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
        guidance: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
        transparency: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
        performance: '<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>',
        costeffective: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
    };
    return icons[iconName] || '';
}

function renderFeaturedCaseStudy(project) {
    return `
        <div class="case-study-header">
            <div>
                <h3>${project.title}</h3>
                <p class="client-name">${project.clientName}</p>
            </div>
            <span class="case-study-category">${project.category}</span>
        </div>
        <div class="case-study-metrics">
            <div class="metric">
                <div class="metric-value">${project.metrics.impact}</div>
                <div class="metric-label">Impact Metric</div>
            </div>
            <div class="metric">
                <div class="metric-value">${project.metrics.timeline}</div>
                <div class="metric-label">Project Timeline</div>
            </div>
            <div class="metric">
                <div class="metric-value">${project.metrics.satisfaction}</div>
                <div class="metric-label">Client Satisfaction</div>
            </div>
        </div>
        <div class="case-study-content">
            <h4>The Challenge</h4>
            <p>${project.challenge}</p>
            <h4>Our Solution</h4>
            <p>${project.solution}</p>
            <h4>Results</h4>
            <p>${project.results}</p>
        </div>
        <div class="case-study-cta">
            <a href="/portfolio/${project.slug}" class="btn btn-primary">Read Full Case Study</a>
        </div>
    `;
}

// Load all dynamic content
document.addEventListener('DOMContentLoaded', () => {
    loadJSONContent('/content/footer.json', 'footer', renderFooter);
    loadJSONContent('/content/services.json', 'services-container', renderServices);
    loadJSONContent('/content/portfolio.json', 'portfolio-container', renderPortfolio);
    loadJSONContent('/content/values.json', 'values-container', renderValues);

    // Featured case study random selection
    loadJSONContent('/content/featured-case-study.json', 'featured-case-study', (projects) => {
        if (!projects || projects.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * projects.length);
        return renderFeaturedCaseStudy(projects[randomIndex]);
    });

    // Set current year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
