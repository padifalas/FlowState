// ============================================
// GAME UI RENDERER (Carousel Style)
// ============================================

class GameRenderer {
    constructor() {
        this.container = null;
        this.currentIndex = 0;
        this.games = [];
        this.cardsPerView = 4; 
        this.autoPlayInterval = null;
    }

    // ============================================
    // SET CONTAINER
    // ============================================

    setContainer(containerElement) {
        this.container = containerElement;
        this.updateCardsPerView();
        
        // Update cards per view on resize
        window.addEventListener('resize', () => {
            this.updateCardsPerView();
        });
    }

    // ============================================
    // UPDATE CARDS PER VIEW 
    // ============================================

    updateCardsPerView() {
        const width = window.innerWidth;
        if (width < 640) {
            this.cardsPerView = 1;
        } else if (width < 1024) {
            this.cardsPerView = 2;
        } else if (width < 1440) {
            this.cardsPerView = 3;
        } else {
            this.cardsPerView = 4;
        }
    }

    // ============================================
    // RENDER GAMES (Carousel)
    // ============================================

    render(games) {
        if (!this.container) {
            console.error('Container not set for GameRenderer');
            return;
        }

        this.games = games;
        this.currentIndex = 0;

        if (!games || games.length === 0) {
            this.renderEmptyState();
            return;
        }

        //  carousel structure
        this.container.innerHTML = `
            <div class="game-carousel">
                <button class="game-carousel__nav game-carousel__nav--prev" aria-label="Previous games">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                
                <div class="game-carousel__viewport">
                    <div class="game-carousel__track">
                        <!-- Game cards will be inserted here -->
                    </div>
                </div>
                
                <button class="game-carousel__nav game-carousel__nav--next" aria-label="Next games">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            
            <div class="game-carousel__indicators" role="tablist" aria-label="Game carousel pages">
                <!-- Indicators will be inserted here -->
            </div>
        `;

        //  references
        const track = this.container.querySelector('.game-carousel__track');
        const prevBtn = this.container.querySelector('.game-carousel__nav--prev');
        const nextBtn = this.container.querySelector('.game-carousel__nav--next');
        const indicatorsContainer = this.container.querySelector('.game-carousel__indicators');

        //  game cards
        games.forEach((game, index) => {
            const card = this.createGameCard(game, index);
            track.appendChild(card);
        });

        //  indicators
        const pageCount = Math.ceil(games.length / this.cardsPerView);
        for (let i = 0; i < pageCount; i++) {
            const indicator = document.createElement('button');
            indicator.className = `game-carousel__indicator ${i === 0 ? 'game-carousel__indicator--active' : ''}`;
            indicator.setAttribute('aria-label', `Go to page ${i + 1}`);
            indicator.setAttribute('role', 'tab');
            indicator.addEventListener('click', () => this.goToPage(i));
            indicatorsContainer.appendChild(indicator);
        }

        //  navigation events
        prevBtn.addEventListener('click', () => this.navigate('prev'));
        nextBtn.addEventListener('click', () => this.navigate('next'));

        // init position
        this.updateCarouselPosition();

      
        if (typeof gsap !== 'undefined') {
            this.animateCardsIn();
        }

        
        // this.startAutoPlay();
    }

    // ============================================
    // CREATE GAME CARD
    // ============================================

