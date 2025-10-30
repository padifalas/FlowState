// ============================================
// GAME UI RENDERER (Nintendo Switch Style)
// ============================================

class GameRenderer {
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
    // RENDER GAMES
    // ============================================

    render(games) {
        if (!this.container) {
            console.error('Container not set for GameRenderer');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        // If no games, show empty state
        if (!games || games.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Create and append cards
        games.forEach((game, index) => {
            const card = this.createGameCard(game, index);
            this.container.appendChild(card);
        });

        // Trigger stagger animation if GSAP is available
        if (typeof gsap !== 'undefined') {
            this.animateCards();
        }
    }

    // ============================================
    // CREATE GAME CARD (Nintendo Switch Style)
    // ============================================

    createGameCard(game, index) {
        const card = document.createElement('article');
        card.className = 'game-card';
        card.setAttribute('data-type', 'game');
        card.setAttribute('data-id', game.id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Create card HTML with Nintendo Switch styling
        card.innerHTML = `
            <div class="game-card__inner">
                <div class="game-card__image-wrapper">
                    <img 
                        src="${this.getImageUrl(game)}" 
                        alt="${this.escapeHtml(game.title)}"
                        class="game-card__image"
                        loading="lazy"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22%3E%3Crect fill=%22%23282D35%22 width=%22300%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23898A85%22 font-family=%22sans-serif%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                    >
                    <div class="game-card__overlay">
                        <button class="game-card__play-btn" data-game-id="${game.id}" aria-label="Play ${this.escapeHtml(game.title)}">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>
                    ${this.renderBadges(game)}
                </div>
                
                <div class="game-card__content">
                    <h3 class="game-card__title">${this.escapeHtml(game.title)}</h3>
                    
                    <div class="game-card__meta">
                        <span class="game-card__meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${game.rating}
                        </span>
                        <span class="game-card__meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${game.duration}
                        </span>
                        <span class="game-card__difficulty game-card__difficulty--${game.difficulty}">
                            ${this.getDifficultyIcon(game.difficulty)}
                            ${game.difficulty}
                        </span>
                    </div>
                    
                    <div class="game-card__tags">
                        ${this.renderTags(game.tags)}
                    </div>
                    
                    <div class="game-card__actions">
                        <button class="game-card__btn game-card__btn--primary" data-action="play" data-game-id="${game.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="1"></circle>
                                <text x="12" y="16" text-anchor="middle" fill="currentColor" font-size="12">A</text>
                            </svg>
                            START
                        </button>
                        <button class="game-card__btn game-card__btn--secondary" data-action="favorite" data-game-id="${game.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachCardEvents(card, game);

        return card;
    }

    // ============================================
    // RENDER BADGES
    // ============================================

    renderBadges(game) {
        const badges = [];
        
        // Popular badge
        if (game.plays > 10000) {
            badges.push('<span class="game-card__badge game-card__badge--popular">Popular</span>');
        }
        
        // New badge (if game has a recent date - placeholder logic)
        if (game.isNew) {
            badges.push('<span class="game-card__badge game-card__badge--new">New</span>');
        }
        
        return badges.join('');
    }

    // ============================================
    // RENDER TAGS
    // ============================================

    renderTags(tags) {
        if (!tags || tags.length === 0) return '';
        
        return tags.slice(0, 3).map(tag => 
            `<span class="game-card__tag">${this.escapeHtml(tag)}</span>`
        ).join('');
    }

    // ============================================
    // GET DIFFICULTY ICON
    // ============================================

    getDifficultyIcon(difficulty) {
        const icons = {
            easy: '●',
            medium: '●●',
            hard: '●●●'
        };
        return icons[difficulty] || '●';
    }

    // ============================================
    // ATTACH CARD EVENTS
    // ============================================

    attachCardEvents(card, game) {
        // Play buttons
        const playButtons = card.querySelectorAll('[data-action="play"], .game-card__play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePlay(game);
            });
        });

        // Favorite button
        const favoriteBtn = card.querySelector('[data-action="favorite"]');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFavorite(game, favoriteBtn);
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
    // HANDLE PLAY
    // ============================================

    handlePlay(game) {
        // Open game in new window/tab
        if (game.url && game.url !== '#') {
            window.open(game.url, '_blank', 'noopener,noreferrer');
        } else {
            this.showToast('Game coming soon! This is a demo.');
        }
    }

    // ============================================
    // HANDLE FAVORITE
    // ============================================

    handleFavorite(game, button) {
        const isFavorited = button.classList.toggle('favorited');
        
        const svg = button.querySelector('svg');
        if (isFavorited) {
            svg.setAttribute('fill', 'currentColor');
            button.style.color = 'var(--color-accent-red)';
            this.saveFavorite(game);
            this.showToast('Added to favorites!');
        } else {
            svg.setAttribute('fill', 'none');
            button.style.color = '';
            this.removeFavorite(game.id);
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
    // LOCAL STORAGE
    // ============================================

    saveFavorite(game) {
        const favorites = this.getFavorites();
        favorites.push(game);
        localStorage.setItem('flowstate_game_favorites', JSON.stringify(favorites));
    }

    removeFavorite(gameId) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(fav => fav.id !== gameId);
        localStorage.setItem('flowstate_game_favorites', JSON.stringify(favorites));
    }

    getFavorites() {
        try {
            const stored = localStorage.getItem('flowstate_game_favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading favorites:', error);
            return [];
        }
    }

    // ============================================
    // RENDER STATES
    // ============================================

    renderLoadingState() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner" aria-hidden="true"></div>
                <p>Loading games...</p>
            </div>
        `;
    }

    renderEmptyState() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="8" rx="1"></rect>
                    <path d="M16 3h2v4h-2zM6 3h2v4H6z"></path>
                    <circle cx="7.5" cy="11.5" r="1.5"></circle>
                    <path d="M13 9.5h4M15 7.5v4"></path>
                </svg>
                <h3>No games found</h3>
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
    // ANIMATE CARDS
    // ============================================

    animateCards() {
        const cards = this.container.querySelectorAll('.game-card');
        
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

    getImageUrl(game) {
        return game.cover || game.thumbnail || '';
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
    module.exports = GameRenderer;
}