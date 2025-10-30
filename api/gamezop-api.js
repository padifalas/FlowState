// ============================================
// GAMEZOP API SERVICE
// ============================================

class GamezopAPI {
    constructor() {
        this.baseURL = 'https://www.gamezop.com/api/v1';
        // You'll get these from Gamezop dashboard
        this.gameId = 'YOUR_GAME_ID'; // Get from Gamezop
        this.partnerId = 'YOUR_PARTNER_ID'; // Get from Gamezop
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
        
        // Fallback games list (if API fails or for development)
        this.fallbackGames = this.getFallbackGames();
    }

    // ============================================
    // FETCH GAMES
    // ============================================

    async fetchGames() {
        const cacheKey = 'gamezop_all_games';
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Returning cached games');
                return cached.data;
            }
        }

        try {
            // Note: Gamezop API structure - adjust based on actual API
            const response = await fetch(`${this.baseURL}/games`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Gamezop API request failed');
            }

            const data = await response.json();
            const formattedGames = this.formatGames(data.games || []);
            
            // Cache results
            this.cache.set(cacheKey, {
                data: formattedGames,
                timestamp: Date.now()
            });
            
            return formattedGames;
        } catch (error) {
            console.warn('Using fallback games due to API error:', error);
            return this.fallbackGames;
        }
    }

    // ============================================
    // FORMAT GAMES
    // ============================================

    formatGames(games) {
        return games.map(game => ({
            id: game.id || game.code,
            title: game.name || game.title,
            description: game.description || 'Play this exciting game',
            thumbnail: game.assets?.cover || game.thumbnail,
            cover: game.assets?.coverLandscape || game.cover,
            url: this.getGameURL(game.id || game.code),
            categories: game.categories || [],
            tags: this.extractTags(game),
            rating: game.rating || 4.0,
            plays: game.gamePlays || 0,
            difficulty: this.calculateDifficulty(game),
            duration: this.estimateDuration(game),
            type: game.gameType || 'arcade',
            isFavorite: false
        }));
    }

    // ============================================
    // GET MOOD-BASED GAMES
    // ============================================

    async getMoodGames(mood, limit = 12) {
        const allGames = await this.fetchGames();
        
        if (!MOOD_GAME_QUERIES || !MOOD_GAME_QUERIES[mood]) {
            console.error('Invalid mood:', mood);
            return allGames.slice(0, limit);
        }

        const moodCriteria = MOOD_GAME_QUERIES[mood];
        
        // Filter games based on mood criteria
        let filtered = allGames.filter(game => {
            const matchesTags = moodCriteria.tags.some(tag => 
                game.tags.some(gameTag => 
                    gameTag.toLowerCase().includes(tag.toLowerCase())
                )
            );
            
            const matchesCategories = moodCriteria.categories.some(cat =>
                game.categories.some(gameCat =>
                    gameCat.toLowerCase().includes(cat.toLowerCase())
                )
            );
            
            const matchesDifficulty = !moodCriteria.difficulty || 
                game.difficulty === moodCriteria.difficulty;
            
            return matchesTags || matchesCategories || matchesDifficulty;
        });

        // If no matches, return random games
        if (filtered.length === 0) {
            console.warn(`No games found for ${mood}, returning random games`);
            filtered = this.shuffle(allGames);
        }

        // Shuffle and limit
        const shuffled = this.shuffle(filtered);
        return shuffled.slice(0, limit);
    }

    // ============================================
    // GET GAME URL
    // ============================================

    getGameURL(gameId) {
        // Gamezop game URL format
        return `https://www.gamezop.com/games/${gameId}?partner=${this.partnerId}`;
    }

    // ============================================
    // EXTRACT TAGS
    // ============================================

    extractTags(game) {
        const tags = [];
        
        // From categories
        if (game.categories) {
            tags.push(...game.categories);
        }
        
        // From game type
        if (game.gameType) {
            tags.push(game.gameType);
        }
        
        // From description keywords
        if (game.description) {
            const keywords = ['puzzle', 'action', 'strategy', 'casual', 'arcade', 'adventure'];
            keywords.forEach(keyword => {
                if (game.description.toLowerCase().includes(keyword)) {
                    tags.push(keyword);
                }
            });
        }
        
        return [...new Set(tags)]; // Remove duplicates
    }

    // ============================================
    // CALCULATE DIFFICULTY
    // ============================================

    calculateDifficulty(game) {
        // Simple heuristic based on game type and categories
        const categories = (game.categories || []).map(c => c.toLowerCase());
        
        if (categories.includes('puzzle') || categories.includes('strategy')) {
            return 'medium';
        }
        if (categories.includes('casual')) {
            return 'easy';
        }
        if (categories.includes('action') || categories.includes('arcade')) {
            return 'hard';
        }
        
        return 'easy';
    }

    // ============================================
    // ESTIMATE DURATION
    // ============================================

    estimateDuration(game) {
        const categories = (game.categories || []).map(c => c.toLowerCase());
        
        if (categories.includes('puzzle')) return '5-15 min';
        if (categories.includes('strategy')) return '10-20 min';
        if (categories.includes('arcade')) return '2-5 min';
        if (categories.includes('casual')) return '3-10 min';
        
        return '5-10 min';
    }

    // ============================================
    // FALLBACK GAMES
    // ============================================

    getFallbackGames() {
        return [
            {
                id: 'bubble-shooter',
                title: 'Bubble Shooter',
                description: 'Pop bubbles and clear the board in this classic puzzle game',
                thumbnail: 'https://via.placeholder.com/300x200/4A3B5C/FFFFFF?text=Bubble+Shooter',
                cover: 'https://via.placeholder.com/600x400/4A3B5C/FFFFFF?text=Bubble+Shooter',
                url: '#',
                categories: ['puzzle', 'casual'],
                tags: ['puzzle', 'relaxing', 'casual'],
                rating: 4.5,
                plays: 15000,
                difficulty: 'easy',
                duration: '5-10 min',
                type: 'puzzle',
                isFavorite: false
            },
            {
                id: 'tetris-classic',
                title: 'Block Puzzle',
                description: 'Arrange falling blocks in this timeless puzzle game',
                thumbnail: 'https://via.placeholder.com/300x200/D93535/FFFFFF?text=Block+Puzzle',
                cover: 'https://via.placeholder.com/600x400/D93535/FFFFFF?text=Block+Puzzle',
                url: '#',
                categories: ['puzzle', 'strategy'],
                tags: ['puzzle', 'focus', 'strategy'],
                rating: 4.8,
                plays: 25000,
                difficulty: 'medium',
                duration: '10-15 min',
                type: 'puzzle',
                isFavorite: false
            },
            {
                id: 'memory-match',
                title: 'Memory Match',
                description: 'Test your memory by matching pairs of cards',
                thumbnail: 'https://via.placeholder.com/300x200/E59389/FFFFFF?text=Memory+Match',
                cover: 'https://via.placeholder.com/600x400/E59389/FFFFFF?text=Memory+Match',
                url: '#',
                categories: ['puzzle', 'memory'],
                tags: ['memory', 'focus', 'casual'],
                rating: 4.3,
                plays: 12000,
                difficulty: 'easy',
                duration: '3-8 min',
                type: 'puzzle',
                isFavorite: false
            },
            {
                id: 'space-invaders',
                title: 'Space Shooter',
                description: 'Defend Earth from alien invaders in this classic arcade game',
                thumbnail: 'https://via.placeholder.com/300x200/E6B17A/FFFFFF?text=Space+Shooter',
                cover: 'https://via.placeholder.com/600x400/E6B17A/FFFFFF?text=Space+Shooter',
                url: '#',
                categories: ['action', 'arcade'],
                tags: ['action', 'energize', 'arcade'],
                rating: 4.6,
                plays: 30000,
                difficulty: 'medium',
                duration: '5-10 min',
                type: 'action',
                isFavorite: false
            },
            {
                id: 'zen-garden',
                title: 'Zen Garden',
                description: 'Create your peaceful zen garden in this relaxing game',
                thumbnail: 'https://via.placeholder.com/300x200/2D4A3E/FFFFFF?text=Zen+Garden',
                cover: 'https://via.placeholder.com/600x400/2D4A3E/FFFFFF?text=Zen+Garden',
                url: '#',
                categories: ['casual', 'creative'],
                tags: ['relaxing', 'creative', 'zen'],
                rating: 4.7,
                plays: 8000,
                difficulty: 'easy',
                duration: '10-20 min',
                type: 'casual',
                isFavorite: false
            },
            {
                id: 'word-search',
                title: 'Word Quest',
                description: 'Find hidden words in this engaging word puzzle',
                thumbnail: 'https://via.placeholder.com/300x200/898A85/FFFFFF?text=Word+Quest',
                cover: 'https://via.placeholder.com/600x400/898A85/FFFFFF?text=Word+Quest',
                url: '#',
                categories: ['puzzle', 'word'],
                tags: ['puzzle', 'focus', 'word'],
                rating: 4.4,
                plays: 18000,
                difficulty: 'medium',
                duration: '8-15 min',
                type: 'puzzle',
                isFavorite: false
            },
            {
                id: 'rhythm-master',
                title: 'Rhythm Master',
                description: 'Hit the beats and create music in this rhythm game',
                thumbnail: 'https://via.placeholder.com/300x200/4A3B5C/FFFFFF?text=Rhythm+Master',
                cover: 'https://via.placeholder.com/600x400/4A3B5C/FFFFFF?text=Rhythm+Master',
                url: '#',
                categories: ['music', 'rhythm'],
                tags: ['creative', 'music', 'energize'],
                rating: 4.9,
                plays: 35000,
                difficulty: 'medium',
                duration: '3-5 min',
                type: 'rhythm',
                isFavorite: false
            },
            {
                id: 'color-flow',
                title: 'Color Flow',
                description: 'Connect matching colors in this relaxing puzzle game',
                thumbnail: 'https://via.placeholder.com/300x200/7B8FA3/FFFFFF?text=Color+Flow',
                cover: 'https://via.placeholder.com/600x400/7B8FA3/FFFFFF?text=Color+Flow',
                url: '#',
                categories: ['puzzle', 'casual'],
                tags: ['puzzle', 'relaxing', 'creative'],
                rating: 4.5,
                plays: 22000,
                difficulty: 'easy',
                duration: '5-12 min',
                type: 'puzzle',
                isFavorite: false
            }
        ];
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    clearCache() {
        this.cache.clear();
        console.log('Gamezop API cache cleared');
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamezopAPI;
}