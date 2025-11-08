// ============================================
// PUZZLE GAMES API (Wordle & Sudoku)
// ============================================

class PuzzleAPI {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 60 * 60 * 1000; 
    }

    // ============================================
    //  MOOD-BASED PUZZLE GAMES
    // ============================================

    async getPuzzleGames(mood, limit = 6) {
        const cacheKey = `puzzles_${mood}_${limit}`;
        
    
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('Returning cached puzzle games for', mood);
            return cached;
        }

        try {
            //  puzzle games based on mood
            const allPuzzles = this.getAllPuzzleGames();
            const moodPuzzles = this.filterByMood(allPuzzles, mood);
            
          
            const puzzles = moodPuzzles.slice(0, limit);
            
            
            this.setCache(cacheKey, puzzles);
            
            return puzzles;

        } catch (error) {
            console.error('Error fetching puzzle games:', error);
            return this.getFallbackPuzzles(mood);
        }
    }

    // ============================================
    // ALL PUZZLE GAMES DATABASE
    // ============================================

    getAllPuzzleGames() {
        return [
            // WORDLE 
            {
                id: 'wordle-original',
                title: 'Wordle',
                image: 'https://fossbytes.com/wp-content/uploads/2025/08/wordle-image.jpg',
                rating: 4.8,
                ratingCount: 50000,
                metacritic: 90,
                released: '2021-10-01',
                genres: ['Puzzle', 'Word Game'],
                tags: ['Daily Challenge', 'Word Puzzle', 'Logic', 'Minimalist', 'Brain Training'],
                platforms: ['Web'],
                playtime: 0.1,
                esrbRating: 'E',
                shortDescription: 'Guess the 5-letter word in 6 tries. A new puzzle is available each day.',
                link: 'https://www.nytimes.com/games/wordle/index.html',
                slug: 'wordle',
                moods: ['focus', 'relax', 'creative'],
                difficulty: 'Medium',
                dailyChallenge: true,
                screenshots: []
            },

         

            // SUDOKU 

            {
                id: 'web-sudoku',
                title: 'Web Sudoku',
                image: 'https://cdn-1.webcatalog.io/catalog/web-sudoku/web-sudoku-icon-unplated.png?v=1722606575382',
                rating: 4.5,
                ratingCount: 50000,
                metacritic: null,
                released: '2006-01-01',
                genres: ['Puzzle', 'Logic'],
                tags: ['Logic', 'Numbers', 'Classic', 'Brain Training', 'Strategy'],
                platforms: ['Web'],
                playtime: 0.5,
                esrbRating: 'E',
                shortDescription: 'Billions of free Sudoku puzzles to play online with different difficulty levels.',
                link: 'https://www.websudoku.com/',
                slug: 'web-sudoku',
                moods: ['focus', 'relax'],
                difficulty: 'Variable',
                dailyChallenge: false,
                screenshots: []
            },
            {
                id: 'sudoku-evil',
                title: 'Evil Sudoku',
                image: 'https://www.sudoku.name/pictures/head2.png',
                rating: 4.6,
                ratingCount: 8000,
                metacritic: null,
                released: '2008-01-01',
                genres: ['Puzzle', 'Logic'],
                tags: ['Logic', 'Challenging', 'Expert', 'Brain Training', 'Strategy'],
                platforms: ['Web'],
                playtime: 1,
                esrbRating: 'E',
                shortDescription: 'Extremely difficult Sudoku puzzles for expert players.',
                link: 'https://www.sudoku.name/rules/en',
                slug: 'sudoku-evil',
                moods: ['focus', 'energize'],
                difficulty: 'Expert',
                dailyChallenge: true,
                screenshots: []
            },


            //  WORD/LOGIC PUZZLES
            {
                id: 'connections',
                title: 'NYT Connections',
                image: 'https://imageio.forbes.com/specials-images/imageserve/683b1d1f4ef48396311bfdb8/NYT-Connections-og-image/0x0.jpg?format=jpg&crop=791,371,x0,y38,safe&width=960',
                rating: 4.6,
                ratingCount: 25000,
                metacritic: null,
                released: '2023-06-12',
                genres: ['Puzzle', 'Word Game'],
                tags: ['Word Puzzle', 'Categories', 'Daily Challenge', 'Logic', 'Brain Training'],
                platforms: ['Web'],
                playtime: 0.2,
                esrbRating: 'E',
                shortDescription: 'Group words into categories. Find the common thread in each group.',
                link: 'https://www.nytimes.com/games/connections',
                slug: 'connections',
                moods: ['focus', 'creative', 'relax'],
                difficulty: 'Medium',
                dailyChallenge: true,
                screenshots: []
            },

            {
                id: 'spelling-bee',
                title: 'NYT Spelling Bee',
                image: 'https://www.digitaltrends.com/wp-content/uploads/2024/05/nyt-spelling-bee.jpg',
                rating: 4.8,
                ratingCount: 40000,
                metacritic: 88,
                released: '2018-05-09',
                genres: ['Puzzle', 'Word Game'],
                tags: ['Word Puzzle', 'Vocabulary', 'Daily Challenge', 'Creative', 'Brain Training'],
                platforms: ['Web'],
                playtime: 0.5,
                esrbRating: 'E',
                shortDescription: 'Create words using 7 letters. How many words can you make?',
                link: 'https://www.nytimes.com/puzzles/spelling-bee',
                slug: 'spelling-bee',
                moods: ['focus', 'creative', 'relax'],
                difficulty: 'Medium',
                dailyChallenge: true,
                screenshots: []
            },


        ];
    }

   

    filterByMood(puzzles, mood) {
        return puzzles
            .filter(puzzle => puzzle.moods.includes(mood))
            .sort((a, b) => b.rating - a.rating); 
    }


    async getPuzzleDetails(puzzleId) {
        const allPuzzles = this.getAllPuzzleGames();
        return allPuzzles.find(puzzle => puzzle.id === puzzleId) || null;
    }

    // ============================================
    // FALLBACK  JUS IN CASE API FAILS
    // ============================================

    getFallbackPuzzles(mood) {
        const fallbacks = {
            focus: [
                {
                    id: 'wordle-fallback',
                    title: 'Wordle',
                    image: 'https://fossbytes.com/wp-content/uploads/2025/08/wordle-image.jpg',
                    rating: 4.8,
                    genres: ['Puzzle', 'Word Game'],
                    tags: ['Daily Challenge', 'Word Puzzle', 'Logic'],
                    shortDescription: 'Guess the 5-letter word in 6 tries.',
                    link: 'https://www.nytimes.com/games/wordle/index.html',
                    mood: mood
                },
                {
                    id: 'sudoku-fallback',
                    title: 'Sudoku',
                    image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&h=600&fit=crop',
                    rating: 4.7,
                    genres: ['Puzzle', 'Logic'],
                    tags: ['Logic', 'Numbers', 'Brain Training'],
                    shortDescription: 'Fill the grid with numbers 1-9 following Sudoku rules.',
                    link: 'https://sudoku.com/',
                    mood: mood
                }
            ]
        };

        return fallbacks[mood] || fallbacks.focus;
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
        console.log('Puzzle game cache cleared');
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
    module.exports = PuzzleAPI;
}
