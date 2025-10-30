// ============================================
//  faq HANDLER
// ============================================

class AccordionFAQ {
    constructor() {
        this.accordionItems = document.querySelectorAll('.accordion-item');
        this.init();
    }

    init() {
        if (!this.accordionItems.length) {
            console.error('No accordion items found');
            return;
        }

        this.attachEvents();
    }

    attachEvents() {
        this.accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            
            if (header) {
                header.addEventListener('click', () => {
                    this.toggleAccordion(item);
                });

            
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleAccordion(item);
                    }
                });
            }
        });
    }

    toggleAccordion(item) {
        const isActive = item.classList.contains('active');
        
        
         this.closeAll();
        
        
        if (isActive) {
            this.close(item);
        } else {
            this.open(item);
        }
    }

    open(item) {
        item.classList.add('active');
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.setAttribute('aria-expanded', 'true');
        }
        
      
        if (typeof gsap !== 'undefined') {
            const content = item.querySelector('.accordion-content');
            gsap.fromTo(content,
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
        }
    }

    close(item) {
        item.classList.remove('active');
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
        }
    }

    closeAll() {
        this.accordionItems.forEach(item => {
            this.close(item);
        });
    }
}

// ============================================
//  CONTACT FORM handler
// ============================================

class InlineContactForm {
    constructor() {
      
        const initializeForm = () => {
            this.form = document.getElementById('contact-form-inline');
            
            if (!this.form) {
                console.error('[Contact Form] Form element #contact-form-inline not found in DOM');
                return;
            }
            
           
            this.submitButton = this.form.querySelector('.form-submit');
            this.submitText = this.form.querySelector('.form-submit__text');
            this.submitLoading = this.form.querySelector('.form-submit__loading');
            this.successMessage = this.form.querySelector('.form-success');
            this.failureMessage = this.form.querySelector('.form-failure');
            this.messageCounter = document.getElementById('message-counter');
            this.messageField = document.getElementById('message');
            
        
            if (!this.submitButton || !this.submitText || !this.submitLoading) {
                console.error('[Contact Form] Required button elements not found');
                return;
            }
            
            if (!this.successMessage || !this.failureMessage) {
                console.error('[Contact Form] Message elements not found');
                return;
            }
            
            if (!this.messageCounter || !this.messageField) {
                console.error('[Contact Form] Message field elements not found');
                return;
            }
            
          
            console.debug('[Contact Form] All elements found, initializing...');
            this.init();
        };

       
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeForm);
        } else {
            initializeForm();
        }
    }

    init() {
        this.attachEvents();
        this.setupCharacterCounter();
        this.setupRealTimeValidation();
    }

    attachEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // ============================================
    // CHARACTER COUNTER
    // ============================================

    setupCharacterCounter() {
        if (!this.messageField || !this.messageCounter) return;

        this.messageField.addEventListener('input', () => {
            const length = this.messageField.value.length;
            const maxLength = this.messageField.getAttribute('maxlength') || 1000;
            this.messageCounter.textContent = `${length} / ${maxLength} characters`;
            
            if (length > maxLength * 0.9) {
                this.messageCounter.style.color = 'var(--color-accent-red)';
            } else {
                this.messageCounter.style.color = '';
            }
        });
    }

    // ============================================
    // REAL-TIME VALIDATION 4 form
    // ============================================

    setupRealTimeValidation() {
        const fields = this.form.querySelectorAll('.form-input, .form-select, .form-textarea');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (fieldId === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (fieldId === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters';
        }

        if (fieldId === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters';
        }

        if (!isValid) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    validateForm() {
        const fields = this.form.querySelectorAll('.form-input, .form-select, .form-textarea');
        let isValid = true;

        fields.forEach(field => {
            if (field.name !== '_gotcha') {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================

    async handleSubmit(e) {
        e.preventDefault();

        this.hideMessages();

        if (!this.validateForm()) {
            this.showError('Please fix the errors above before submitting.');
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const formAction = this.form.getAttribute('action');
            
            if (!formAction || formAction === 'https://formspree.io/f/xjkpreqy') {
                throw new Error('Formspree form ID not configured.  fix it!!.');
            }

            const response = await fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.showSuccess();
                this.form.reset();
                if (this.messageCounter) {
                    this.messageCounter.textContent = '0 / 1000 characters';
                }
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(error.message || 'Sorry, something went wrong. Please try again later.');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        if (!this.submitButton || !this.submitText || !this.submitLoading) return;
        
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitText.hidden = true;
            this.submitLoading.hidden = false;
        } else {
            this.submitButton.disabled = false;
            this.submitText.hidden = false;
            this.submitLoading.hidden = true;
        }
    }

    showSuccess() {
        if (this.successMessage) {
            this.successMessage.hidden = false;
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.successMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
            }

           
            setTimeout(() => {
                this.hideMessages();
            }, 5000); //hide after 5 sec
        }
    }

    showError(message) {
        if (this.failureMessage) {
            const errorText = this.failureMessage.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
            this.failureMessage.hidden = false;
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.failureMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
            }
            
            this.failureMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    hideMessages() {
        if (this.successMessage) {
            this.successMessage.hidden = true;
        }
        if (this.failureMessage) {
            this.failureMessage.hidden = true;
        }
    }
}

// ============================================
// SMOOTH SCROLL 
// ============================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const navHeight = document.getElementById('main-navigation')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // init accordion
    new AccordionFAQ();
    
    // init inline contact form
    new InlineContactForm();
    
    // init smooth scroll
    initSmoothScroll();
    

    if (typeof gsap !== 'undefined') {
        // Hero animations
        gsap.fromTo('.contact-hero__left',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
        
        gsap.fromTo('.contact-hero__right',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
        );
    }
});

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccordionFAQ, InlineContactForm };
}