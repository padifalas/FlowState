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
        apiKey: 'YOUR_TMDB_API_KEY', // Replace with your actual API key
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

// ============================================
// EXPORT CONFIGURATION
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, MOOD_QUERIES };
}