// ============================================
//  FAQ page
// ============================================

if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

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
//  MODAL CONTACT FORM
// ============================================

class ModalContactForm {
    constructor() {
        const initializeForm = () => {
            this.modal = document.getElementById('contact-modal');
            this.form = document.getElementById('contact-form-modal');
            this.openButton = document.getElementById('open-contact-modal');
            this.closeButton = document.getElementById('close-contact-modal');
            
            if (!this.modal || !this.form || !this.openButton || !this.closeButton) {
                console.error('[Modal Form] Required elements not found');
                return;
            }
            
            this.submitButton = this.form.querySelector('.form-submit');
            this.submitText = this.form.querySelector('.form-submit__text');
            this.submitLoading = this.form.querySelector('.form-submit__loading');
            this.successMessage = this.form.querySelector('.form-success');
            this.failureMessage = this.form.querySelector('.form-failure');
            this.messageCounter = document.getElementById('message-counter');
            this.messageField = document.getElementById('message');
            
            if (!this.submitButton) {
                console.error('[Modal Form] Submit button not found');
                return;
            }
            
            console.debug('[Modal Form] All elements found, initializing...');
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
      
        this.openButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

       
        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });

     
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.hidden) {
                this.closeModal();
            }
        });

      
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal() {
        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // reseet form and hide messages
        this.hideMessages();
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.95, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
        }

       
        setTimeout(() => {
            const firstInput = this.form.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    closeModal() {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.modal.querySelector('.modal-content'), {
                opacity: 0,
                scale: 0.95,
                y: 20,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    this.modal.hidden = true;
                    document.body.style.overflow = '';
                }
            });
        } else {
            this.modal.hidden = true;
            document.body.style.overflow = '';
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
    // REAL-TIME VALIDATION
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

        // validationns form
        if (!this.validateForm()) {
            this.showError('Please fix the errors above before submitting.');
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const formAction = this.form.getAttribute('action');

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
                
                // close form after 3 seconds
                setTimeout(() => {
                    this.closeModal();
                }, 3000);
            } else {
                const data = await response.json();
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.message).join(', ');
                    throw new Error(errorMessages);
                } else {
                    throw new Error('Form submission failed');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(error.message || 'Sorry, something went wrong. Please try again later.');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        if (!this.submitButton) return;
        
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <span class="spinner"></span>
                Sending...
            `;
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Send Message';
        }
    }

    showSuccess() {
        if (this.successMessage) {
            this.successMessage.style.display = 'flex';
            this.successMessage.hidden = false;
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.successMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
            }
        }
    }

    showError(message) {
        if (this.failureMessage) {
            const errorText = this.failureMessage.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
            this.failureMessage.style.display = 'flex';
            this.failureMessage.hidden = false;
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.failureMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
            }
        }
    }

    hideMessages() {
        if (this.successMessage) {
            this.successMessage.style.display = 'none';
            this.successMessage.hidden = true;
        }
        if (this.failureMessage) {
            this.failureMessage.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', () => {
    // init accordion
    new AccordionFAQ();
    
    // init modal contact form
    new ModalContactForm();
    
    // init smooth scroll
    initSmoothScroll();
    
    // GSAP animations
    if (typeof gsap !== 'undefined') {
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
    module.exports = { AccordionFAQ, ModalContactForm };
}