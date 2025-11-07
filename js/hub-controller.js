// ============================================
// HUB PAGE CONTROLLER
// ============================================

class HubController {
    constructor() {
        this.currentHub = this.detectHub();
        this.currentFilter = 'all';
        
        // init services
        this.deezerAPI = new DeezerAPI();
        this.musicRenderer = new MusicRenderer();
        
        // init TMDB API
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
        
        // RAWG API for games
        let rawgKey = '35ff0bb7928b4adeaa14c5fced1a69ad';
        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.rawg && API_CONFIG.rawg.apiKey) {
                rawgKey = API_CONFIG.rawg.apiKey;
            }
        } catch (e) {
            console.warn('RAWG API key not found');
        }
        this.rawgAPI = new RAWGAPI(rawgKey);
        this.gameRenderer = new GameRenderer();
        
        // cahce for loaded content
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
        
        // etting up UI elements
        this.setupContainers();
        this.setupFilterButtons();
        
        //  initial content
        await this.loadContent();
        
      
        this.attachEvents();
        
        console.log('hubb initialized successfully');
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
        
        // Movies section
        this.moviesContainer = document.querySelector('.content-grid--movies');
        if (this.moviesContainer) {
            this.movieRenderer.setContainer(this.moviesContainer);
        }

        // Games section
        this.gamesContainer = document.querySelector('.content-grid--games');
        if (this.gamesContainer) {
            this.gameRenderer.setContainer(this.gamesContainer);
        }
    }

    // ============================================
    //  FILTER BUTTONS
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
    //  FILTER CHANGE
    // ============================================

    handleFilterChange(filter, clickedButton) {
        //  active stateupdate
        document.querySelectorAll('.filter-nav__btn').forEach(btn => {
            btn.classList.remove('filter-nav__btn--active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        clickedButton.classList.add('filter-nav__btn--active');
        clickedButton.setAttribute('aria-pressed', 'true');
        
        // storeing current filter
        this.currentFilter = filter;
        
      
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
           
            await Promise.all([
                this.loadMusicContent(),
                this.loadMoviesContent(),
                this.loadGamesContent()
            ]);
            
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
        
       
        this.musicRenderer.renderLoadingState();
        
        try {
           
            const [playlists, albums] = await Promise.all([
                this.deezerAPI.getMoodContent(this.currentHub, 'playlists', 8),
                this.deezerAPI.getMoodContent(this.currentHub, 'albums', 4)
            ]);
            
          
            const allMusic = [...playlists, ...albums];
            const shuffled = this.shuffleArray(allMusic);
            
            
            this.contentCache.music = shuffled;
            
            
            this.musicRenderer.render(shuffled);
            
            console.log(`Loaded ${shuffled.length} music items`);
            
        } catch (error) {
            console.error('errorrrrrrrrrr loading music:', error);
            this.musicRenderer.renderErrorState('Failed to load music. Please try again later.');
        }
    }

    // ============================================
    // LOAD MOVIES CONTENT
    // ============================================

    async loadMoviesContent() {
        if (!this.moviesContainer) return;

        //  loading UI
        this.movieRenderer.renderLoadingState();

        try {
            // If the is have cached movies for this hub, use them
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

            // cache by hub
            if (!this.contentCache.movies) this.contentCache.movies = {};
            this.contentCache.movies[this.currentHub] = movies;

          
            this.movieRenderer.render(movies);
            
            console.log(`looaded ${movies.length} movies for ${this.currentHub}`);
        } catch (error) {
            console.error('errr loading movies:', error);
            this.movieRenderer.renderErrorState('Failed to load movies. Please try again later.');
        }
    }

    // ============================================
    // LOAD GAMES CONTENT
    // ============================================

    async loadGamesContent() {
        if (!this.gamesContainer) return;
        
        console.log(`showinn games for ${this.currentHub} hub...`);
        
     
        this.gameRenderer.renderLoadingState();
        
        try {
           
            if (this.contentCache.games && this.contentCache.games[this.currentHub]) {
                const cached = this.contentCache.games[this.currentHub];
                this.gameRenderer.render(cached);
                console.log(`Loaded ${cached.length} games from cache`);
                return;
            }

            
            const games = await this.rawgAPI.getMoodGames(this.currentHub, 12);

            if (!games || games.length === 0) {
                this.gameRenderer.renderEmptyState();
                return;
            }

            //  by hub
            if (!this.contentCache.games) this.contentCache.games = {};
            this.contentCache.games[this.currentHub] = games;

            this.gameRenderer.render(games);
            
            console.log(`showed n loaded ${games.length} games for ${this.currentHub}`);
            
        } catch (error) {
            console.error('error loading games:', error);
            this.gameRenderer.renderErrorState('Failed to load games. Please try again later.');
        }
    }

    // ============================================
    // HANDLE LOAD ERROR
    // ============================================

    handleLoadError(error) {
        console.error('Content loading error:', error);
        
        //  error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-banner';
        errorMessage.innerHTML = `
            <p>Some content couldn't be loaded. Please refresh the page to try again.</p>
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
        // Refresh button 
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.clearAllCaches();
                this.loadContent();
            });
        }
        
        // for browser back/forward
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

    clearAllCaches() {
        this.deezerAPI.clearCache();
        this.rawgAPI.clearCache();
        this.contentCache = {
            music: null,
            movies: null,
            games: null
        };
    }

    // ============================================
    // PUBLIC API
    // ============================================

    // Refresh all content
    async refresh() {
        this.clearAllCaches();
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