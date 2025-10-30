// ============================================
// SIDE NAVIGATION PANEL CONTROLLER
// ============================================

class SideNavController {
    constructor() {
        this.sideNav = document.querySelector('.side-nav');
        this.toggleBtn = document.querySelector('.side-nav__toggle');
        this.body = document.body;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.sideNav || !this.toggleBtn) return;
        

        this.toggleBtn.addEventListener('click', () => this.toggle());
        

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        

        this.setActiveHub();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.sideNav.classList.add('is-open');
        this.body.classList.add('side-nav-open');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.isOpen = false;
        this.sideNav.classList.remove('is-open');
        this.body.classList.remove('side-nav-open');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
    }

    setActiveHub() {
        const currentHub = this.body.getAttribute('data-hub');
        if (!currentHub) return;
        

        const navItems = document.querySelectorAll('.side-nav__item');
        navItems.forEach(item => {
            item.classList.remove('side-nav__item--active');
            const link = item.querySelector('.side-nav__link');
            if (link) {
                link.removeAttribute('aria-current');
            }
        });
        

        const activeLink = document.querySelector(`.side-nav__link[href*="${currentHub}"]`);
        if (activeLink) {
            const activeItem = activeLink.closest('.side-nav__item');
            if (activeItem) {
                activeItem.classList.add('side-nav__item--active');
                activeLink.setAttribute('aria-current', 'page');
            }
        }
    }
}

// init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('hub-page')) {
        window.sideNavController = new SideNavController();
    }
});

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SideNavController;
}