(function(){
  const KEYS = {
    movies: 'flowstate_movie_watchlist',
    music: 'flowstate_music_favorites',
    games: 'flowstate_game_favorites'
  };

  const state = {
    typeFilter: 'all',
    moodFilter: 'all',
    items: { movies: [], music: [], games: [] }
  };

  document.addEventListener('DOMContentLoaded', () => {
    loadAll();
    updateStats();
    render();
    attachFilterEvents();
    attachEmptyCloseHandler();

   
    if (window.WatchlistAnimations && typeof window.WatchlistAnimations.init === 'function') {
      window.WatchlistAnimations.init();
    }
  });

  function safeGet(key){
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch(e){ return []; }
  }

  function safeSet(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){}
  }

  function loadAll(){
    state.items.movies = safeGet(KEYS.movies);
    state.items.music = safeGet(KEYS.music);
    state.items.games = safeGet(KEYS.games);
  }

  function updateStats(){
    const set = (name, count) => {
      const el = document.querySelector(`[data-stat="${name}"] strong`);
      if (el) el.textContent = String(count);
    };
    set('movies', state.items.movies.length);
    set('music', state.items.music.length);
    set('games', state.items.games.length);
  }

  function attachFilterEvents(){
 
    document.querySelectorAll('.wl-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wl-filter').forEach(b => {
          b.classList.toggle('wl-filter--active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        state.typeFilter = btn.dataset.filter;
        render();
      });
    });

    // mood filters
    document.querySelectorAll('.wl-mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.wl-mood-chip').forEach(c => {
          c.classList.toggle('wl-mood-chip--active', c === chip);
          c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
        });
        state.moodFilter = chip.dataset.mood;
        render();
      });
    });
  }

  function attachEmptyCloseHandler(){
    const emptyState = document.getElementById('watchlist-empty');
    const closeBtn = emptyState?.querySelector('.wl-empty__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (window.WatchlistAnimations && typeof window.WatchlistAnimations.animateCardRemove === 'function') {
          window.WatchlistAnimations.animateCardRemove(emptyState, () => {
            emptyState.hidden = true;
          });
        } else {
          emptyState.hidden = true;
        }
      });
    }
  }

  function getFilteredItems(){
    let base;
    switch(state.typeFilter){
      case 'movies': base = state.items.movies.map(m => ({...m, __type:'movie'})); break;
      case 'music': base = state.items.music.map(m => ({...m, __type:'music'})); break;
      case 'games': base = state.items.games.map(g => ({...g, __type:'game'})); break;
      default:
        base = [
          ...state.items.movies.map(m => ({...m, __type:'movie'})),
          ...state.items.music.map(m => ({...m, __type:'music'})),
          ...state.items.games.map(g => ({...g, __type:'game'}))
        ];
    }

    if (state.moodFilter === 'all') return base;
    return base.filter(item => (item.mood || 'unknown') === state.moodFilter);
  }

  function render(){
    const grid = document.getElementById('watchlist-grid');
    const empty = document.getElementById('watchlist-empty');
    if (!grid || !empty) return;

    const items = getFilteredItems();
    grid.innerHTML = '';

    if (!items.length){
      empty.hidden = false;
      if (window.WatchlistAnimations && typeof window.WatchlistAnimations.animateEmpty === 'function') {
        window.WatchlistAnimations.animateEmpty(empty);
      }
      return;
    }

    empty.hidden = true;

    items.forEach(item => {
      const card = createCard(item);
      grid.appendChild(card);
    });

    if (window.WatchlistAnimations && typeof window.WatchlistAnimations.animateGridIn === 'function') {
      window.WatchlistAnimations.animateGridIn(grid);
    }
  }

  function createCard(item){
    const card = document.createElement('article');
    card.className = 'wl-card';

  const image = item.imageLarge || item.image || 'https://dribbble.com/shots/4631055-No-Preview-Image';
    const title = escapeHtml(item.title || item.name || 'Untitled');
    const link = item.link || '#';
    const type = item.__type;
    const mood = (item.mood || 'unknown').toLowerCase();

    card.innerHTML = `
      <div class="wl-card__image-wrap is-${type}">
        <img src="${image}" alt="${title}" class="wl-card__image is-${type}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x338/0c0e13/9aa0a6?text=No+Image';">
        <span class="wl-card__badge">${type.toUpperCase()}</span>
        ${mood !== 'unknown' ? `<span class="wl-card__mood-badge mood-badge mood-badge--${mood}" title="${mood} mood">${mood}</span>` : ''}
      </div>
      <div class="wl-card__body">
        <h3 class="wl-card__title">${title}</h3>
        <div class="wl-card__meta">${buildMeta(item)}</div>
        ${item.description || item.overview ? `<p class="wl-card__desc">${escapeHtml(item.description || item.overview)}</p>` : ''}
      </div>
      <div class="wl-card__actions">
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="wl-link wl-link--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Open
        </a>
        <button class="wl-btn wl-btn--danger" data-action="remove">Remove</button>
      </div>
    `;

    // Hover animation
    if (window.WatchlistAnimations && typeof window.WatchlistAnimations.attachCardHover === 'function') {
      window.WatchlistAnimations.attachCardHover(card);
    }

    const removeBtn = card.querySelector('[data-action="remove"]');
    removeBtn.addEventListener('click', () => removeItem(item, card));

    return card;
  }

  function buildMeta(item){
    if (item.__type === 'movie'){
      const year = item.releaseYear ? String(item.releaseYear) : '';
      const rating = item.rating ? `${item.rating}/10` : '';
      return [year, rating].filter(Boolean).join(' • ');
    }
    if (item.__type === 'music'){
      const who = item.artist || item.creator || '';
      const tracks = item.trackCount ? `${item.trackCount} tracks` : '';
      return [who, tracks].filter(Boolean).join(' • ');
    }
    if (item.__type === 'game'){
      const score = item.metacritic ? `Metacritic ${item.metacritic}` : '';
      const rt = item.rating ? `${Number(item.rating).toFixed(1)}/5` : '';
      return [score, rt].filter(Boolean).join(' • ');
    }
    return '';
  }

  function removeItem(item, card){
    const key = item.__type === 'movie' ? KEYS.movies : item.__type === 'music' ? KEYS.music : KEYS.games;
    const list = safeGet(key).filter(x => String(x.id) !== String(item.id));
    safeSet(key, list);

    
    loadAll();
    updateStats();

    if (window.WatchlistAnimations && typeof window.WatchlistAnimations.animateCardRemove === 'function') {
      window.WatchlistAnimations.animateCardRemove(card, () => render());
    } else {
      card.remove();
      render();
    }
  }

  function escapeHtml(text){
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
