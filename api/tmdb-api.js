// ============================================
// TMDB API SERVICE
// ============================================

class TMDBAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p';
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    }

    // ============================================
    // CORE API REQUEST METHOD
    // ============================================

    async fetchFromTMDB(endpoint, params = {}) {
        // Add API key to params
        const allParams = {
            api_key: this.apiKey,
            ...params
        };

        const queryString = new URLSearchParams(allParams).toString();
        const url = `${this.baseURL}${endpoint}?${queryString}`;
        
        // Check cache first
        const cacheKey = url;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Returning cached TMDB data for:', endpoint);
                return cached.data;
            }
        }

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('TMDB API Error:', error);
            throw new Error(`Failed to fetch from TMDB: ${error.message}`);
        }
    }

    // ============================================
    // DISCOVER MOVIES BY GENRE
    // ============================================

    async discoverMovies(genreIds, sortBy = 'popularity.desc', limit = 20) {
        try {
            const data = await this.fetchFromTMDB('/discover/movie', {
                with_genres: genreIds.join(','),
                sort_by: sortBy,
                'vote_count.gte': 100, // Only movies with at least 100 votes
                include_adult: false,
                language: 'en-US',
                page: 1
            });
            
            if (!data || !data.results) {
                return [];
            }
            
            return data.results.slice(0, limit).map(movie => this.formatMovie(movie));
        } catch (error) {
            console.error('Error discovering movies:', error);
            return [];
        }
    }

    // ============================================
    // SEARCH MOVIES BY QUERY
    // ============================================

    async searchMovies(query, limit = 20) {
        try {
            const data = await this.fetchFromTMDB('/search/movie', {
                query: query,
                include_adult: false,
                language: 'en-US',
                page: 1
            });
            
            if (!data || !data.results) {
                return [];
            }
            
            return data.results.slice(0, limit).map(movie => this.formatMovie(movie));
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    // ============================================
    // GET TRENDING MOVIES
    // ============================================

    async getTrendingMovies(timeWindow = 'week', limit = 20) {
        try {
            const data = await this.fetchFromTMDB(`/trending/movie/${timeWindow}`, {
                language: 'en-US'
            });
            
            if (!data || !data.results) {
                return [];
            }
            
            return data.results.slice(0, limit).map(movie => this.formatMovie(movie));
        } catch (error) {
            console.error('Error fetching trending movies:', error);
            return [];
        }
    }

    // ============================================
    // GET MOVIE DETAILS
    // ============================================

    async getMovieDetails(movieId) {
        try {
            const data = await this.fetchFromTMDB(`/movie/${movieId}`, {
                append_to_response: 'credits,videos,similar'
            });
            
            return this.formatMovieDetails(data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    // ============================================
    // GET MOOD-BASED MOVIES
    // ============================================

    async getMoodMovies(mood, limit = 12) {
        // Get movie criteria for this mood from MOOD_MOVIE_QUERIES
        if (!MOOD_MOVIE_QUERIES[mood]) {
            console.error('Invalid mood:', mood);
            return [];
        }

        const moodCriteria = MOOD_MOVIE_QUERIES[mood];
        
        try {
            // Get movies by genre
            const genreMovies = await this.discoverMovies(
                moodCriteria.genres, 
                moodCriteria.sortBy, 
                limit
            );
            
            // If we have keyword searches, also search by keywords
            if (moodCriteria.keywords && moodCriteria.keywords.length > 0) {
                const keyword = moodCriteria.keywords[0];
                const keywordMovies = await this.searchMovies(keyword, Math.ceil(limit / 2));
                
                // Combine and remove duplicates
                const combined = [...genreMovies, ...keywordMovies];
                const unique = this.removeDuplicates(combined);
                
                // Shuffle and limit
                const shuffled = this.shuffle(unique);
                return shuffled.slice(0, limit);
            }
            
            // Shuffle for variety
            return this.shuffle(genreMovies).slice(0, limit);
        } catch (error) {
            console.error('Error fetching mood movies:', error);
            return [];
        }
    }

    // ============================================
    // FORMAT MOVIE
    // ============================================

    formatMovie(movie) {
        return {
            id: movie.id,
            type: 'movie',
            title: movie.title || movie.original_title || 'Untitled',
            originalTitle: movie.original_title,
            overview: movie.overview || 'No description available.',
            releaseDate: movie.release_date || 'TBA',
            releaseYear: movie.release_date ? movie.release_date.split('-')[0] : 'TBA',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            voteCount: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            image: this.getPosterURL(movie.poster_path, 'w342'),
            imageLarge: this.getPosterURL(movie.poster_path, 'w500'),
            backdrop: this.getBackdropURL(movie.backdrop_path, 'w780'),
            backdropLarge: this.getBackdropURL(movie.backdrop_path, 'w1280'),
            genreIds: movie.genre_ids || [],
            language: movie.original_language || 'en',
            adult: movie.adult || false,
            description: this.truncateText(movie.overview, 150),
            link: `https://www.themoviedb.org/movie/${movie.id}`
        };
    }

    // ============================================
    // FORMAT MOVIE DETAILS
    // ============================================

    formatMovieDetails(movie) {
        return {
            ...this.formatMovie(movie),
            runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
            genres: movie.genres ? movie.genres.map(g => g.name) : [],
            budget: movie.budget || 0,
            revenue: movie.revenue || 0,
            status: movie.status || 'Unknown',
            tagline: movie.tagline || '',
            homepage: movie.homepage || '',
            imdbId: movie.imdb_id || '',
            director: this.getDirector(movie.credits),
            cast: this.getCast(movie.credits, 5),
            trailer: this.getTrailer(movie.videos)
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getPosterURL(posterPath, size = 'w342') {
        if (!posterPath) {
            return this.getPlaceholderImage('poster');
        }
        return `${this.imageBaseURL}/${size}${posterPath}`;
    }

    getBackdropURL(backdropPath, size = 'w780') {
        if (!backdropPath) {
            return this.getPlaceholderImage('backdrop');
        }
        return `${this.imageBaseURL}/${size}${backdropPath}`;
    }

    getPlaceholderImage(type = 'poster') {
        const width = type === 'poster' ? 342 : 780;
        const height = type === 'poster' ? 513 : 439;
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23282D35' width='${width}' height='${height}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23898A85' font-family='sans-serif' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E`;
    }

    getDirector(credits) {
        if (!credits || !credits.crew) return 'Unknown';
        const director = credits.crew.find(person => person.job === 'Director');
        return director ? director.name : 'Unknown';
    }

    getCast(credits, limit = 5) {
        if (!credits || !credits.cast) return [];
        return credits.cast.slice(0, limit).map(actor => ({
            name: actor.name,
            character: actor.character,
            profilePath: actor.profile_path
        }));
    }

    getTrailer(videos) {
        if (!videos || !videos.results) return null;
        
        // Find YouTube trailer
        const trailer = videos.results.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube'
        );
        
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    removeDuplicates(movies) {
        const seen = new Set();
        return movies.filter(movie => {
            if (seen.has(movie.id)) {
                return false;
            }
            seen.add(movie.id);
            return true;
        });
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ============================================
    // CLEAR CACHE
    // ============================================

    clearCache() {
        this.cache.clear();
        console.log('TMDB API cache cleared');
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TMDBAPI;
}