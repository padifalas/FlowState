// ============================================
// MUSIC CAROUSEL RENDERER
// ============================================

class MusicRenderer {
    constructor() {
        this.container = null;
        this.currentIndex = 0;
        this.itemsPerView = 4;
        this.items = [];
    }

    // ============================================
    // SET CONTAINER
    // ============================================

    setContainer(containerElement) {
        this.container = containerElement;
    }

    // ============================================
    // RENDER MUSIC ITEMS
    // ============================================

    render(items) {
        if (!this.container) {
            console.error('Container not set for MusicRenderer');
            return;
        }

        this.items = items;
        this.currentIndex = 0;

        // clearing existing content
        this.container.innerHTML = '';

        // if the ar no items, show empty state
        if (!items || items.length === 0) {
            this.renderEmptyState();
            return;
        }

        //  carousel structure
        const carousel = this.createCarousel(items);
        this.container.appendChild(carousel);

      
        this.attachCarouselEvents();

        //  stagger animation - NEED TO FIXXXX DAMN
        if (typeof gsap !== 'undefined') {
            this.animateCarouselIn();
        }
    }

    // ============================================
    // CREATE CAROUSEL
    // ============================================

    createCarousel(items) {
        const carousel = document.createElement('div');
        carousel.className = 'music-carousel';

        // prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'music-carousel__nav music-carousel__nav--prev';
        prevBtn.setAttribute('aria-label', 'Previous music items');
        prevBtn.disabled = true;
        prevBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        `;

        // next btn
        const nextBtn = document.createElement('button');
        nextBtn.className = 'music-carousel__nav music-carousel__nav--next';
        nextBtn.setAttribute('aria-label', 'Next music items');
        nextBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        `;

       
        const wrapper = document.createElement('div');
        wrapper.className = 'music-carousel__wrapper';

       
        items.forEach((item, index) => {
            const card = this.createMusicCard(item, index);
            wrapper.appendChild(card);
        });

        carousel.appendChild(prevBtn);
        carousel.appendChild(wrapper);
        carousel.appendChild(nextBtn);

        return carousel;
    }

    // ============================================
    //  MUSIC CARD
    // ============================================