    createGameCard(game, index) {
        const card = document.createElement('article');
        card.className = 'game-card';
        card.setAttribute('data-game-id', game.id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        // Format rating
        const ratingStars = this.generateStarRating(game.rating);
        
        // Format tags
        const topTags = (game.tags || []).slice(0, 3);

        card.innerHTML = `
            <div class="game-card__image-container">
                <img 
                    src="${game.image || this.getPlaceholderImage(game.mood)}" 
                    alt="${this.escapeHtml(game.title)}"
                    class="game-card__image"
                    loading="lazy"
                    onerror="this.src='${this.getPlaceholderImage(game.mood)}'"
                >
                
                ${game.metacritic ? `
                    <div class="game-card__metacritic" aria-label="Metacritic score: ${game.metacritic}">
                        <span class="game-card__metacritic-score">${game.metacritic}</span>
                    </div>
                ` : ''}
                
                <div class="game-card__overlay">
                    <button class="game-card__play-btn" aria-label="Play ${this.escapeHtml(game.title)}">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Play Now</span>
                    </button>
                </div>
            </div>
            
            <div class="game-card__content">
                <div class="game-card__header">
                    <h3 class="game-card__title">${this.escapeHtml(game.title)}</h3>
                    
                    <div class="game-card__rating" aria-label="Rating: ${game.rating} out of 5">
                        ${ratingStars}
                        <span class="game-card__rating-value">${game.rating.toFixed(1)}</span>
                    </div>
                </div>
                
                <div class="game-card__tags">
                    ${topTags.map(tag => `
                        <span class="game-card__tag">${this.escapeHtml(tag)}</span>
                    `).join('')}
                </div>
                
                <p class="game-card__description">${this.escapeHtml(game.shortDescription)}</p>
                
                <div class="game-card__meta">
                    ${game.released ? `
                        <span class="game-card__meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${new Date(game.released).getFullYear()}
                        </span>
                    ` : ''}
                    
                    ${game.playtime ? `
                        <span class="game-card__meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${game.playtime}h avg
                        </span>
                    ` : ''}
                    
                    ${game.esrbRating && game.esrbRating !== 'Not Rated' ? `
                        <span class="game-card__meta-item game-card__meta-item--esrb">
                            ${game.esrbRating}
                        </span>
                    ` : ''}
                </div>
                
                <div class="game-card__actions">
                    <a 
                        href="${game.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="game-card__btn game-card__btn--primary"
                        aria-label="Play ${this.escapeHtml(game.title)}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Play Game
                    </a>
                    
                    <button 
                        class="game-card__btn game-card__btn--secondary"
                        aria-label="More info about ${this.escapeHtml(game.title)}"
                        data-action="info"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>
                    
                    <button 
                        class="game-card__btn game-card__btn--secondary"
                        aria-label="Add to favorites"
                        data-action="favorite"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Attach events
        this.attachCardEvents(card, game);

        return card;
    }

    // ============================================
    // ATTACH CARD EVENTS
    // ============================================

    attachCardEvents(card, game) {
        
        const infoBtn = card.querySelector('[data-action="info"]');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => this.showGameInfo(game));
        }

       
        const favBtn = card.querySelector('[data-action="favorite"]');
        if (favBtn) {
            favBtn.addEventListener('click', () => this.toggleFavorite(game, favBtn));
        }

        // Play overlay
        const playOverlay = card.querySelector('.game-card__play-btn');
        if (playOverlay) {
            playOverlay.addEventListener('click', () => {
                window.open(game.link, '_blank', 'noopener,noreferrer');
            });
        }

        // Hover effects
        card.addEventListener('mouseenter', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
            }
        });

        card.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
            }
        });
    }

    // ============================================
    // CAROUSEL NAVIGATION
    // ============================================

    navigate(direction) {
        const maxIndex = Math.max(0, this.games.length - this.cardsPerView);
        
        if (direction === 'next') {
            this.currentIndex = Math.min(this.currentIndex + this.cardsPerView, maxIndex);
        } else {
            this.currentIndex = Math.max(this.currentIndex - this.cardsPerView, 0);
        }

        this.updateCarouselPosition();
        this.updateIndicators();
    }

    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.cardsPerView;
        this.updateCarouselPosition();
        this.updateIndicators();
    }

    updateCarouselPosition() {
        const track = this.container.querySelector('.game-carousel__track');
        if (!track) return;

        const cardWidth = track.querySelector('.game-card')?.offsetWidth || 0;
        const gap = 24; 
        const offset = -(this.currentIndex * (cardWidth + gap));

        if (typeof gsap !== 'undefined') {
            gsap.to(track, {
                x: offset,
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            track.style.transform = `translateX(${offset}px)`;
        }
    }

    updateIndicators() {
        const indicators = this.container.querySelectorAll('.game-carousel__indicator');
        const currentPage = Math.floor(this.currentIndex / this.cardsPerView);

        indicators.forEach((indicator, index) => {
            if (index === currentPage) {
                indicator.classList.add('game-carousel__indicator--active');
                indicator.setAttribute('aria-selected', 'true');
            } else {
                indicator.classList.remove('game-carousel__indicator--active');
                indicator.setAttribute('aria-selected', 'false');
            }
        });
    }

    // ============================================
    // AUTO-PLAY
    // ============================================

    startAutoPlay(interval = 5000) {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.navigate('next');
            
            // looop back to start if at end
            if (this.currentIndex >= this.games.length - this.cardsPerView) {
                setTimeout(() => {
                    this.currentIndex = 0;
                    this.updateCarouselPosition();
                    this.updateIndicators();
                }, interval);
            }
        }, interval);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // ============================================
    // SHOW GAME INFO 
    // ============================================

    showGameInfo(game) {
        //  modal overlay
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.innerHTML = `
            <div class="game-modal__backdrop"></div>
            <div class="game-modal__content">
                <button class="game-modal__close" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div class="game-modal__header">
                    <img src="${game.image}" alt="${this.escapeHtml(game.title)}" class="game-modal__image">
                    <div class="game-modal__header-content">
                        <h2 class="game-modal__title">${this.escapeHtml(game.title)}</h2>
                        <div class="game-modal__rating">
                            ${this.generateStarRating(game.rating)}
                            <span>${game.rating.toFixed(1)} / 5.0</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-modal__body">
                    <p class="game-modal__description">${this.escapeHtml(game.shortDescription)}</p>
                    
                    <div class="game-modal__details">
                        ${game.genres && game.genres.length > 0 ? `
                            <div class="game-modal__detail">
                                <strong>Genres:</strong>
                                <span>${game.genres.join(', ')}</span>
                            </div>
                        ` : ''}
                        
                        ${game.released ? `
                            <div class="game-modal__detail">
                                <strong>Released:</strong>
                                <span>${new Date(game.released).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        
                        ${game.playtime ? `
                            <div class="game-modal__detail">
                                <strong>Average Playtime:</strong>
                                <span>${game.playtime} hours</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="game-modal__tags">
                        ${(game.tags || []).map(tag => `
                            <span class="game-card__tag">${this.escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="game-modal__footer">
                    <a 
                        href="${game.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="game-card__btn game-card__btn--primary"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Play Game
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        const closeBtn = modal.querySelector('.game-modal__close');
        const backdrop = modal.querySelector('.game-modal__backdrop');
        
        const closeModal = () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(modal, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => modal.remove()
                });
            } else {
                modal.remove();
            }
        };

        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.from(modal, { opacity: 0, duration: 0.3 });
            gsap.from(modal.querySelector('.game-modal__content'), {
                scale: 0.9,
                duration: 0.3,
                ease: 'back.out'
            });
        }
    }

    // ============================================
    // TOGGLE FAVORITE
    // ============================================

    toggleFavorite(game, button) {
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
    // RENDER STATES
    // ============================================

    renderLoadingState() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading game recommendations...</p>
            </div>
        `;
    }

    renderEmptyState() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                    <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
                <h3>No games found</h3>
                <p>Check back later for game recommendations.</p>
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
                <h3>Unable to load games</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="game-card__btn" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }



    animateCardsIn() {
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

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<span class="game-card__star game-card__star--full">★</span>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<span class="game-card__star game-card__star--half">★</span>';
            } else {
                stars += '<span class="game-card__star game-card__star--empty">★</span>';
            }
        }

        return stars;
    }

    getPlaceholderImage(mood) {
        const placeholders = {
            focus: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23D93535%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22%3EFocus Game%3C/text%3E%3C/svg%3E',
            relax: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23B9C9A8%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22%3ERelax Game%3C/text%3E%3C/svg%3E',
            energize: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23E8A419%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22%3EEnergize Game%3C/text%3E%3C/svg%3E',
            creative: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%239C73CC%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22%3ECreative Game%3C/text%3E%3C/svg%3E',
            melancholy: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%236B8AA6%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22%3EMelancholy Game%3C/text%3E%3C/svg%3E'
        };
        return placeholders[mood] || placeholders.focus;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, duration = 3000) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

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