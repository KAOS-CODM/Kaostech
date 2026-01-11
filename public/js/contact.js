class ContactManager {
    constructor() {
        this.form = document.getElementById('quote-form');
        this.cardsContainer = document.getElementById('contactCards');
        this.projectTypeSelect = document.getElementById('project-type');

        // Modal elements
        this.modal = document.getElementById('serviceModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDescription = document.getElementById('modalDescription');
        this.modalFeatures = document.getElementById('modalFeatures');
        this.modalPrice = document.getElementById('modalPrice');
        this.closeBtn = this.modal.querySelector('.close');

        this.iconMap = {
            code: 'fa-solid fa-code',
            'shopping-cart': 'fa-solid fa-cart-shopping',
            shield: 'fa-solid fa-shield-halved'
        };

        this.init();
    }

    init() {
        this.loadServices();
        this.setupForm();
        this.setupModal();
    }

    async loadServices() {
        try {
            const res = await fetch('/content/services.json');
            const services = await res.json();

            services.forEach(service => {
                const featuresHTML = service.features.map(f => `<li>✅ ${f}</li>`).join('');
                const iconClass = this.iconMap[service.icon] || 'fa-solid fa-star';

                const card = document.createElement('div');
                card.className = 'contact-card';
                card.innerHTML = `
                    <div class="contact-icon" style="color:${service.color}; font-size: 2.5rem;">
                        <i class="${iconClass}"></i>
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <ul class="service-features">${featuresHTML}</ul>
                    <p><strong>Starting at: ${service.startingPrice}</strong></p>
                    <button class="btn btn-outline btn-learn" data-id="${service.id}">Learn More</button>
                `;
                this.cardsContainer.appendChild(card);

                // Add to project-type select
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.title;
                this.projectTypeSelect.appendChild(option);
            });

            document.querySelectorAll('.btn-learn').forEach(btn => {
                btn.addEventListener('click', e => this.showModal(e, services));
            });
        } catch (err) {
            console.error('Error loading services:', err);
        }
    }

    showModal(e, services) {
        const serviceId = e.target.dataset.id;
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        this.modalTitle.textContent = service.title;
        this.modalDescription.textContent = service.details;
        this.modalFeatures.innerHTML = service.features.map(f => `<li>${f}</li>`).join('');
        this.modalPrice.textContent = `Starting at: ${service.startingPrice}`;
        this.modal.style.display = 'block';
    }

    setupModal() {
        this.closeBtn.onclick = () => (this.modal.style.display = 'none');
        window.onclick = e => {
            if (e.target === this.modal) this.modal.style.display = 'none';
        };
    }

    setupForm() {
        if (!this.form) return;

        this.form.addEventListener('submit', async e => {
            e.preventDefault();

            if (!this.validateForm()) return;

            const formData = Object.fromEntries(new FormData(this.form));
            formData.timestamp = new Date().toISOString();
            formData.pageUrl = window.location.href;
            formData.userAgent = navigator.userAgent;
            formData.source = 'quote-form';

            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.querySelector('.btn-text').textContent;
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'Sending...';

            try {
                // Try Supabase API first
                const response = await fetch('/api/contact/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Supabase failed');

                const result = await response.json();
                if (result.success) {
                    this.showSuccessMessage();
                    this.form.reset();
                } else throw new Error(result.message || 'Submission failed');
            } catch (err) {
                console.warn('Supabase failed, falling back to JSON', err);
                // Fallback to JSON storage
                try {
                    const fallbackRes = await fetch('/api/contact/fallback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const fallbackResult = await fallbackRes.json();
                    if (fallbackResult.success) {
                        this.showSuccessMessage('Saved to local JSON (fallback)');
                        this.form.reset();
                    } else throw new Error('JSON fallback failed');
                } catch (fallbackErr) {
                    console.error('Fallback submission failed', fallbackErr);
                    this.showErrorMessage('Failed to submit your request.');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = originalText;
            }
        });
    }

    validateForm() {
        let valid = true;
        this.form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });
        return valid;
    }

    showSuccessMessage(msg) {
        alert(msg || 'Quote submitted successfully!');
    }

    showErrorMessage(msg) {
        alert(msg || 'Failed to submit quote.');
    }
}

document.addEventListener('DOMContentLoaded', () => new ContactManager());