    createMusicCard(item, index) {
        const card = document.createElement('article');
        card.className = 'content-card content-card--music';
        card.setAttribute('data-type', item.type);
        card.setAttribute('data-id', item.id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        card.innerHTML = `
            <div class="content-card__image-wrapper">
                <img 
                    src="${this.getImageUrl(item)}" 
                    alt="${this.escapeHtml(item.title)}"
                    class="content-card__image"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23282D35%22 width=%22300%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23898A85%22 font-family=%22sans-serif%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                >
                ${item.type === 'playlist' ? '<span class="content-card__badge">Playlist</span>' : ''}
                ${item.type === 'album' ? '<span class="content-card__badge">Album</span>' : ''}
                ${item.preview ? `
                <div class="content-card__play-overlay" aria-label="Preview available">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="12" r="11" fill="rgba(255, 255, 255, 0.95)" />
                        <polygon points="10 8 16 12 10 16" fill="#000" />
                    </svg>
                </div>
                ` : ''}
            </div>
            
            <div class="content-card__content">
                <h3 class="content-card__title">${this.escapeHtml(item.title)}</h3>
                
                <div class="content-card__meta">
                    <span class="content-card__meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        ${item.type === 'playlist' ? item.creator : item.artist}
                    </span>
                    ${item.trackCount ? `
                    <span class="content-card__meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${item.trackCount} tracks
                    </span>
                    ` : ''}
                </div>
                
                <div class="content-card__actions">
                    <a 
                        href="${item.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="content-card__btn content-card__btn--primary"
                        aria-label="Listen on Deezer: ${this.escapeHtml(item.title)}"
                    >
                        ${this.getDeezerLogo()}
                        Listen on Deezer
                    </a>
                    
                    <button 
                        class="content-card__btn content-card__btn--secondary"
                        aria-label="Add to favorites"
                        data-action="favorite"
                        data-item-id="${item.id}"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners
        this.attachCardEvents(card, item);

        return card;
    }

    // ============================================
    // GET DEEZER LOGO SVG
    // ============================================

    getDeezerLogo() {
        return `
            <svg class="deezer-logo" viewBox="0 0 240 240" fill="currentColor">
                <path d="M192 96h48v24h-48zM192 120h48v24h-48zM192 144h48v24h-48zM144 72h48v24h-48zM144 96h48v24h-48zM144 120h48v24h-48zM144 144h48v24h-48zM96 48h48v24H96zM96 72h48v24H96zM96 96h48v24H96zM96 120h48v24H96zM96 144h48v24H96zM48 96h48v24H48zM48 120h48v24H48zM48 144h48v24H48zM0 120h48v24H0zM0 144h48v24H0z"/>
            </svg>
        `;
    }


    attachCarouselEvents() {
        const prevBtn = this.container.querySelector('.music-carousel__nav--prev');
        const nextBtn = this.container.querySelector('.music-carousel__nav--next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.slidePrev());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.slideNext());
        }

        // Update navigation state
        this.updateNavigation();
    }

    // ============================================
    // SLIDE NAVV
    // ============================================

    slideNext() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }

    slidePrev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        const wrapper = this.container.querySelector('.music-carousel__wrapper');
        if (!wrapper) return;

        const cardWidth = wrapper.querySelector('.content-card')?.offsetWidth || 0;
        const gap = 24;
        const offset = -(this.currentIndex * (cardWidth + gap));

        if (typeof gsap !== 'undefined') {
            gsap.to(wrapper, {
                x: offset,
                duration: 0.32,
                ease: 'power1.out'
            });
        } else {
            wrapper.style.transition = 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
            wrapper.style.transform = `translateX(${offset}px)`;
        }

        this.updateNavigation();
    }

    updateNavigation() {
        const prevBtn = this.container.querySelector('.music-carousel__nav--prev');
        const nextBtn = this.container.querySelector('.music-carousel__nav--next');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
        }
        
        if (nextBtn) {
            const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
            nextBtn.disabled = this.currentIndex >= maxIndex;
        }
    }

  

    attachCardEvents(card, item) {
        // FAVE button
        const favoriteBtn = card.querySelector('[data-action="favorite"]');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFavorite(item, favoriteBtn);
            });
        }

    
        if (item.preview) {
            const playOverlay = card.querySelector('.content-card__play-overlay');
            if (playOverlay) {
                playOverlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePreview(item);
                });
            }
        }
    }



    handleFavorite(item, button) {
        const isFavorited = button.classList.toggle('favorited');
        
        const svg = button.querySelector('svg');
        if (isFavorited) {
            svg.setAttribute('fill', 'currentColor');
            button.style.color = 'var(--color-accent-red)';
            this.showToast('Added to favorites!');
        } else {
            svg.setAttribute('fill', 'none');
            button.style.color = '';
            this.showToast('Removed from favorites');
        }

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(button, 
                { scale: 1 },
                { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }
            );
        }
    }

    // ============================================
    // HANDLE PREVIEW
    // ============================================

    handlePreview(item) {
        if (!item.preview) return;

        let audio = document.getElementById('music-preview-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'music-preview-player';
            document.body.appendChild(audio);
        }

        if (audio.src === item.preview && !audio.paused) {
            audio.pause();
            this.showToast('Preview paused');
            return;
        }

        audio.src = item.preview;
        audio.play();
        this.showToast(`Playing preview: ${item.title}`);

        setTimeout(() => {
            if (audio.src === item.preview) {
                audio.pause();
            }
        }, 30000);
    }

    // ============================================
    // RENDER STATES
    // ============================================

    renderLoadingState() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner" aria-hidden="true"></div>
                <p>Loading music recommendations...</p>
            </div>
        `;
    }

    renderEmptyState() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <h3>No music found</h3>
                <p>Try adjusting your mood or check back later.</p>
            </div>
        `;
    }

    renderErrorState(message) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="error-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Oops! Something went wrong</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="content-card__btn" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    // ============================================
    // ANIMATE CAROUSEL IN
    // ============================================

    animateCarouselIn() {
        const cards = this.container.querySelectorAll('.content-card');
        
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out'
        });
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getImageUrl(item) {
        return item.image || item.imageLarge || '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, duration = 3000) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(toast,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.3 }
            );
        }

        setTimeout(() => {
            if (typeof gsap !== 'undefined') {
                gsap.to(toast, {
                    opacity: 0,
                    y: 50,
                    duration: 0.3,
                    onComplete: () => toast.remove()
                });
            } else {
                toast.remove();
            }
        }, duration);
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicRenderer;
}