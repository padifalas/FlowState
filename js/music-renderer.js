// ============================================
// MUSIC UI RENDERER
// ============================================

class MusicRenderer {
    constructor() {
        this.container = null;
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

        // clearing existing content
        this.container.innerHTML = '';

        // If no items, show empty state
        if (!items || items.length === 0) {
            this.renderEmptyState();
            return;
        }

        // creates and append cards
        items.forEach((item, index) => {
            const card = this.createMusicCard(item, index);
            this.container.appendChild(card);
        });

        // trigeer stagger animation [will add GSAP animations later]
        if (typeof gsap !== 'undefined') {
            this.animateCards();
        }
    }

    // ============================================
    // CREATE MUSIC CARD
    // ============================================

    createMusicCard(item, index) {
        const card = document.createElement('article');
        card.className = 'content-card content-card--music';
        card.setAttribute('data-type', item.type);
        card.setAttribute('data-id', item.id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Create card HTML
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
                ${item.preview ? '<span class="content-card__play-overlay" aria-label="Preview available"><svg width="48" height="48" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>' : ''}
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
                
                <p class="content-card__description">${this.escapeHtml(item.description)}</p>
                
                <div class="content-card__actions">
                    <a 
                        href="${item.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="content-card__btn content-card__btn--primary"
                        aria-label="Listen on Deezer: ${this.escapeHtml(item.title)}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
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

        //  event listeners
        this.attachCardEvents(card, item);

        return card;
    }

    // ============================================
    // ATTACH CARD EVENTS
    // ============================================

    attachCardEvents(card, item) {
        // Favorite button
        const favoriteBtn = card.querySelector('[data-action="favorite"]');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFavorite(item, favoriteBtn);
            });
        }

        // Preview play functionality (if preview available)
        if (item.preview) {
            const playOverlay = card.querySelector('.content-card__play-overlay');
            if (playOverlay) {
                playOverlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePreview(item);
                });
            }
        }

        // Card hover effect
        card.addEventListener('mouseenter', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    y: -8,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }

    // ============================================
    // HANDLE FAVORITE
    // ============================================

    handleFavorite(item, button) {
        // Toggle favorite state
        const isFavorited = button.classList.toggle('favorited');
        
        // Update button visual
        const svg = button.querySelector('svg');
        if (isFavorited) {
            svg.setAttribute('fill', 'currentColor');
            button.style.color = 'var(--color-accent-red)';
            
            // Save to localStorage
            this.saveFavorite(item);
            
            // Show feedback
            this.showToast('Added to favorites!');
        } else {
            svg.setAttribute('fill', 'none');
            button.style.color = '';
            
            // Remove from localStorage
            this.removeFavorite(item.id);
            
            // Show feedback
            this.showToast('Removed from favorites');
        }

        // Animate button
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

        // Create or get audio player
        let audio = document.getElementById('music-preview-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'music-preview-player';
            document.body.appendChild(audio);
        }

        // If already playing this track, pause it
        if (audio.src === item.preview && !audio.paused) {
            audio.pause();
            this.showToast('Preview paused');
            return;
        }

        // Play new preview
        audio.src = item.preview;
        audio.play();
        this.showToast(`Playing preview: ${item.title}`);

        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (audio.src === item.preview) {
                audio.pause();
            }
        }, 30000);
    }

    // ============================================
    // LOCAL STORAGE HELPERS
    // ============================================

    saveFavorite(item) {
        const favorites = this.getFavorites();
        favorites.push(item);
        localStorage.setItem('flowstate_music_favorites', JSON.stringify(favorites));
    }

    removeFavorite(itemId) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(fav => fav.id !== itemId);
        localStorage.setItem('flowstate_music_favorites', JSON.stringify(favorites));
    }

    getFavorites() {
        try {
            const stored = localStorage.getItem('flowstate_music_favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading favorites:', error);
            return [];
        }
    }

    // ============================================
    // RENDER LOADING STATE
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

    // ============================================
    // RENDER EMPTY STATE
    // ============================================

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

    // ============================================
    // RENDER ERROR STATE
    // ============================================

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
    // ANIMATE CARDS
    // ============================================

    animateCards() {
        const cards = this.container.querySelectorAll('.content-card');
        
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
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
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(toast,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.3 }
            );
        }

        // Remove after duration
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