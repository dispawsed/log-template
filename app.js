let categories = [];
let games = [];
let translations = {};
let currentLang = 'en';

async function initApp() {
    try {
        const [categoriesJson, gamesJson, translationsJson] = await Promise.all([
            fetch('data/categories.json').then(r => r.json()),
            fetch('data/games.json').then(r => r.json()),
            fetch('data/translations.json').then(r => r.json())
        ]);
        
        categories = categoriesJson;
        games = gamesJson;
        translations = translationsJson;
        
        initGallery();
        initControls();
        initSearch();
        applyTranslations();
    } catch (err) {
        console.error("Ошибка загрузки данных:", err);
    }
}

function createGameCard(game) {
    const isGameNew = isNew(game.addedAt);
    const label = translations[currentLang].newLabel;
    
    // Ссылка: приоритет у gameUrl, если нет — Steam
    const gameUrl = game.gameUrl || `https://store.steampowered.com/app/${game.steamAppId}`;
    
    // Картинка: всегда через IGDB
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

// Применяет текстовые переводы без перезаписи самих сеток с играми
function applyTranslations() {
    const t = translations[currentLang];
    
    document.title = t.title;
    document.getElementById('main-title').textContent = t.title;

    // Тексты навигации
    document.getElementById('nav-recommended').textContent = t.categories.recommended;
    document.getElementById('nav-playing').textContent = t.categories.playing;
    document.getElementById('nav-want-to-play').textContent = t.categories.wantToPlay;
    document.getElementById('nav-not-recommended').textContent = t.categories.notRecommended;

    // Заголовки секций
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
        
        // Сортировка: новые -> алфавит
        currentGames.sort((a, b) => {
            if (isNew(a.addedAt) !== isNew(b.addedAt)) return isNew(a.addedAt) ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        
        gridContainer.innerHTML = '';
        currentGames.forEach(game => gridContainer.appendChild(createGameCard(game)));
    });

    updateNavVisibility();
}

function initControls() {
    // Логика смены темы
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            themeBtn.textContent = '☀️';
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            themeBtn.textContent = '🌙';
        }
    });

    // Логика смены языка
    const langBtn = document.getElementById('lang-toggle');
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';

        applyTranslations();
        initGallery();
    });
}

function updateNavVisibility() {
    categories.forEach(category => {
        const section = document.getElementById(`section-${category}`);
        const navLink = document.getElementById(`nav-${category}`);

        if (!section || !navLink) return;
        
        const visibleCards = Array.from(section.querySelectorAll('.game-card'))
            .filter(card => card.style.display !== 'none');
            
        navLink.style.display = visibleCards.length > 0 ? 'inline-block' : 'none';
    });
}

function initSearch() {
    const searchInput = document.getElementById('game-search');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        document.querySelectorAll('.game-card').forEach(card => {
            const name = card.querySelector('.game-title').textContent.toLowerCase();
            card.style.display = name.includes(term) ? 'flex' : 'none';
        });

        categories.forEach(category => {
            const section = document.getElementById(`section-${category}`);
            const visibleCards = Array.from(section.querySelectorAll('.game-card'))
                .filter(c => c.style.display !== 'none');
            if (section) section.style.display = visibleCards.length > 0 ? 'flex' : 'none';
        });

        updateNavVisibility();
    });
}

function isNew(addedAt) {
    return (new Date() - new Date(addedAt)) / (1000 * 60 * 60 * 24) <= 14;
}

document.addEventListener('DOMContentLoaded', initApp);