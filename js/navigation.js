// ============================================
// NAVIGATION SYSTEM
// ============================================

class Navigation {
    constructor() {
        this.navElement = document.getElementById('main-navigation');
        this.currentPage = this.getCurrentPage();
        this.init();
        this.updateCopyrightYear();
    }

    updateCopyrightYear() {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '') || 'index';
    }

    /**
     * detec which level we're at based on folder structure
     * returnsns: 'root', 'hubs', or 'nested-hubs'
     */
    detectPageLevel() {
        const path = window.location.pathname;
        const url = window.location.href;
        
        console.log('[Navigation] Full pathname:', path);
        console.log('[Navigation] Full URL:', url);
        
        // check if we're in a hub folder
        const isInHubFolder = path.includes('/hubs/') || 
                             path.includes('\\hubs\\') ||
                             url.includes('/hubs/');
        
        if (isInHubFolder) {
           
            const hubPath = path.split('/hubs/')[1] || path.split('\\hubs\\')[1];
            if (hubPath) {
                const depth = hubPath.split(/[/\\]/).filter(Boolean).length;
                console.log('[Navigation] Hub folder depth:', depth);
                
                if (depth >= 2) {
                    console.log('[Navigation] Detected: nested hub folder');
                    return 'nested-hubs';
                }
            }
            console.log('[Navigation] Detected: hub folder');
            return 'hubs';
        }
        
        // will chec if we're at root level but accessing a hub file directly
        const filename = path.split('/').pop() || '';
        const hubFiles = [
            'focus.html', 'relax.html', 'energize.html', 'creative.html', 'melancholy.html',
            'focus-hub.html', 'relax-hub.html', 'energize-hub.html', 'creative-hub.html', 'melancholy-hub.html'
        ];
        
        if (hubFiles.includes(filename)) {
            console.log('[Navigation] Detected: hub file at root level');
            return 'hubs';
        }
        
        console.log('[Navigation] Detected: at root level');
        return 'root';
    }


    getRelativePrefix() {
        const pageLevel = this.detectPageLevel();
        
        console.log('[Navigation] Page level for prefix:', pageLevel);
        
        switch (pageLevel) {
            case 'nested-hubs':
               
                return '../../';
            case 'hubs':
               
                return '../';
            case 'root':
            default:
                return '';
        }
    }


    isHomepage() {
        const filename = window.location.pathname.split('/').pop() || '';
        return filename === '' || filename === 'index.html' || filename === '/' || filename === 'index';
    }

    init() {
        if (this.navElement) {
            this.render();
            this.attachEvents();
        }
    }

    render() {
        const isHomepage = this.isHomepage();
        const relPrefix = this.getRelativePrefix();
        const pageLevel = this.detectPageLevel();
        
        console.log('[Navigation] Final calculation:');
        console.log('[Navigation] Page Level:', pageLevel);
        console.log('[Navigation] Is Homepage?', isHomepage);
        console.log('[Navigation] Relative Prefix:', relPrefix || '(none - at root)');

       
        let navLinks;
        
        if (isHomepage) {
         
            navLinks = [
                { name: 'Home', href: '#home', id: 'home', isAnchor: true },
                { name: 'About', href: '#about', id: 'about', isAnchor: true },
                { name: 'Hubs', href: '#mood-hubs', id: 'hubs', isAnchor: true },
                { name: 'Contact', href: 'contact.html', id: 'contact', isAnchor: false }
            ];
        } else {
            
            navLinks = [
                { 
                    name: 'Home', 
                    href: relPrefix ? `${relPrefix}index.html` : 'index.html', 
                    id: 'home', 
                    isAnchor: false 
                },
                { 
                    name: 'About', 
                    href: relPrefix ? `${relPrefix}index.html#about` : 'index.html#about', 
                    id: 'about', 
                    isAnchor: false 
                },
                { 
                    name: 'Hubs', 
                    href: relPrefix ? `${relPrefix}index.html#mood-hubs` : 'index.html#mood-hubs', 
                    id: 'hubs', 
                    isAnchor: false 
                },
                { 
                    name: 'Contact', 
                    href: relPrefix ? `${relPrefix}contact.html` : 'contact.html', 
                    id: 'contact', 
                    isAnchor: false 
                }
            ];
        }

      
        const logoHref = relPrefix ? `${relPrefix}index.html` : 'index.html';
        const logoSrc = relPrefix ? `${relPrefix}assets/logo.svg` : 'assets/logo.svg';

        const navHTML = `
            <div class="nav-container">
                <a href="${logoHref}" class="nav-logo" aria-label="FlowState Home">
                    <img src="${logoSrc}" 
                         alt="FlowState" 
                         class="nav-logo__image" 
                         onerror="console.error('Logo failed to load from:', this.src); this.style.display='none';">
                </a>

                <!-- Mobile toggle -->
                <button class="nav-toggle" 
                        aria-expanded="false" 
                        aria-controls="nav-links-list" 
                        aria-label="Toggle navigation">
                    <span class="visually-hidden">Toggle navigation</span>
                    <span class="nav-toggle__bar"></span>
                    <span class="nav-toggle__bar"></span>
                    <span class="nav-toggle__bar"></span>
                </button>

                <ul id="nav-links-list" class="nav-links" role="list">
                    ${navLinks.map(link => {
                        const isActive = this.isLinkActive(link.id);
                        
                        return `
                        <li class="nav-item">
                            <a href="${link.href}"
                               class="nav-link${isActive ? ' active' : ''}"
                               data-link-id="${link.id}"
                               data-is-anchor="${link.isAnchor}">
                                <span class="nav-link__text">${link.name}</span>
                            </a>
                        </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;

        this.navElement.innerHTML = navHTML;
        
        
        console.log('[Navigation] generatedd links:', navLinks.map(l => `${l.name}: ${l.href}`));
    }

 
    isLinkActive(linkId) {
        const currentPage = this.currentPage;
        
        // home
        if (linkId === 'home' && (currentPage === 'index' || currentPage === '')) {
            return true;
        }
        
        // conta page
        if (linkId === 'contact' && currentPage === 'contact') {
            return true;
        }
        
        // hubb pages - check for both naming conventions
        const hubPages = [
            'creative-hub', 'energize-hub', 'focus-hub', 'melancholy-hub', 'relax-hub',
            'creative', 'energize', 'focus', 'melancholy', 'relax'
        ];
        if (linkId === 'hubs' && hubPages.includes(currentPage)) {
            return true;
        }
        
        return false;
    }

    attachEvents() {
        const navLinks = this.navElement.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', this.handleLinkHover);
            link.addEventListener('mouseleave', this.handleLinkLeave);

           
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const isAnchor = link.getAttribute('data-is-anchor') === 'true';
                const mobileList = this.navElement.querySelector('.nav-links');
                const isMobileMenuOpen = mobileList && mobileList.classList.contains('open');

                console.log('[Navigation] Link clicked:', href, 'Is anchor?', isAnchor);

             
                if (isMobileMenuOpen) {
                    e.preventDefault();
                    this.closeMobileMenu();
                    
                    setTimeout(() => {
                        if (isAnchor) {
                            this.scrollToAnchor(href);
                        } else {
                            console.log('[Navigation] Navigating to:', href);
                            window.location.href = href;
                        }
                    }, 300);
                } else if (isAnchor) {
                   
                    e.preventDefault();
                    this.scrollToAnchor(href);
                }
                
            });
        });

      
        const toggle = this.navElement.querySelector('.nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

       
        window.addEventListener('resize', () => {
            const mobileList = this.navElement.querySelector('.nav-links');
            if (mobileList && mobileList.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }


    scrollToAnchor(href) {
        const targetId = href.includes('#') ? href.split('#')[1] : href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const navHeight = this.navElement.offsetHeight || 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn('[Navigation] Target element not found:', targetId);
        }
    }

    toggleMobileMenu() {
        const mobileList = this.navElement.querySelector('.nav-links');
        if (!mobileList) return;

        if (mobileList.classList.contains('open')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const toggle = this.navElement.querySelector('.nav-toggle');
        const mobileList = this.navElement.querySelector('.nav-links');
        if (!mobileList) return;

     
        let overlay = document.getElementById('nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'nav-overlay';
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }
        requestAnimationFrame(() => overlay.classList.add('is-visible'));

        mobileList.classList.add('open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('is-open');
            const firstLink = mobileList.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        }

     
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');

       
        const items = Array.from(mobileList.querySelectorAll('.nav-item'));
        items.forEach((it, i) => {
            const delay = i * 45;
            it.style.transitionDelay = `${delay}ms`;
        });

       
        overlay.addEventListener('click', this._overlayClickHandler = (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });

       
        this._mobileKeydownHandler = this._handleMobileKeydown.bind(this);
        document.addEventListener('keydown', this._mobileKeydownHandler);
    }

    closeMobileMenu() {
        const toggle = this.navElement.querySelector('.nav-toggle');
        const mobileList = this.navElement.querySelector('.nav-links');
        if (!mobileList) return;

        mobileList.classList.remove('open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('is-open');
            toggle.focus();
        }

     
        const overlay = document.getElementById('nav-overlay');
        if (overlay) {
            overlay.classList.remove('is-visible');
            setTimeout(() => overlay.remove(), 300);
            if (this._overlayClickHandler) {
                overlay.removeEventListener('click', this._overlayClickHandler);
            }
            this._overlayClickHandler = null;
        }

       
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');

        
        const items = mobileList.querySelectorAll('.nav-item');
        items.forEach(it => { it.style.transitionDelay = ''; });

      
        if (this._mobileKeydownHandler) {
            document.removeEventListener('keydown', this._mobileKeydownHandler);
            this._mobileKeydownHandler = null;
        }
    }

    _handleMobileKeydown(e) {
        const mobileList = this.navElement.querySelector('.nav-links');
        if (!mobileList || !mobileList.classList.contains('open')) return;

        if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            this.closeMobileMenu();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = mobileList.querySelectorAll('a, button');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }

    handleLinkHover(e) {
        const textElement = e.currentTarget.querySelector('.nav-link__text');
        if (textElement && typeof gsap !== 'undefined') {
            gsap.to(textElement, { y: -3, duration: 0.3, ease: 'power2.out' });
        } else if (textElement) {
            textElement.style.transform = 'translateY(-3px)';
        }
    }

    handleLinkLeave(e) {
        const textElement = e.currentTarget.querySelector('.nav-link__text');
        if (textElement && typeof gsap !== 'undefined') {
            gsap.to(textElement, { y: 0, duration: 0.3, ease: 'power2.out' });
        } else if (textElement) {
            textElement.style.transform = 'translateY(0)';
        }
    }
}

// ============================================
// MOOD HUBS CAROUSEL
// ============================================

class MoodHubsCarousel {
    constructor() {
        this.track = document.getElementById('mood-hubs-track');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.dotsContainer = document.getElementById('carousel-dots');
        
        if (!this.track) return;

        this.cards = Array.from(this.track.children);
        this.currentIndex = 0;
        this.cardsPerView = this.getCardsPerView();
        this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
        
        this.init();
    }

    getCardsPerView() {
        const width = window.innerWidth;
        if (width >= 1024) return 3;
        if (width >= 768) return 2;
        return 1;
    }

    init() {
        this.createDots();
        this.updateCarousel();
        this.attachEvents();
        
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    createDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('role', 'tab');
            dot.dataset.index = i;
            
            if (i === 0) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.setAttribute('aria-selected', 'false');
            }
            
            this.dotsContainer.appendChild(dot);
        }
    }

    attachEvents() {
        // prev button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        // next btn
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

     
        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('carousel-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goToSlide(index);
                }
            });
        }

        
        this.track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });

      
        this.addSwipeSupport();
    }

    addSwipeSupport() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = startX - currentX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            isDragging = false;
        });
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }

    next() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const cardWidth = this.cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
        const translateX = -(this.currentIndex * (cardWidth + gap) * this.cardsPerView);
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this.track, {
                x: translateX,
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            this.track.style.transform = `translateX(${translateX}px)`;
        }
        
        this.updateButtons();
        this.updateDots();
        
        this.track.setAttribute('aria-live', 'polite');
    }

    updateButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        
        if (this.currentIndex === 0) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0';
            this.prevBtn.style.pointerEvents = 'none';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
            this.prevBtn.style.pointerEvents = 'auto';
        }

       
        if (this.currentIndex >= this.totalSlides - 1) {
            this.nextBtn.disabled = true;
            this.nextBtn.style.opacity = '0';
            this.nextBtn.style.pointerEvents = 'none';
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
            this.nextBtn.style.pointerEvents = 'auto';
        }
    }

    updateDots() {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    }

    handleResize() {
        const newCardsPerView = this.getCardsPerView();
        
        if (newCardsPerView !== this.cardsPerView) {
            this.cardsPerView = newCardsPerView;
            this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
            
            
            if (this.currentIndex >= this.totalSlides) {
                this.currentIndex = this.totalSlides - 1;
            }
            
            this.createDots();
            this.updateCarousel();
        } else {
            this.updateCarousel();
        }
    }
}

// ============================================
// INITT ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // init Navigation
    new Navigation();
    
  
    if (document.getElementById('mood-hubs-track')) {
        new MoodHubsCarousel();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, MoodHubsCarousel };
}