// ============================================
// API CONFIGURATION
// ============================================

const API_CONFIG = {
    deezer: {
        baseURL: 'https://api.deezer.com',
        endpoints: {
            searchPlaylist: '/search/playlist',
            searchAlbum: '/search/album',
            searchTrack: '/search/track'
        }
    },
    tmdb: {
        baseURL: 'https://api.themoviedb.org/3',

        // ensure that file is gitignored. jussst in case api secrest script doent run to
        apiKey: (typeof window !== 'undefined' && window.API_SECRETS && window.API_SECRETS.tmdb && window.API_SECRETS.tmdb.apiKey) ? window.API_SECRETS.tmdb.apiKey : '5f8501a4f0d878bdde0a35fad39d8ca3',
        endpoints: {
            discover: '/discover/movie',
            search: '/search/movie'
        }
    }
};

// ============================================
// MOOD-BASED SEARCH QUERIES
// ============================================

const MOOD_QUERIES = {
    focus: {
        playlists: [
            'instrumental focus',
            'deep concentration',
            'study music',
            'ambient focus',
            'binaural beats',
            'lo-fi instrumental',
            'classical focus',
            'white noise'
        ],
        albums: [
            'ambient',
            'classical instrumental',
            'electronic instrumental',
            'jazz instrumental',
            'piano solo'
        ],
        genres: ['classical', 'ambient', 'instrumental', 'electronic'],
        description: 'Instrumental and ambient tracks to enhance concentration'
    },
    relax: {
        playlists: [
            'chill vibes',
            'relaxing music',
            'meditation',
            'calm piano',
            'nature sounds',
            'spa music',
            'peaceful',
            'yoga music'
        ],
        albums: [
            'chill out',
            'relaxation',
            'new age',
            'acoustic chill',
            'lounge'
        ],
        genres: ['chill', 'acoustic', 'new age', 'lounge'],
        description: 'Calming music and nature sounds to reduce stress'
    },
    energize: {
        playlists: [
            'workout motivation',
            'energy boost',
            'upbeat pop',
            'running music',
            'gym hits',
            'power workout',
            'dance party',
            'high energy'
        ],
        albums: [
            'edm',
            'pop hits',
            'rock anthems',
            'hip hop',
            'dance'
        ],
        genres: ['pop', 'edm', 'rock', 'hip-hop', 'dance'],
        description: 'Upbeat music to boost motivation and energy'
    },
    creative: {
        playlists: [
            'creative flow',
            'experimental music',
            'indie discovery',
            'world music',
            'art inspiration',
            'alternative',
            'eclectic mix',
            'jazz fusion'
        ],
        albums: [
            'indie',
            'alternative',
            'world',
            'experimental',
            'jazz fusion'
        ],
        genres: ['indie', 'alternative', 'world', 'jazz', 'experimental'],
        description: 'Experimental and artistic compositions'
    },
    melancholy: {
        playlists: [
            'sad songs',
            'melancholic',
            'emotional ballads',
            'indie folk',
            'rainy day',
            'contemplative',
            'acoustic sad',
            'heartbreak'
        ],
        albums: [
            'sad indie',
            'melancholic folk',
            'emotional',
            'acoustic ballads',
            'singer songwriter'
        ],
        genres: ['indie', 'folk', 'acoustic', 'singer-songwriter'],
        description: 'Contemplative and introspective music'
    }
};



const TMDB_GENRES = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    scienceFiction: 878,
    tvMovie: 10770,
    thriller: 53,
    war: 10752,
    western: 37
};

// ============================================
// MOOD-BASED MOVIE QUERIES
// ============================================

const MOOD_MOVIE_QUERIES = {
    focus: {
        genres: [99, 36], // docc, History
        keywords: ['educational', 'documentary', 'biography', 'science', 'nature'],
        sortBy: 'vote_average.desc',
        description: 'Educational documentaries and inspiring true stories',
        contentRating: 'PG-13',
        minRuntime: 45,
        maxRuntime: 90 
    },
    relax: {
        genres: [16, 10751, 35], // animation, Family, Comedy
        keywords: ['feel good', 'heartwarming', 'calm', 'peaceful', 'nature'],
        sortBy: 'vote_average.desc',
        description: 'Light-hearted and calming films',
        contentRating: 'G',
        minRuntime: 60,
        maxRuntime: 120
    },
    energize: {
        genres: [28, 12, 878], // Action, Adventure, Sci-Fi
        keywords: ['motivational', 'inspiring', 'adventure', 'hero', 'triumph'],
        sortBy: 'popularity.desc',
        description: 'High-energy action and motivational stories',
        contentRating: 'PG-13',
        minRuntime: 90,
        maxRuntime: 150
    },
    creative: {
        genres: [18, 10402, 14], // Drama, Music, Fantasy
        keywords: ['artistic', 'creative', 'music', 'art', 'imagination', 'visionary'],
        sortBy: 'vote_average.desc',
        description: 'Artistic and thought-provoking films',
        contentRating: 'PG-13',
        minRuntime: 80,
        maxRuntime: 140
    },
    melancholy: {
        genres: [18, 10749, 9648], // Drama, Romance, Mystery
        keywords: ['emotional', 'melancholic', 'introspective', 'thoughtful', 'bittersweet'],
        sortBy: 'vote_average.desc',
        description: 'Contemplative and emotional narratives',
        contentRating: 'PG-13',
        minRuntime: 90,
        maxRuntime: 150
    }
};

// ============================================
// EXPORT CONFIGURATION
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, MOOD_QUERIES, TMDB_GENRES, MOOD_MOVIE_QUERIES };
}