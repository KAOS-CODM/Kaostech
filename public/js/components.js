// Load JSON content dynamically
async function loadJSONContent(url, containerId, renderFunction) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const container = document.getElementById(containerId);
        
        if (container && renderFunction) {
            container.innerHTML = renderFunction(data);
        }
        
        return data;
    } catch (error) {
        console.error('Error loading JSON content:', error);
        return null;
    }
}

// Render services from JSON
function renderServices(services) {
    return services.map(service => `
        <div class="service-card">
            <div class="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${service.color || 'var(--primary)'}" stroke-width="2">
                    ${getServiceIcon(service.icon)}
                </svg>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <div class="service-features">
                ${service.features ? service.features.map(feature => 
                    `<span class="feature-tag">${feature}</span>`
                ).join('') : ''}
            </div>
            <div class="service-actions">
                <a href="/services#${service.id}" class="btn-text">Learn More →</a>
            </div>
        </div>
    `).join('');
}

// Contact form handler
class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.setupValidation();
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearError.bind(this));
        });
    }
    
    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const isValid = this.validateFieldType(field, value);
        
        if (!isValid) {
            this.showError(field, this.getErrorMessage(field));
        } else {
            this.clearError(field);
        }
        
        return isValid;
    }
    
    validateFieldType(field, value) {
        if (field.type === 'email') {
            return this.isValidEmail(value);
        }
        if (field.type === 'tel') {
            return this.isValidPhone(value);
        }
        return value.length > 0;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    getErrorMessage(field) {
        const messages = {
            email: 'Please enter a valid email address',
            tel: 'Please enter a valid phone number',
            default: 'This field is required'
        };
        
        return messages[field.type] || messages.default;
    }
    
    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField({ target: input })) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.source = window.location.pathname;
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to server
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showSuccess();
                this.form.reset();
                
                // Track conversion
                if (window.gtag) {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-YOUR_CONVERSION_ID',
                        'value': 1.0,
                        'currency': 'USD'
                    });
                }
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showError(this.form, 'Failed to send message. Please try again or email us directly.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    showSuccess() {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <h3>Message Sent Successfully!</h3>
                <p>We'll get back to you within 24 hours.</p>
                <button class="btn btn-primary close-success">OK</button>
            </div>
        `;
        
        document.body.appendChild(successMessage);
        
        // Close button handler
        successMessage.querySelector('.close-success').addEventListener('click', () => {
            successMessage.remove();
        });
    }
}

// Initialize forms on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form if exists
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        new ContactForm('contact-form');
    }
    
    // Initialize newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (email) {
                try {
                    await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    
                    // Show success
                    this.innerHTML = '<p class="success">Subscribed successfully!</p>';
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                }
            }
        });
    }
});

// Render services dynamically
function renderServices(services, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = services.map(service => `
        <div class="service-card" id="${service.id || service.title.replace(/\s+/g,'-').toLowerCase()}">
            <div class="service-header">
                <div class="service-icon" style="background-color: ${service.color}20;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${service.color}" stroke-width="2">
                        ${getServiceIcon(service.icon)}
                    </svg>
                </div>
                <div>
                    <h3>${service.title}</h3>
                    ${service.startingPrice ? `<p class="service-price">Starting from ${service.startingPrice}</p>` : ''}
                </div>
            </div>
            <div class="service-body">
                <p>${service.description}</p>
                ${service.features ? `
                <div class="service-details">
                    <h4>What's Included:</h4>
                    <ul>
                        ${service.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${service.details ? `<p><strong>Details:</strong> ${service.details}</p>` : ''}
                <div class="service-cta">
                    <a href="/contact?service=${service.id || service.title.replace(/\s+/g,'-').toLowerCase()}" class="btn btn-primary">Get Quote for This Service</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Map icon names to SVG paths
function getServiceIcon(iconName) {
    const icons = {
        code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
        'shopping-cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
        collaboration: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M6 20v-2c0-2.21 1.79-4 4-4h0c2.21 0 4 1.79 4 4v2"></path>',
        guidance: '<path d="M12 2v10l6 6"></path>',
        transparency: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
        performance: '<path d="M3 12l2-2l4 4l8-8l4 4"></path>',
        costeffective: '<path d="M12 1v22"></path><path d="M1 12h22"></path>'
    };
    return icons[iconName] || '<circle cx="12" cy="12" r="10"></circle>';
}
