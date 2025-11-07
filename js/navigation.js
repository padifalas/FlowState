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

    detectPageLevel() {
        const path = window.location.pathname;
        const url = window.location.href;
        
        console.log('[Navigation] Full pathname:', path);
        console.log('[Navigation] Full URL:', url);
        
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
                { name: 'Watchlist', href: 'watchlist.html', id: 'watchlist', isAnchor: false },
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
                    name: 'Watchlist', 
                    href: relPrefix ? `${relPrefix}watchlist.html` : 'watchlist.html', 
                    id: 'watchlist', 
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
        
        console.log('[Navigation] Generated links:', navLinks.map(l => `${l.name}: ${l.href}`));
    }

    isLinkActive(linkId) {
        const currentPage = this.currentPage;
        
        if (linkId === 'home' && (currentPage === 'index' || currentPage === '')) {
            return true;
        }
        
        if (linkId === 'contact' && currentPage === 'contact') {
            return true;
        }
        if (linkId === 'watchlist' && currentPage === 'watchlist') {
            return true;
        }
        
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
                            window.location.assign(href);
                        }
                    }, 10);
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
// MOOD HUBS HORIZONTAL SCROLL
// ============================================

class MoodHubsScroll {
    constructor() {
        this.container = document.getElementById('mood-hubs-scroll-container');
        this.scrollIndicator = document.getElementById('scroll-progress-indicator');
        this.scrollHint = document.querySelector('.scroll-hint');
        
        if (!this.container) return;

        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.velocity = 0;
        
        this.init();
    }

    init() {
        this.updateScrollIndicator();
        this.attachScrollListener();
        this.attachMouseDrag();
        this.attachTouchSupport();
        this.attachKeyboardNav();
        
        // Hide scroll hint after first interaction
        const hideHint = () => {
            if (this.scrollHint) {
                this.scrollHint.style.opacity = '0';
                setTimeout(() => {
                    if (this.scrollHint) this.scrollHint.style.display = 'none';
                }, 300);
            }
        };
        
        this.container.addEventListener('scroll', hideHint, { once: true });
        this.container.addEventListener('mousedown', hideHint, { once: true });
        this.container.addEventListener('touchstart', hideHint, { once: true });
    }

    attachScrollListener() {
        this.container.addEventListener('scroll', () => {
            this.updateScrollIndicator();
        });
    }

    updateScrollIndicator() {
        if (!this.scrollIndicator) return;

        const scrollLeft = this.container.scrollLeft;
        const scrollWidth = this.container.scrollWidth - this.container.clientWidth;
        const scrollPercentage = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;

        this.scrollIndicator.style.width = `${scrollPercentage}%`;
    }

    attachMouseDrag() {
        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.pageX - this.container.offsetLeft;
            this.scrollLeft = this.container.scrollLeft;
            this.container.style.cursor = 'grabbing';
            this.container.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.container.offsetLeft;
            const walk = (x - this.startX) * 2; // Scroll speed multiplier
            this.container.scrollLeft = this.scrollLeft - walk;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.container.style.cursor = 'grab';
                this.container.style.userSelect = '';
            }
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.container.style.cursor = 'grab';
                this.container.style.userSelect = '';
            }
        });
    }

    attachTouchSupport() {
        let touchStartX = 0;
        let touchStartScrollLeft = 0;

        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartScrollLeft = this.container.scrollLeft;
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const diff = touchStartX - touchX;
            this.container.scrollLeft = touchStartScrollLeft + diff;
        }, { passive: true });
    }

    attachKeyboardNav() {
        this.container.addEventListener('keydown', (e) => {
            const scrollAmount = 300;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.smoothScrollBy(-scrollAmount);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.smoothScrollBy(scrollAmount);
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.smoothScrollTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.smoothScrollTo(this.container.scrollWidth);
            }
        });
    }

    smoothScrollBy(amount) {
        this.container.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
    }

    smoothScrollTo(position) {
        this.container.scrollTo({
            left: position,
            behavior: 'smooth'
        });
    }
}

// ============================================
// INIT ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Init Navigation
    new Navigation();
    
    // Init Mood Hubs Scroll
    if (document.getElementById('mood-hubs-scroll-container')) {
        new MoodHubsScroll();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, MoodHubsScroll };
}