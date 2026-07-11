// База данных: ровно по 7 игр в каждой категории
const gamesData = [
    // 🔥 Recommended
    { title: "Cyberpunk 2077", appId: 1091500, status: "recommended", addedAt: "2026-07-01" },
    { title: "The Witcher 3: Wild Hunt", appId: 292030, status: "recommended", addedAt: "2025-01-01" },
    { title: "Elden Ring", appId: 1245620, status: "recommended", addedAt: "2025-01-01" },
    { title: "Portal 2", appId: 620, status: "recommended", addedAt: "2025-01-01" },
    { title: "Red Dead Redemption 2", appId: 1174180, status: "recommended", addedAt: "2025-01-01" },
    { title: "Hades", appId: 1145360, status: "recommended", addedAt: "2025-01-01" },
    { title: "Persona 5 Royal", appId: 1687950, status: "recommended", addedAt: "2026-07-01" },

    // 🎮 Playing
    { title: "Death Stranding", appId: 1190460, status: "playing", addedAt: "2026-07-01" },
    { title: "Grand Theft Auto V", appId: 271590, status: "playing", addedAt: "2025-01-01" },
    { title: "Balatro", appId: 2379780, status: "playing", addedAt: "2025-01-01" },
    { title: "Dota 2", appId: 570, status: "playing", addedAt: "2025-01-01" },
    { title: "Counter-Strike 2", appId: 730, status: "playing", addedAt: "2025-01-01" },
    { title: "Helldivers 2", appId: 553850, status: "playing", addedAt: "2025-01-01" },
    { title: "Forza Horizon 5", appId: 1551360, status: "playing", addedAt: "2026-07-01" },

    // ⏳ Want to play
    { title: "Hades II", appId: 1145350, status: "want-to-play", addedAt: "2026-07-01" },
    { title: "Alan Wake 2", appId: 2603300, status: "want-to-play", addedAt: "2025-01-01" },
    { title: "Baldur's Gate 3", appId: 1086940, status: "want-to-play", addedAt: "2025-01-01" },
    { title: "Resident Evil 4", appId: 2050650, status: "want-to-play", addedAt: "2025-01-01" },
    { title: "Monster Hunter: Wilds", appId: 2246340, status: "want-to-play", addedAt: "2025-01-01" },
    { title: "Kingdom Come: Deliverance II", appId: 1771300, status: "want-to-play", addedAt: "2025-01-01" },
    { title: "Mafia: The Old Country", appId: 3014160, status: "want-to-play", addedAt: "2026-07-01" },

    // 👎 Not recommended
    { title: "The Day Before", appId: 1372880, status: "not-recommended", addedAt: "2026-07-01" },
    { title: "FlatOut 3: Chaos & Destruction", appId: 201790, status: "not-recommended", addedAt: "2025-01-01" },
    { title: "Overwatch 2", appId: 2357570, status: "not-recommended", addedAt: "2025-01-01" },
    { title: "Suicide Squad: Kill the Justice League", appId: 315940, status: "not-recommended", addedAt: "2025-01-01" },
    { title: "The Lord of the Rings: Gollum", appId: 1265780, status: "not-recommended", addedAt: "2025-01-01" },
    { title: "Concord", appId: 2951900, status: "not-recommended", addedAt: "2025-01-01" },
    { title: "Starfield", appId: 1716740, status: "not-recommended", addedAt: "2026-07-01" }
];

// Переводы для локализации
const translations = {
    ru: {
        pageTitle: "Игровая Полка",
        headerTitle: "Игровая Полка",
        recommended: "🔥 Рекомендую",
        playing: "🎮 Играю",
        wantToPlay: "⏳ Хочу сыграть",
        notRecommended: "👎 Не рекомендую",
        searchPlaceholder: "Поиск игр...",
        newLabel: "Новая",
    },
    en: {
        pageTitle: "Game Shelf",
        headerTitle: "Game Shelf",
        recommended: "🔥 Recommended",
        playing: "🎮 Playing",
        wantToPlay: "⏳ Want to Play",
        notRecommended: "👎 Not Recommended",
        searchPlaceholder: "Search games...",
        newLabel: "New"
    }
};

