// ============================================
// RAWG GAMES API WRAPPER
// ============================================

class RAWGAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = API_CONFIG.rawg.baseURL;
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    // ============================================
    // GET MOOD-BASED GAMES
    // ============================================

    async getMoodGames(mood, limit = 12) {
        const cacheKey = `games_${mood}_${limit}`;
        
        // Check cache
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('Returning cached games for', mood);
            return cached;
        }

        try {
            const config = MOOD_GAME_QUERIES[mood];
            if (!config) {
                throw new Error(`No game configuration found for mood: ${mood}`);
            }

            //  query parameters
            const params = new URLSearchParams({
                key: this.apiKey,
                page_size: limit,
                ordering: config.sortBy,
                tags: config.tags.join(','),
                genres: config.genres.join(','),

                // filterr for browser-playable games
                platforms: '171', // Web/HTML5 platform ID
                metacritic: '60,100' // only well-rated games
            });

            // Add exclude tags if they therwe
            if (config.excludeTags && config.excludeTags.length > 0) {
                params.append('exclude_tags', config.excludeTags.join(','));
            }

            const url = `${this.baseURL}/games?${params.toString()}`;
            console.log('Fetching games from:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`RAWG API error: ${response.status}`);
            }

            const data = await response.json();
            
           
            const games = this.transformGames(data.results || [], mood);
            
            // cache  results
            this.setCache(cacheKey, games);
            
            return games;

        } catch (error) {
            console.error('error fetching games:api dont workk', error);
            
            // use fallback games if API dont work
            return this.getFallbackGames(mood);
        }
    }

    // ============================================
    // TRANSFORM GAMES DATA
    // ============================================

    transformGames(rawGames, mood) {
        return rawGames.map(game => ({
            id: game.id,
            title: game.name,
            image: game.background_image || '',
            rating: game.rating || 0,
            ratingCount: game.ratings_count || 0,
            metacritic: game.metacritic || null,
            released: game.released || '',
            genres: (game.genres || []).map(g => g.name),
            tags: (game.tags || []).slice(0, 5).map(t => t.name),
            platforms: (game.platforms || []).map(p => p.platform.name),
            playtime: game.playtime || 0,
            esrbRating: game.esrb_rating ? game.esrb_rating.name : 'Not Rated',
            shortDescription: game.description_raw ? 
                this.truncateText(game.description_raw, 120) : 
                `A ${(game.genres || []).map(g => g.name).join(', ')} game`,
            link: `https://rawg.io/games/${game.slug}`,
            slug: game.slug,
            mood: mood,

            // more metadata
            screenshots: (game.short_screenshots || []).slice(0, 4).map(s => s.image),
            added: game.added || 0,
            suggestionsCount: game.suggestions_count || 0
        }));
    }

    // ============================================
    // GET GAME DETAILS (for modal/expanded view)
    // ============================================

    async getGameDetails(gameId) {
        const cacheKey = `game_details_${gameId}`;
        
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseURL}/games/${gameId}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch game details: ${response.status}`);
            }

            const data = await response.json();
            
            const details = {
                id: data.id,
                title: data.name,
                description: data.description_raw || '',
                image: data.background_image,
                rating: data.rating,
                metacritic: data.metacritic,
                released: data.released,
                genres: (data.genres || []).map(g => g.name),
                tags: (data.tags || []).map(t => t.name),
                developers: (data.developers || []).map(d => d.name),
                publishers: (data.publishers || []).map(p => p.name),
                website: data.website || '',
                reddit: data.reddit_url || '',
                playtime: data.playtime,
                screenshots: (data.screenshots || []).map(s => s.image),
                esrbRating: data.esrb_rating ? data.esrb_rating.name : 'Not Rated'
            };

            this.setCache(cacheKey, details);
            return details;

        } catch (error) {
            console.error('Error fetching game details:', error);
            return null;
        }
    }

    // ============================================
    // FALLBACK GAMES hope i never have to use thisss!!
    // ============================================

    getFallbackGames(mood) {
        const fallbacks = {
            focus: [
                {
                    id: 'fallback-1',
                    title: '2048',
                    image: 'https://play-lh.googleusercontent.com/EYlqDYgeVBZZCn30xg7KOZhf5pNc2jROxMh5lrFVjCRx6pIuB7T0uFt3RpPdFT7iXPg',
                    rating: 4.2,
                    genres: ['Puzzle'],
                    tags: ['Logic', 'Minimalist', 'Addictive'],
                    shortDescription: 'Combine numbered tiles to reach 2048',
                    link: 'https://play2048.co/',
                    mood: mood
                }
            ],
            relax: [
                {
                    id: 'fallback-2',
                    title: 'Little Alchemy 2',
                    image: 'https://littlealchemy2.com/static/img/largeicon.jpg',
                    rating: 4.5,
                    genres: ['Casual', 'Puzzle'],
                    tags: ['Relaxing', 'Creative', 'Discovery'],
                    shortDescription: 'Combine elements to discover new items',
                    link: 'https://littlealchemy2.com/',
                    mood: mood
                }
            ],
            energize: [
                {
                    id: 'fallback-3',
                    title: 'Slope',
                    image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/d471ea2d-3a7c-4fc5-b95f-e7b2bd1ab5d1.png',
                    rating: 4.3,
                    genres: ['Action', 'Arcade'],
                    tags: ['Fast-Paced', 'Challenging', 'Reflexes'],
                    shortDescription: 'Navigate a ball down an endless slope',
                    link: 'https://www.crazygames.com/game/slope',
                    mood: mood
                }
            ],
            creative: [
                {
                    id: 'fallback-4',
                    title: 'Townscaper',
                    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1291340/header.jpg',
                    rating: 4.7,
                    genres: ['Casual', 'Simulation'],
                    tags: ['Building', 'Relaxing', 'Creative'],
                    shortDescription: 'Build peaceful island towns with simple clicks',
                    link: 'https://store.steampowered.com/app/1291340/Townscaper/',
                    mood: mood
                }
            ],
            melancholy: [
                {
                    id: 'fallback-5',
                    title: 'A Short Hike',
                    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/header.jpg',
                    rating: 4.8,
                    genres: ['Adventure', 'Indie'],
                    tags: ['Exploration', 'Relaxing', 'Atmospheric'],
                    shortDescription: 'Explore a peaceful mountain park',
                    link: 'https://store.steampowered.com/app/1055540/A_Short_Hike/',
                    mood: mood
                }
            ]
        };

        return fallbacks[mood] || [];
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheExpiry;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        console.log('Game cache cleared');
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAWGAPI;
}