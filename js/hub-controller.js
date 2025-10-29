// ============================================
// HUB PAGE CONTROLLER
// ============================================

class HubController {
    constructor() {
        this.currentHub = this.detectHub();
        this.currentFilter = 'all';
        
        // Initialize services
        this.deezerAPI = new DeezerAPI();
        this.musicRenderer = new MusicRenderer();
        
        // Initialize TMDB API with configured API key (read from api/api-config.js when included)
        // Falls back to the placeholder if API_CONFIG isn't available so the page won't crash immediately.
        let tmdbKey = '5f8501a4f0d878bdde0a35fad39d8ca3';
        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.tmdb && API_CONFIG.tmdb.apiKey) {
                tmdbKey = API_CONFIG.tmdb.apiKey;
            }
        } catch (e) {
            // ignore - we'll use the placeholder key
        }
        this.tmdbAPI = new TMDBAPI(tmdbKey);
        this.movieRenderer = new MovieRenderer();
        
        // Cache for loaded content
        this.contentCache = {
            music: null,
            movies: null,
            games: null
        };
        
        this.init();
    }

    // ============================================
    // DETECT CURRENT HUB
    // ============================================

    detectHub() {
        const body = document.body;
        const hubAttribute = body.getAttribute('data-hub');
        
        if (hubAttribute) {
            return hubAttribute;
        }

        // Fallback: detect from URL
        const path = window.location.pathname;
        if (path.includes('focus')) return 'focus';
        if (path.includes('relax')) return 'relax';
        if (path.includes('energize')) return 'energize';
        if (path.includes('creative')) return 'creative';
        if (path.includes('melancholy')) return 'melancholy';
        
        return 'focus'; // Default
    }

    // ============================================
    // INITIALIZE
    // ============================================

    async init() {
        console.log(`Initializing ${this.currentHub} hub...`);
        
        // Setup UI elements
        this.setupContainers();
        this.setupFilterButtons();
        
        // Load initial content
        await this.loadContent();
        
        // Setup event listeners
        this.attachEvents();
        
        console.log('Hub initialized successfully');
    }

    // ============================================
    // SETUP CONTAINERS
    // ============================================

    setupContainers() {
        // Music section
        const musicGrid = document.querySelector('.content-grid--music');
        if (musicGrid) {
            this.musicRenderer.setContainer(musicGrid);
        }
        
        // Store references to other sections
        this.moviesContainer = document.querySelector('.content-grid--movies');
        this.gamesContainer = document.querySelector('.content-grid--games');

        // Wire movie renderer container if present
        if (this.moviesContainer) {
            this.movieRenderer.setContainer(this.moviesContainer);
        }
    }

    // ============================================
    // SETUP FILTER BUTTONS
    // ============================================

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-nav__btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.handleFilterChange(filter, button);
            });
        });
    }

    // ============================================
    // HANDLE FILTER CHANGE
    // ============================================

    handleFilterChange(filter, clickedButton) {
        // Update active state
        document.querySelectorAll('.filter-nav__btn').forEach(btn => {
            btn.classList.remove('filter-nav__btn--active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        clickedButton.classList.add('filter-nav__btn--active');
        clickedButton.setAttribute('aria-pressed', 'true');
        
        // Store current filter
        this.currentFilter = filter;
        
        // Show/hide sections
        this.toggleSections(filter);
        
        // Animate transition
        this.animateFilterChange();
    }

    // ============================================
    // TOGGLE SECTIONS
    // ============================================

    toggleSections(filter) {
        const sections = document.querySelectorAll('.content-section');
        
        sections.forEach(section => {
            const category = section.getAttribute('data-category');
            
            if (filter === 'all') {
                section.style.display = 'block';
            } else {
                section.style.display = (category === filter) ? 'block' : 'none';
            }
        });
    }

    // ============================================
    // LOAD CONTENT
    // ============================================

    async loadContent() {
        try {
            // Load music content
            await this.loadMusicContent();
            
            // Load other content (movies, games) - placeholder for now
           this.loadMoviesContent();
            // this.loadGamesContent();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.handleLoadError(error);
        }
    }

    // ============================================
    // LOAD MUSIC CONTENT
    // ============================================

    async loadMusicContent() {
        console.log(`Loading music for ${this.currentHub} hub...`);
        
        // Show loading state
        this.musicRenderer.renderLoadingState();
        
        try {
            // Get playlists and albums for this mood
            const [playlists, albums] = await Promise.all([
                this.deezerAPI.getMoodContent(this.currentHub, 'playlists', 8),
                this.deezerAPI.getMoodContent(this.currentHub, 'albums', 4)
            ]);
            
            // Combine and shuffle
            const allMusic = [...playlists, ...albums];
            const shuffled = this.shuffleArray(allMusic);
            
            // Cache the results
            this.contentCache.music = shuffled;
            
            // Render music cards
            this.musicRenderer.render(shuffled);
            
            console.log(`Loaded ${shuffled.length} music items`);
            
        } catch (error) {
            console.error('Error loading music:', error);
            this.musicRenderer.renderErrorState('Failed to load music. Please try again later.');
        }
    }

    // ============================================
    // LOAD MOVIES CONTENT (Placeholder)
    // ============================================

    async loadMoviesContent() {
        if (!this.moviesContainer) return;

        // show loading UI
        this.movieRenderer.renderLoadingState();

        try {
            // If we have cached movies for this hub, use them
            if (this.contentCache.movies && this.contentCache.movies[this.currentHub]) {
                const cached = this.contentCache.movies[this.currentHub];
                this.movieRenderer.render(cached);
                return;
            }

            // Fetch mood-based movies (limit 12)
            const movies = await this.tmdbAPI.getMoodMovies(this.currentHub, 12);

            if (!movies || movies.length === 0) {
                this.movieRenderer.renderEmptyState();
                return;
            }

            // Cache by hub
            if (!this.contentCache.movies) this.contentCache.movies = {};
            this.contentCache.movies[this.currentHub] = movies;

            // Render
            this.movieRenderer.render(movies);
        } catch (error) {
            console.error('Error loading movies:', error);
            this.movieRenderer.renderErrorState('Failed to load movies. Please try again later.');
        }
    }

    // ============================================
    // LOAD GAMES CONTENT (Placeholder)
    // ============================================

    async loadGamesContent() {
        if (!this.gamesContainer) return;
        
        this.gamesContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Game recommendations coming soon...</p>
            </div>
        `;
        
        // TODO: Implement Itch.io API integration
    }

    // ============================================
    // HANDLE LOAD ERROR
    // ============================================

    handleLoadError(error) {
        console.error('Content loading error:', error);
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-banner';
        errorMessage.innerHTML = `
            <p>⚠️ Some content couldn't be loaded. Please refresh the page to try again.</p>
            <button onclick="location.reload()">Refresh</button>
        `;
        
        const main = document.getElementById('main-content');
        if (main) {
            main.insertBefore(errorMessage, main.firstChild);
        }
    }

    // ============================================
    // ANIMATE FILTER CHANGE
    // ============================================

    animateFilterChange() {
        if (typeof gsap === 'undefined') return;
        
        const visibleSections = document.querySelectorAll('.content-section[style*="display: block"]');
        
        gsap.fromTo(visibleSections,
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'power2.out'
            }
        );
    }

    // ============================================
    // ATTACH EVENTS
    // ============================================

    attachEvents() {
        // Refresh button (if exists)
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.deezerAPI.clearCache();
                this.loadContent();
            });
        }
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.init();
        });
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    // Refresh all content
    async refresh() {
        this.deezerAPI.clearCache();
        await this.loadContent();
    }

    // Get current hub name
    getHubName() {
        return this.currentHub;
    }

    // Get current filter
    getCurrentFilter() {
        return this.currentFilter;
    }
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on hub pages
    if (document.body.classList.contains('hub-page')) {
        window.hubController = new HubController();
    }
});

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HubController;
}