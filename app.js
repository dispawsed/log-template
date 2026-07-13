let categories = [];
let games = [];
let translations = {};
let currentLang = 'en';
let navCache = [];

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
        const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;

        console.debug('savedTheme: ' + savedTheme);

        document.body.classList.add(savedTheme);

        const savedLang = localStorage.getItem(LANGUAGE_KEY) || EN_LANGUAGE;
        currentLang = savedLang;

        const [categoriesJson, gamesJson, translationsJson] = await Promise.all([
            fetch('data/categories.json').then(r => r.json()),
            fetch('data/games.json').then(r => r.json()),
            fetch('data/translations.json').then(r => r.json())
        ]);
        
        categories = categoriesJson;
        games = gamesJson;
        translations = translationsJson;
        
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.textContent = currentLang === RU_LANGUAGE ? EN_LANGUAGE : RU_LANGUAGE;
        }

        initGallery();
        initControls();
        initSearch();
        applyTranslations();
    } catch (err) {
        console.error("Internal server error:", err);
    }
}

function createGameCard(game) {
    const isGameNew = isNew(game.addedAt);
    const label = translations[currentLang].newLabel;
    
    const gameUrl = game.gameUrl || `https://store.steampowered.com/app/${game.steamAppId}`;
    
    const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdbId}.webp`;

    const cardLink = document.createElement('a');
    cardLink.href = gameUrl;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = 'game-card';
    
    cardLink.innerHTML = `
        ${isGameNew ? `<div class="new-badge">${label}</div>` : ''}
        <div class="game-cover-wrap">
            <img class="game-cover" src="${coverUrl}" alt="${game.name}" loading="lazy">
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.name}</h3>
        </div>
    `;
    return cardLink;
}

function applyTranslations() {
    const t = translations[currentLang];
    
    document.getElementById('nav-recommended').textContent = t.categories.recommended;
    document.getElementById('nav-playing').textContent = t.categories.playing;
    document.getElementById('nav-want-to-play').textContent = t.categories.wantToPlay;
    document.getElementById('nav-not-recommended').textContent = t.categories.notRecommended;

    document.getElementById('title-recommended').textContent = t.categories.recommended;
    document.getElementById('title-playing').textContent = t.categories.playing;
    document.getElementById('title-want-to-play').textContent = t.categories.wantToPlay;
    document.getElementById('title-not-recommended').textContent = t.categories.notRecommended;

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
            const aIsNew = isNew(a.addedAt);

            if (aIsNew !== isNew(b.addedAt)) return aIsNew ? -1 : 1;
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

function initSearch() {
    const searchInput = document.getElementById('game-search');
    
    const searchData = Array.from(document.querySelectorAll('.game-card')).map(card => ({
        element: card,
        name: card.querySelector('.game-title').textContent.toLowerCase()
    }));

    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const term = e.target.value.toLowerCase();
            
            searchData.forEach(({ element, name }) => {
                element.style.display = name.includes(term) ? 'flex' : 'none';
            });

            categories.forEach(category => {
                const section = document.getElementById(`section-${category}`);
                if (!section) return;

                const hasVisible = Array.from(section.querySelectorAll('.game-card'))
                    .some(card => card.style.display !== 'none');
                
                section.style.display = hasVisible ? 'flex' : 'none';
            });

            updateNavVisibility();
        }, 100);
    });
}

function isNew(addedAt) {
    return new Date(addedAt).getTime() >= thresholdDate;
}

document.addEventListener('DOMContentLoaded', initApp);