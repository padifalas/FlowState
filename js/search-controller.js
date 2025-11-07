

class SearchController {
    constructor() {
        this.searchInput = null;
        this.searchButton = null;
        this.searchModal = null;
        this.resultsContainer = null;
        this.currentQuery = '';
        this.debounceTimer = null;
        this.debounceDelay = 500; 
        this.isLoading = false;
        this.activeCategory = 'all'; 
        
      
        this.deezerAPI = new DeezerAPI();
        this.tmdbAPI = null; 
        
      
        this.cachedResults = {
            music: [],
            movies: [],
            timestamp: null
        };
        
        this.init();
    }

    // ============================================
    // INITIALIZE
    // ============================================

    init() {
        
        let tmdbKey = '5f8501a4f0d878bdde0a35fad39d8ca3';
        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.tmdb && API_CONFIG.tmdb.apiKey) {
                tmdbKey = API_CONFIG.tmdb.apiKey;
            }
        } catch (e) {
            console.warn('Using fallback TMDB key');
        }
        this.tmdbAPI = new TMDBAPI(tmdbKey);

        this.createSearchUI();
        this.attachEvents();
    }

    // ============================================
    //  SEARCH UI
    // ============================================

    createSearchUI() {
       
        const waitForNav = () => {
            const nav = document.getElementById('main-navigation');
            if (!nav) {
                setTimeout(waitForNav, 50);
                return;
            }

            const navLinks = nav.querySelector('.nav-links');
            if (!navLinks) {
                setTimeout(waitForNav, 50);
                return;
            }

          
            if (navLinks.querySelector('.nav-item--search')) {
                this.searchButton = navLinks.querySelector('.nav-search-btn');
                this.createSearchModal();
                return;
            }

           
            const searchItem = document.createElement('li');
            searchItem.className = 'nav-item nav-item--search';
            searchItem.innerHTML = `
                <button class="nav-search-btn" aria-label="Open search" type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span class="nav-search-btn__text">Search</span>
                </button>
            `;
            navLinks.appendChild(searchItem);

            this.searchButton = searchItem.querySelector('.nav-search-btn');

          
            this.createSearchModal();
        };

        waitForNav();
    }

    createSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'search-modal';
        modal.id = 'search-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'search-modal-title');
        modal.setAttribute('aria-modal', 'true');
        modal.hidden = true;

        modal.innerHTML = `
            <div class="search-modal__overlay" data-close-search></div>
            <div class="search-modal__content">
                <div class="search-modal__header">
                    <h2 id="search-modal-title" class="visually-hidden">Search Content</h2>
                    
                    <div class="search-modal__input-wrapper">
                        <svg class="search-modal__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input 
                            type="search" 
                            id="search-input" 
                            class="search-modal__input" 
                            placeholder="Search music, movies..."
                            aria-label="Search for music and movies"
                            autocomplete="off"
                        >
                        <button 
                            class="search-modal__clear" 
                            aria-label="Clear search"
                            hidden
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <button class="search-modal__close" aria-label="Close search" data-close-search>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <nav class="search-modal__filters" role="tablist" aria-label="Filter search results">
                    <button class="search-modal__filter search-modal__filter--active" data-category="all" role="tab" aria-selected="true">
                        All Results
                    </button>
                    <button class="search-modal__filter" data-category="music" role="tab" aria-selected="false">
                        Music
                    </button>
                    <button class="search-modal__filter" data-category="movies" role="tab" aria-selected="false">
                        Movies
                    </button>
                </nav>

                <div class="search-modal__results" role="region" aria-live="polite" aria-label="Search results">
                    <div class="search-modal__empty">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p>Start typing to search for music and movies</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.searchModal = modal;
        this.searchInput = modal.querySelector('#search-input');
        this.resultsContainer = modal.querySelector('.search-modal__results');
    }

 
    attachEvents() {
        if (!this.searchButton || !this.searchModal) return;

       
        this.searchButton.addEventListener('click', () => this.openModal());

       
        const closeButtons = this.searchModal.querySelectorAll('[data-close-search]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

    
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

       
        const clearBtn = this.searchModal.querySelector('.search-modal__clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSearch());
        }

      
        const filterButtons = this.searchModal.querySelectorAll('.search-modal__filter');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                this.handleCategoryChange(category, btn);
            });
        });

      
        document.addEventListener('keydown', (e) => {
          
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openModal();
            }

           
            if (e.key === 'Escape' && !this.searchModal.hidden) {
                this.closeModal();
            }
        });

       
        this.searchModal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
        });
    }

  
    openModal() {
        this.searchModal.hidden = false;
        document.body.style.overflow = 'hidden';
        
       
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.searchModal.querySelector('.search-modal__content'),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
        }

     
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }

    closeModal() {
      
        document.body.style.overflow = '';
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this.searchModal.querySelector('.search-modal__content'), {
                opacity: 0,
                y: -20,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    this.searchModal.hidden = true;
                }
            });
        } else {
            this.searchModal.hidden = true;
        }
    }


    handleSearchInput(query) {
        const trimmedQuery = query.trim();
        this.currentQuery = trimmedQuery;

      
        const clearBtn = this.searchModal.querySelector('.search-modal__clear');
        if (clearBtn) {
            clearBtn.hidden = trimmedQuery.length === 0;
        }

       
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        
        if (trimmedQuery.length === 0) {
            this.renderEmptyState();
            return;
        }

       
        this.renderLoadingState();

       
        this.debounceTimer = setTimeout(() => {
            this.performSearch(trimmedQuery);
        }, this.debounceDelay);
    }

    async performSearch(query) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        console.log('Searching for:', query);

        try {
           
            const [musicResults, movieResults] = await Promise.all([
                this.searchMusic(query),
                this.searchMovies(query)
            ]);

           
            this.cachedResults = {
                music: musicResults,
                movies: movieResults,
                timestamp: Date.now()
            };

          
            this.renderResults();

        } catch (error) {
            console.error('serchh error:', error);
            this.renderErrorState('failed to search. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    async searchMusic(query) {
        try {
            // Search  tracks n playlists
            const [tracks, playlists] = await Promise.all([
                this.deezerAPI.searchTracks(query, 8),
                this.deezerAPI.searchPlaylists(query, 6)
            ]);

           
            const combined = [...tracks, ...playlists].slice(0, 12);
            return combined;
        } catch (error) {
          
            return [];
        }
    }

    async searchMovies(query) {
        try {
            const movies = await this.tmdbAPI.searchMovies(query, 12);
            return movies || [];
        } catch (error) {
            console.error('Movie search error:', error);
            return [];
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.currentQuery = '';
        this.cachedResults = { music: [], movies: [], timestamp: null };
        this.renderEmptyState();
        
        const clearBtn = this.searchModal.querySelector('.search-modal__clear');
        if (clearBtn) {
            clearBtn.hidden = true;
        }
        
        this.searchInput.focus();
    }

    // ============================================
    // CATEGORY FILTERING
    // ============================================

    handleCategoryChange(category, button) {
        this.activeCategory = category;

       
        const allFilters = this.searchModal.querySelectorAll('.search-modal__filter');
        allFilters.forEach(btn => {
            btn.classList.remove('search-modal__filter--active');
            btn.setAttribute('aria-selected', 'false');
        });

        button.classList.add('search-modal__filter--active');
        button.setAttribute('aria-selected', 'true');

        if (this.currentQuery) {
            this.renderResults();
        }
    }

    // ============================================
    // RENDER METHODS
    // ============================================

    renderEmptyState() {
        this.resultsContainer.innerHTML = `
            <div class="search-modal__empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>Start typing to search for music and movies</p>
                <p class="search-modal__shortcut">Press <kbd>Cmd</kbd> + <kbd>K</kbd> to search anywhere</p>
            </div>
        `;
    }

    renderLoadingState() {
        this.resultsContainer.innerHTML = `
            <div class="search-modal__loading">
                <div class="loading-spinner"></div>
                <p>Searching...</p>
            </div>
        `;
    }

    renderErrorState(message) {
        this.resultsContainer.innerHTML = `
            <div class="search-modal__error">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>${this.escapeHtml(message)}</p>
                <button class="search-modal__retry" onclick="window.searchController.performSearch('${this.escapeHtml(this.currentQuery)}')">
                    Try Again
                </button>
            </div>
        `;
    }

    renderResults() {
        const { music, movies } = this.cachedResults;
        
        // Filter by active category
        let filteredMusic = this.activeCategory === 'all' || this.activeCategory === 'music' ? music : [];
        let filteredMovies = this.activeCategory === 'all' || this.activeCategory === 'movies' ? movies : [];

      
        if (filteredMusic.length === 0 && filteredMovies.length === 0) {
            this.renderNoResultsState();
            return;
        }

        let html = '<div class="search-results">';

        
        if (filteredMusic.length > 0) {
            html += `
                <div class="search-results__section">
                    <h3 class="search-results__heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        Music (${filteredMusic.length})
                    </h3>
                    <div class="search-results__grid">
                        ${filteredMusic.map(item => this.renderMusicCard(item)).join('')}
                    </div>
                </div>
            `;
        }

        
        if (filteredMovies.length > 0) {
            html += `
                <div class="search-results__section">
                    <h3 class="search-results__heading">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                            <polyline points="17 2 12 7 7 2"></polyline>
                        </svg>
                        Movies (${filteredMovies.length})
                    </h3>
                    <div class="search-results__grid">
                        ${filteredMovies.map(movie => this.renderMovieCard(movie)).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        this.resultsContainer.innerHTML = html;

       
        if (typeof gsap !== 'undefined') {
            const cards = this.resultsContainer.querySelectorAll('.search-result-card');
            gsap.fromTo(cards,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }

    renderNoResultsState() {
        this.resultsContainer.innerHTML = `
            <div class="search-modal__empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>No results found for "${this.escapeHtml(this.currentQuery)}"</p>
                <p class="search-modal__suggestion">Try different keywords or check your spelling</p>
            </div>
        `;
    }

    renderMusicCard(item) {
        const type = item.type === 'playlist' ? 'Playlist' : item.type === 'album' ? 'Album' : 'Track';
        const creator = item.creator || item.artist || 'Unknown';
        
        return `
            <article class="search-result-card" data-type="music" data-id="${item.id}">
                <div class="search-result-card__image">
                    <img src="${item.image}" alt="${this.escapeHtml(item.title)}" loading="lazy">
                    <span class="search-result-card__badge">${type}</span>
                </div>
                <div class="search-result-card__content">
                    <h4 class="search-result-card__title">${this.escapeHtml(item.title)}</h4>
                    <p class="search-result-card__meta">${this.escapeHtml(creator)}</p>
                    ${item.trackCount ? `<p class="search-result-card__info">${item.trackCount} tracks</p>` : ''}
                </div>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="search-result-card__link" aria-label="Listen on Deezer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </article>
        `;
    }

    renderMovieCard(movie) {
        return `
            <article class="search-result-card" data-type="movie" data-id="${movie.id}">
                <div class="search-result-card__image">
                    <img src="${movie.image}" alt="${this.escapeHtml(movie.title)}" loading="lazy">
                    ${movie.rating && movie.rating !== 'N/A' ? `
                        <span class="search-result-card__rating">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${movie.rating}
                        </span>
                    ` : ''}
                </div>
                <div class="search-result-card__content">
                    <h4 class="search-result-card__title">${this.escapeHtml(movie.title)}</h4>
                    <p class="search-result-card__meta">${movie.releaseYear}</p>
                    <p class="search-result-card__info">${this.truncate(movie.description, 80)}</p>
                </div>
                <a href="${movie.link}" target="_blank" rel="noopener noreferrer" class="search-result-card__link" aria-label="View on TMDB">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </article>
        `;
    }

    // ============================================
    // KEYBOARD NAVV
    // ============================================

    handleTabKey(e) {
        const focusableElements = this.searchModal.querySelectorAll(
            'input, button:not([disabled]), a[href]'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

 

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return this.escapeHtml(text);
        return this.escapeHtml(text.substring(0, maxLength).trim()) + '...';
    }
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
   
    if (typeof DeezerAPI !== 'undefined' && typeof TMDBAPI !== 'undefined') {
        window.searchController = new SearchController();
        console.log('Search controller INIT');
    } else {
    
    }
});

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchController;
}
