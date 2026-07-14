let categories = [];
let games = [];
let translations = {};
let currentLang = 'en';
let navCache = [];
let searchData = [];

const DARK_THEME = 'dark-theme';
const LIGHT_THEME = 'light-theme';
const THEME_KEY = 'theme';
const MOON_ICON = '🌙';
const SUN_ICON = '☀️';

const EN_LANGUAGE = 'en';
const RU_LANGUAGE = 'ru';
const LANGUAGE_KEY = 'language';

const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const thresholdDate = Date.now() - NEW_THRESHOLD_MS;

const themeBtn = document.getElementById('theme-toggle');
const langBtn = document.getElementById('lang-toggle');

async function initApp() {
    try {
        const [savedTheme, savedLang] = [
            localStorage.getItem(THEME_KEY) || DARK_THEME,
            localStorage.getItem(LANGUAGE_KEY) || EN_LANGUAGE
        ];

        document.body.classList.add(savedTheme);
        currentLang = savedLang;

        const [categoriesJson, gamesJson, translationsJson] = await Promise.all([
            fetch('data/categories.json').then(r => r.json()),
            fetch('data/games.json').then(r => r.json()),
            fetch('data/translations.json').then(r => r.json())
        ]);
        
        categories = categoriesJson;
        games = gamesJson.map(game => ({
            ...game,
            isNew: new Date(game.addedAt).getTime() >= thresholdDate
        }));
        translations = translationsJson;
        
        if (langBtn) {
            langBtn.textContent = currentLang === RU_LANGUAGE ? EN_LANGUAGE : RU_LANGUAGE;
        }

        applyTranslations();
        initGallery();
        initControls();
        initSearch();

    } catch (err) {
        console.error("Internal server error:", err);
    }
}

function createGameCard(game) {
    const cardLink = document.createElement('a');
    cardLink.href = game.gameUrl || `https://store.steampowered.com/app/${game.steamAppId}`;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = 'game-card';

    if (game.isNew) {
        const badge = document.createElement('div');
        badge.className = 'new-badge';
        badge.textContent = translations[currentLang].newLabel;
        cardLink.appendChild(badge);
    }

    const coverWrap = document.createElement('div');
    coverWrap.className = 'game-cover-wrap';
    
    const img = document.createElement('img');
    img.className = 'game-cover';
    img.src = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdbId}.webp`;
    img.alt = game.name;
    img.loading = 'lazy';
    
    coverWrap.appendChild(img);
    cardLink.appendChild(coverWrap);

    // 3. Заголовок
    const info = document.createElement('div');
    info.className = 'game-info';
    
    const title = document.createElement('h3');
    title.className = 'game-title';
    title.textContent = game.name;
    
    info.appendChild(title);
    cardLink.appendChild(info);

    return cardLink;
}

function applyTranslations() {
    const t = translations[currentLang];
    
    const update = (ids, value) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    };

    update(['nav-recommended', 'title-recommended'], t.categories.recommended);
    update(['nav-playing', 'title-playing'], t.categories.playing);
    update(['nav-want-to-play', 'title-want-to-play'], t.categories.wantToPlay);
    update(['nav-not-recommended', 'title-not-recommended'], t.categories.notRecommended);
    update(['no-results-message'], t.noResults);

    document.getElementById('game-search').placeholder = t.searchPlaceholder;
}

function initGallery() {
    categories.forEach(category => {
        const gridContainer = document.getElementById(`grid-${category}`);
        const sectionElement = document.getElementById(`section-${category}`);
        const navLink = document.getElementById(`nav-${category}`);

        const currentGames = games.filter(game => game.category === category);
        
        if (currentGames.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            if (navLink) navLink.style.display = 'none';
            return;
        }
        
        currentGames.sort((a, b) => {
            if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;

            return a.name.localeCompare(b.name);
        });
        
        if (gridContainer) {
            gridContainer.innerHTML = '';
            const fragment = document.createDocumentFragment();
            
            currentGames.forEach(game => {
                fragment.appendChild(createGameCard(game));
            });
            
            gridContainer.appendChild(fragment);
        }
    });

    refreshSearchCache();
    updateNavVisibility();
}

function initControls() {
    const updateThemeIcon = () => {
        const isDark = document.body.classList.contains(DARK_THEME);
        themeBtn.textContent = isDark ? SUN_ICON : MOON_ICON;
    };

    const updateLanguageText = () => {
        langBtn.textContent = (currentLang === RU_LANGUAGE) ? EN_LANGUAGE : RU_LANGUAGE;
    };

    updateThemeIcon();
    updateLanguageText();

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains(DARK_THEME);
        const nextTheme = isDark ? LIGHT_THEME : DARK_THEME;
        
        document.body.classList.replace(isDark ? DARK_THEME : LIGHT_THEME, nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
        
        updateThemeIcon();
    });

    langBtn.addEventListener('click', () => {
        currentLang = (currentLang === RU_LANGUAGE) ? EN_LANGUAGE : RU_LANGUAGE;
        localStorage.setItem(LANGUAGE_KEY, currentLang);
        
        updateLanguageText();
        applyTranslations();
        initGallery();

        const searchInput = document.getElementById('game-search');
        if (searchInput) {
            const term = searchInput.value.toLowerCase();
            performSearch(term); 
        }
    });
}

function initNavCache() {
    navCache = categories.map(category => ({
        section: document.getElementById(`section-${category}`),
        navLink: document.getElementById(`nav-${category}`)
    })).filter(item => item.section && item.navLink);
}

function updateNavVisibility() {
    if (navCache.length === 0) initNavCache();

    navCache.forEach(({ section, navLink }) => {
        const hasVisible = Array.from(section.querySelectorAll('.game-card'))
            .some(card => card.style.display !== 'none');
            
        navLink.style.display = hasVisible ? 'inline-block' : 'none';
    });
}

function refreshSearchCache() {
    searchData = Array.from(document.querySelectorAll('.game-card')).map(card => ({
        element: card,
        name: card.querySelector('.game-title').textContent.toLowerCase()
    }));
}

function initSearch() {
    const searchInput = document.getElementById('game-search');
    
    const urlParams = new URLSearchParams(window.location.search);
    const initialTerm = urlParams.get('search');
    
    if (initialTerm) {
        searchInput.value = initialTerm;

        setTimeout(() => performSearch(initialTerm), 100); 
    }

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const term = e.target.value.toLowerCase();
            performSearch(term);
            updateSearchQueryParam(term);
        }, 100);
    });
}

function performSearch(term) {
    let hasAnyVisible = false;

    searchData.forEach(({ element, name }) => {
        const isMatch = name.includes(term);
        element.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) hasAnyVisible = true;
    });

    categories.forEach(category => {
        const section = document.getElementById(`section-${category}`);
        if (!section) return;

        const hasVisibleInSection = Array.from(section.querySelectorAll('.game-card'))
            .some(card => card.style.display !== 'none');
        
        section.style.display = hasVisibleInSection ? 'flex' : 'none';
    });

    const noResultsEl = document.getElementById('no-results-message');
    if (noResultsEl) {
        noResultsEl.style.display = hasAnyVisible ? 'none' : 'block';
    }

    updateNavVisibility();
}

function updateSearchQueryParam(term) {
    const url = new URL(window.location);

    if (term) {
        url.searchParams.set('search', term);
    } else {
        url.searchParams.delete('search');
    }

    window.history.replaceState(null, '', url);
}

document.addEventListener('DOMContentLoaded', initApp);