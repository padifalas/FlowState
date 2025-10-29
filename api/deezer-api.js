// ============================================
// DEEZER API SERVICE
// ============================================

class DeezerAPI {
    constructor() {
        this.baseURL = 'https://api.deezer.com';
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    }

    // ============================================
    // CORE API REQUEST METHOD
    // ============================================

    async fetchFromDeezer(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}${endpoint}?${queryString}&output=jsonp`;
        
        // will check cache first
        const cacheKey = url;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Returning cached data for:', endpoint);
                return cached.data;
            }
        }

        try {
            // usess JSONP to bypass CORS
            const data = await this.jsonp(url);
            
            // cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Deezer API Error:', error);
            throw new Error(`Failed to fetch from deezer argh: ${error.message}`);
        }
    }

    // ============================================
    // JSONP HELPER (CORS BYPASS)
    // ============================================

    jsonp(url) {
        return new Promise((resolve, reject) => {
            const callbackName = 'deezer_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const script = document.createElement('script');
            
            //   callback function
            window[callbackName] = (data) => {
                delete window[callbackName];
                document.body.removeChild(script);
                resolve(data);
            };
            
            //  error handling
            script.onerror = () => {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request failed'));
            };
            
            // Set the script source with callback
            script.src = `${url}&callback=${callbackName}`;
            document.body.appendChild(script);
            
            // timeoutt after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('Request timeout'));
                }
            }, 10000);
        });
    }

    // ============================================
    // SEARCH PLAYLISTS
    // ============================================

    async searchPlaylists(query, limit = 12) {
        try {
            const data = await this.fetchFromDeezer('/search/playlist', {
                q: query,
                limit: limit
            });
            
            if (!data || !data.data) {
                return [];
            }
            
            return data.data.map(playlist => this.formatPlaylist(playlist));
        } catch (error) {
            console.error('Error searching playlists:', error);
            return [];
        }
    }

    // ============================================
    // SEARCH ALBUMS
    // ============================================

    async searchAlbums(query, limit = 12) {
        try {
            const data = await this.fetchFromDeezer('/search/album', {
                q: query,
                limit: limit
            });
            
            if (!data || !data.data) {
                return [];
            }
            
            return data.data.map(album => this.formatAlbum(album));
        } catch (error) {
            console.error('Error searching albums:', error);
            return [];
        }
    }

    // ============================================
    // SEARCH TRACKS
    // ============================================

    async searchTracks(query, limit = 12) {
        try {
            const data = await this.fetchFromDeezer('/search/track', {
                q: query,
                limit: limit
            });
            
            if (!data || !data.data) {
                return [];
            }
            
            return data.data.map(track => this.formatTrack(track));
        } catch (error) {
            console.error('Error searching tracks:', error);
            return [];
        }
    }

    // ============================================
    // GET MOOD-BASED CONTENT
    // ============================================

    async getMoodContent(mood, contentType = 'playlists', limit = 12) {
       
        if (!MOOD_QUERIES[mood]) {
            console.error('Invalid mood:', mood);
            return [];
        }

        const queries = MOOD_QUERIES[mood][contentType] || [];
        
        if (queries.length === 0) {
            console.warn(`No queries found for mood: ${mood}, type: ${contentType}`);
            return [];
        }

        try {
            // Use the first few queries to get diverse results
            const searchQueries = queries.slice(0, 3);
            const resultsPerQuery = Math.ceil(limit / searchQueries.length);
            
            const allResults = await Promise.all(
                searchQueries.map(query => {
                    if (contentType === 'playlists') {
                        return this.searchPlaylists(query, resultsPerQuery);
                    } else if (contentType === 'albums') {
                        return this.searchAlbums(query, resultsPerQuery);
                    } else {
                        return this.searchTracks(query, resultsPerQuery);
                    }
                })
            );
            
            // Flatten and remove duplicates
            const flatResults = allResults.flat();
            const uniqueResults = this.removeDuplicates(flatResults);
            
            // Shuffle for variety
            const shuffled = this.shuffle(uniqueResults);
            
            return shuffled.slice(0, limit);
        } catch (error) {
            console.error('Error fetching mood content:', error);
            return [];
        }
    }

    // ============================================
    // FORMAT METHODS
    // ============================================

    formatPlaylist(playlist) {
        return {
            id: playlist.id,
            type: 'playlist',
            title: playlist.title || 'Untitled Playlist',
            creator: playlist.user?.name || 'Unknown',
            image: playlist.picture_medium || playlist.picture_big || playlist.picture || '',
            imageLarge: playlist.picture_big || playlist.picture_xl || playlist.picture_medium || '',
            trackCount: playlist.nb_tracks || 0,
            link: playlist.link || '#',
            fans: playlist.fans || 0,
            duration: this.formatDuration(playlist.duration),
            description: `${playlist.nb_tracks || 0} tracks`
        };
    }

    formatAlbum(album) {
        return {
            id: album.id,
            type: 'album',
            title: album.title || 'Untitled Album',
            artist: album.artist?.name || 'Unknown Artist',
            image: album.cover_medium || album.cover_big || album.cover || '',
            imageLarge: album.cover_big || album.cover_xl || album.cover_medium || '',
            trackCount: album.nb_tracks || 0,
            link: album.link || '#',
            releaseDate: album.release_date || '',
            fans: album.fans || 0,
            duration: this.formatDuration(album.duration),
            description: `${album.artist?.name || 'Unknown Artist'} • ${album.nb_tracks || 0} tracks`
        };
    }

    formatTrack(track) {
        return {
            id: track.id,
            type: 'track',
            title: track.title || 'Untitled Track',
            artist: track.artist?.name || 'Unknown Artist',
            album: track.album?.title || '',
            image: track.album?.cover_medium || track.album?.cover_big || '',
            imageLarge: track.album?.cover_big || track.album?.cover_xl || '',
            duration: this.formatDuration(track.duration),
            link: track.link || '#',
            preview: track.preview || '',
            description: `${track.artist?.name || 'Unknown'} • ${track.album?.title || 'Single'}`
        };
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    removeDuplicates(items) {
        const seen = new Set();
        return items.filter(item => {
            const key = `${item.type}-${item.id}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
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
        console.log('Deezer API cache cleared');
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeezerAPI;
}