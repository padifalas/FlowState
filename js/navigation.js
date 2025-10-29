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

    init() {
        if (this.navElement) {
            this.render();
            this.attachEvents();
        }
    }

    render() {
        const isHomepage = this.currentPage === 'index';
    // compute a relative prefix to reach site root from current path
        // robustly handle file:// paths and nested folders
        const rawSegments = window.location.pathname.split('/').filter(Boolean);
        // remove filename if present (contains a dot, e.g., index.html)
        let segments = rawSegments.slice();
        const last = segments[segments.length - 1] || '';
        if (last.indexOf('.') !== -1) {
            segments = segments.slice(0, -1);
        }

    
        if (segments.length && /^[A-Za-z]:$/.test(segments[0])) {
            segments = segments.slice(1);
        }

        const upLevels = Math.max(0, segments.length);
        const relPrefix = '../'.repeat(upLevels);

    
        if (window && window.location && window.console && window.console.debug) {
            console.debug('[Navigation] pathname=', window.location.pathname, 'segments=', rawSegments, 'dirs=', segments, 'relPrefix=', relPrefix);
        }

        // If a <base> tag is present (useful for GitHub Pages project sites), prefer that for building hrefs.
        // Example: <base href="/repo-name/"> will make links resolve to /repo-name/index.html etc.
        const baseEl = document.querySelector && document.querySelector('base');
        const baseHrefRaw = baseEl ? baseEl.getAttribute('href') : null;
        const normalizedBase = baseHrefRaw ? (baseHrefRaw.endsWith('/') ? baseHrefRaw : baseHrefRaw + '/') : null;

        // compute logo href/src depending on presence of base
        const logoHref = normalizedBase ? (normalizedBase + 'index.html') : (relPrefix + 'index.html');
        const logoSrc = normalizedBase ? (normalizedBase + 'assets/logo.svg') : (relPrefix + 'assets/logo.svg');
        
        const navLinks = isHomepage 
            ? [
                { name: 'Home', href: 'index.html', id: 'index' },
                { name: 'About', href: '#about', id: 'about' },
                { name: 'Hubs', href: '#mood-hubs', id: 'hubs' },
                { name: 'Contact', href: 'contact.html', id: 'contact' }
              ]
            : [
                { name: 'Home', href: 'index.html', id: 'index' },
                { name: 'About', href: 'index.html#about', id: 'about' },
                { name: 'Hubs', href: 'index.html#mood-hubs', id: 'hubs' },
                { name: 'Contact', href: 'contact.html', id: 'contact' }
              ];


        const navHTML = `
            <div class="nav-container">
                <a href="${logoHref}" class="nav-logo" aria-label="FlowState Home">
                    <img src="${logoSrc}" alt="FlowState" class="nav-logo__image">
                </a>

                <!-- Mobile toggle -->
                <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links-list" aria-label="Toggle navigation">
                    <span class="visually-hidden">Toggle navigation</span>
                    <span class="nav-toggle__bar"></span>
                    <span class="nav-toggle__bar"></span>
                    <span class="nav-toggle__bar"></span>
                </button>

                <ul id="nav-links-list" class="nav-links" role="list">
                    ${navLinks.map(link => {
                        const isActive =
                            (link.id === 'index' && this.currentPage === 'index') ||
                            (link.id === 'contact' && this.currentPage === 'contact');
                        // If a base href is declared, build links from it; otherwise use relPrefix.
                        const href = normalizedBase
                            ? (normalizedBase + link.href)
                            : (isHomepage && link.href.startsWith('#') ? link.href : (relPrefix + link.href));
                        return `
                        <li class="nav-item">
                            <a href="${href}"
                               class="nav-link${isActive ? ' active' : ''}"
                               data-link-id="${link.id}">
                                <span class="nav-link__text">${link.name}</span>
                            </a>
                        </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;

        this.navElement.innerHTML = navHTML;
    }

    attachEvents() {
        const navLinks = this.navElement.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', this.handleLinkHover);
            link.addEventListener('mouseleave', this.handleLinkLeave);

            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', this.handleAnchorClick);
            }

            // wil close   menu when a nav link is clicked 
            link.addEventListener('click', () => {
                const mobileList = this.navElement.querySelector('.nav-links');
                if (mobileList && mobileList.classList.contains('open')) {
                    this.closeMobileMenu();
                }
            });
        });

        // Mobile toggle button
        const toggle = this.navElement.querySelector('.nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        //menu will be closed 
        window.addEventListener('resize', () => {
            const mobileList = this.navElement.querySelector('.nav-links');
            if (mobileList && mobileList.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
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

        // add overlay
        let overlay = document.getElementById('nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'nav-overlay';
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }
        // allow transition
        requestAnimationFrame(() => overlay.classList.add('is-visible'));

        mobileList.classList.add('open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('is-open');
            // move focus to first link for accessibility
            const firstLink = mobileList.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        }

        // prevent background scroll
        document.body.style.overflow = 'hidden';

        // stagger children animation delays
        const items = Array.from(mobileList.querySelectorAll('.nav-item'));
        items.forEach((it, i) => {
            const delay = i * 45; // ms
            it.style.transitionDelay = `${delay}ms`;
        });

        // overlay click closes menu
        overlay.addEventListener('click', this._overlayClickHandler = (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });

        // keydown handler for ESC and focus trap
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

        // remove overlay
        const overlay = document.getElementById('nav-overlay');
        if (overlay) {
            overlay.classList.remove('is-visible');
            // remove after transition
            setTimeout(() => overlay.remove(), 300);
            if (this._overlayClickHandler) overlay.removeEventListener('click', this._overlayClickHandler);
            this._overlayClickHandler = null;
        }

        // re-enable background scroll
        document.body.style.overflow = '';

        // clear stagger inline styles
        const items = mobileList.querySelectorAll('.nav-item');
        items.forEach(it => { it.style.transitionDelay = ''; });

        // remove keydown handler
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
            // focus trap
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
        if (textElement) {
            textElement.style.transform = 'translateY(-3px)';
        }
    }

    handleLinkLeave(e) {
        const textElement = e.currentTarget.querySelector('.nav-link__text');
        if (textElement) {
            textElement.style.transform = 'translateY(0)';
        }
    }

    handleAnchorClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const navHeight = document.getElementById('main-navigation').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
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
        // previous button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        // next button
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // dots
        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('carousel-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goToSlide(index);
                }
            });
        }

        // trying keyboard navigation
        this.track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });

        // touhscreen/swipe support
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
        // cal transform
        const cardWidth = this.cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
        const translateX = -(this.currentIndex * (cardWidth + gap) * this.cardsPerView);
        
        this.track.style.transform = `translateX(${translateX}px)`;

       
        this.updateButtons();
        
       
        this.updateDots();

        
        this.track.setAttribute('aria-live', 'polite');
    }

    updateButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        // hide on prev btn first slide
        if (this.currentIndex === 0) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0';
            this.prevBtn.style.pointerEvents = 'none';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
            this.prevBtn.style.pointerEvents = 'auto';
        }

        //  hide next btn last slide
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
            
            // wil;; reset to first slide if current index is out of bounds
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
// INITIALIZE ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Navigation
    new Navigation();
    
    // Initialize Carousel
    new MoodHubsCarousel();
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, MoodHubsCarousel };
}