const categories = ['recommended', 'playing', 'want-to-play', 'not-recommended'];

let currentLang = 'ru';

function createGameCard(game) {
    const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`;
    const steamUrl = `https://store.steampowered.com/app/${game.appId}`;

    const isGameNew = isNew(game.addedAt);
    const label = translations[currentLang].newLabel;

    const cardLink = document.createElement('a');
    cardLink.href = steamUrl;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = 'game-card';
    
    cardLink.innerHTML = `
        ${isGameNew ? `<div class="new-badge">${label}</div>` : ''}
        <div class="game-cover-wrap">
            <img class="game-cover" src="${coverUrl}" alt="${game.title}" loading="lazy">
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
        </div>
    `;
    return cardLink;
}

// Применяет текстовые переводы без перезаписи самих сеток с играми
function applyTranslations() {
    const t = translations[currentLang];
    
    document.title = t.pageTitle;
    document.getElementById('main-title').textContent = t.headerTitle;

    // Тексты навигации
    document.getElementById('nav-recommended').textContent = t.recommended;
    document.getElementById('nav-playing').textContent = t.playing;
    document.getElementById('nav-want-to-play').textContent = t.wantToPlay;
    document.getElementById('nav-not-recommended').textContent = t.notRecommended;

    // Заголовки секций
    document.getElementById('title-recommended').textContent = t.recommended;
    document.getElementById('title-playing').textContent = t.playing;
    document.getElementById('title-want-to-play').textContent = t.wantToPlay;
    document.getElementById('title-not-recommended').textContent = t.notRecommended;

    document.getElementById('game-search').placeholder = t.searchPlaceholder;
}

function initGallery() {
    // Используем константу
    categories.forEach(status => {
        const gridContainer = document.getElementById(`grid-${status}`);
        const sectionElement = document.getElementById(`section-${status}`);
        const navLink = document.getElementById(`nav-${status}`);
        
        const currentGames = gamesData.filter(game => game.status === status);
        
        if (currentGames.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            if (navLink) navLink.style.display = 'none';
            return;
        }
        
        currentGames.sort((a, b) => {
            const aNew = isNew(a.addedAt);
            const bNew = isNew(b.addedAt);
            
            if (aNew !== bNew) {
                return aNew ? -1 : 1; // Новые всегда выше
            }
            return a.title.localeCompare(b.title); // Если оба New или оба старые — алфавит
        });
        
        gridContainer.innerHTML = ''; 
        currentGames.forEach(game => {
            const card = createGameCard(game);
            gridContainer.appendChild(card);
        });
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
    // Используем константу вместо создания массива каждый раз
    categories.forEach(status => {
        const section = document.getElementById(`section-${status}`);
        const navLink = document.getElementById(`nav-${status}`);
        
        const visibleCards = Array.from(section.querySelectorAll('.game-card'))
            .filter(card => card.style.display !== 'none');
            
        if (navLink) {
            navLink.style.display = visibleCards.length > 0 ? 'inline-block' : 'none';
        }
    });
}

function initSearch() {
    const searchInput = document.getElementById('game-search');
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const allCards = document.querySelectorAll('.game-card');
        
        allCards.forEach(card => {
            const title = card.querySelector('.game-title').textContent.toLowerCase();
            card.style.display = title.includes(term) ? 'flex' : 'none';
        });

        // Скрываем пустые секции
        categories.forEach(status => {
            const section = document.getElementById(`section-${status}`);
            const visibleCards = Array.from(section.querySelectorAll('.game-card'))
                .filter(c => c.style.display !== 'none');
            section.style.display = visibleCards.length > 0 ? 'flex' : 'none';
        });

        updateNavVisibility();
    });
}

function isNew(addedAt) {
    const addedDate = new Date(addedAt);
    const now = new Date();
    const diffTime = Math.abs(now - addedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 14;
}

window.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initControls();
    initSearch();
    applyTranslations(); // Устанавливаем язык при старте
});