// ============================================
// MOVIE UI RENDERER
// ============================================

class MovieRenderer {
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
    // RENDER MOVIES
    // ============================================

    render(movies) {
        if (!this.container) {
            console.error('Container not set for MovieRenderer');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        // If no movies, show empty state
        if (!movies || movies.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Create and append cards
        movies.forEach((movie, index) => {
            const card = this.createMovieCard(movie, index);
            this.container.appendChild(card);
        });

        // Trigger stagger animation if GSAP is available
        if (typeof gsap !== 'undefined') {
            this.animateCards();
        }
    }

    // ============================================
    // CREATE MOVIE CARD
    // ============================================

    createMovieCard(movie, index) {
        const card = document.createElement('article');
        card.className = 'content-card content-card--movie';
        card.setAttribute('data-type', 'movie');
        card.setAttribute('data-id', movie.id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Create card HTML
        card.innerHTML = `
            <div class="content-card__image-wrapper">
                <img 
                    src="${movie.image}" 
                    alt="${this.escapeHtml(movie.title)}"
                    class="content-card__image"
                    loading="lazy"
                    onerror="this.src='${movie.image}'"
                >
                <div class="content-card__overlay">
                    <button 
                        class="content-card__play-btn" 
                        aria-label="View details for ${this.escapeHtml(movie.title)}"
                        data-movie-id="${movie.id}"
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1" fill="none"/>
                            <polygon points="10 8 16 12 10 16 10 8" fill="white"></polygon>
                        </svg>
                    </button>
                </div>
                ${this.renderRatingBadge(movie.rating)}
            </div>
            
            <div class="content-card__content">
                <h3 class="content-card__title">${this.escapeHtml(movie.title)}</h3>
                
                <div class="content-card__meta">
                    <span class="content-card__meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${movie.releaseYear}
                    </span>
                    <span class="content-card__meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        ${movie.rating}
                    </span>
                </div>
                
                <p class="content-card__description">${this.escapeHtml(movie.description)}</p>
                
                <div class="content-card__actions">
                    <a 
                        href="${movie.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="content-card__btn content-card__btn--primary"
                        aria-label="View on TMDB: ${this.escapeHtml(movie.title)}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        More Info
                    </a>
                    
                    <button 
                        class="content-card__btn content-card__btn--secondary"
                        aria-label="Add to watchlist"
                        data-action="watchlist"
                        data-item-id="${movie.id}"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachCardEvents(card, movie);

        return card;
    }

    // ============================================
    // RENDER RATING BADGE
    // ============================================

    renderRatingBadge(rating) {
        if (!rating || rating === 'N/A') return '';
        
        const numRating = parseFloat(rating);
        let badgeClass = 'rating-badge';
        
        if (numRating >= 8) {
            badgeClass += ' rating-badge--excellent';
        } else if (numRating >= 7) {
            badgeClass += ' rating-badge--good';
        } else if (numRating >= 6) {
            badgeClass += ' rating-badge--average';
        } else {
            badgeClass += ' rating-badge--low';
        }
        
        return `
            <div class="${badgeClass}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${rating}
            </div>
        `;
    }

    // ============================================
    // ATTACH CARD EVENTS
    // ============================================

    attachCardEvents(card, movie) {
        // Watchlist button
        const watchlistBtn = card.querySelector('[data-action="watchlist"]');
        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleWatchlist(movie, watchlistBtn);
            });
        }

        // Play/Info button
        const playBtn = card.querySelector('.content-card__play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMovieDetails(movie);
            });
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
    // HANDLE WATCHLIST
    // ============================================

    handleWatchlist(movie, button) {
        // Toggle watchlist state
        const isInWatchlist = button.classList.toggle('watchlisted');
        
        // Update button visual
        const svg = button.querySelector('svg');
        if (isInWatchlist) {
            svg.setAttribute('fill', 'currentColor');
            button.style.color = 'var(--color-accent-red)';
            
            // Save to localStorage
            this.saveToWatchlist(movie);
            
            // Show feedback
            this.showToast('Added to watchlist!');
        } else {
            svg.setAttribute('fill', 'none');
            button.style.color = '';
            
            // Remove from localStorage
            this.removeFromWatchlist(movie.id);
            
            // Show feedback
            this.showToast('Removed from watchlist');
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
    // HANDLE MOVIE DETAILS
    // ============================================

    handleMovieDetails(movie) {
        // Create and show modal with movie details
        this.showMovieModal(movie);
    }

    // ============================================
    // SHOW MOVIE MODAL
    // ============================================

    showMovieModal(movie) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.movie-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="movie-modal__overlay" data-close-modal></div>
            <div class="movie-modal__content">
                <button class="movie-modal__close" aria-label="Close modal" data-close-modal>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div class="movie-modal__backdrop" style="background-image: url('${movie.backdrop || movie.imageLarge}')"></div>
                
                <div class="movie-modal__info">
                    <div class="movie-modal__poster">
                        <img src="${movie.imageLarge}" alt="${this.escapeHtml(movie.title)}">
                    </div>
                    
                    <div class="movie-modal__details">
                        <h2 class="movie-modal__title">${this.escapeHtml(movie.title)}</h2>
                        
                        <div class="movie-modal__meta">
                            <span class="movie-modal__year">${movie.releaseYear}</span>
                            <span class="movie-modal__rating">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                ${movie.rating} / 10
                            </span>
                            <span class="movie-modal__votes">${this.formatNumber(movie.voteCount)} votes</span>
                        </div>
                        
                        <p class="movie-modal__overview">${this.escapeHtml(movie.overview)}</p>
                        
                        <div class="movie-modal__actions">
                            <a 
                                href="${movie.link}" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                class="content-card__btn content-card__btn--primary"
                            >
                                View on TMDB
                            </a>
                            <button 
                                class="content-card__btn content-card__btn--secondary"
                                data-action="watchlist-modal"
                            >
                                Add to Watchlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate modal in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.movie-modal__content'),
                { opacity: 0, scale: 0.9, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
        }

        // Add event listeners
        const closeButtons = modal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(modal));
        });

        const watchlistBtn = modal.querySelector('[data-action="watchlist-modal"]');
        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', () => {
                this.handleWatchlist(movie, watchlistBtn);
            });
        }

        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // ============================================
    // CLOSE MODAL
    // ============================================

    closeModal(modal) {
        if (typeof gsap !== 'undefined') {
            gsap.to(modal.querySelector('.movie-modal__content'), {
                opacity: 0,
                scale: 0.9,
                y: 50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    modal.remove();
                    document.body.style.overflow = '';
                }
            });
        } else {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // ============================================
    // LOCAL STORAGE HELPERS
    // ============================================

    saveToWatchlist(movie) {
        const watchlist = this.getWatchlist();
       
        if (!watchlist.some(m => String(m.id) === String(movie.id))) {
            
            const minimal = {
                id: movie.id,
                title: movie.title,
                image: movie.image || movie.imageLarge || '',
                imageLarge: movie.imageLarge || '',
                link: movie.link,
                rating: movie.rating || 'N/A',
                releaseYear: movie.releaseYear || '',
                overview: movie.overview || movie.description || '',
                mood: this.getCurrentMood()
            };
            watchlist.push(minimal);
        }
        localStorage.setItem('flowstate_movie_watchlist', JSON.stringify(watchlist));
    }

    getCurrentMood() {
        const path = window.location.pathname.toLowerCase();
        const hubs = ['focus','relax','energize','creative','melancholy'];
        for (const h of hubs) {
            if (path.includes(h)) return h;
        }
        return 'unknown';
    }

    removeFromWatchlist(movieId) {
        let watchlist = this.getWatchlist();
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('flowstate_movie_watchlist', JSON.stringify(watchlist));
    }

    getWatchlist() {
        try {
            const stored = localStorage.getItem('flowstate_movie_watchlist');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading watchlist:', error);
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
                <p>Loading movie recommendations...</p>
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
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                    <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
                <h3>No movies found</h3>
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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
    module.exports = MovieRenderer;
}