// База данных: ровно по 7 игр в каждой категории
const gamesData = [
    // 🔥 Recommended
    { name: "Cyberpunk 2077", steamAppId: 1091500, igdbId: "coaih8", status: "recommended", addedAt: "2026-07-01" },
    { name: "The Witcher 3: Wild Hunt", steamAppId: 292030, igdbId: "coaarl", status: "recommended", addedAt: "2025-01-01" },
    { name: "Elden Ring", steamAppId: 1245620, igdbId: "co1q3k", status: "recommended", addedAt: "2025-01-01" },
    { name: "Portal 2", steamAppId: 620, igdbId: "co1q3k", status: "recommended", addedAt: "2025-01-01" },
    { name: "Red Dead Redemption 2", steamAppId: 1174180, igdbId: "co1q3k", status: "recommended", addedAt: "2025-01-01" },
    { name: "Hades", steamAppId: 1145360, igdbId: "co1q3k", status: "recommended", addedAt: "2025-01-01" },
    { name: "Persona 5 Royal", steamAppId: 1687950, igdbId: "co1q3k", status: "recommended", addedAt: "2026-07-01" },
    { name: "Minecraft", gameUrl: "https://www.xbox.com/en-us/games/store/minecraft/9MVXMVT8ZKWC", igdbId: "co8fu7", status: "recommended", addedAt: "2026-07-13" },

    // 🎮 Playing
    { name: "Death Stranding", steamAppId: 1190460, igdbId: "co1q3k", status: "playing", addedAt: "2026-07-01" },
    { name: "Grand Theft Auto V", steamAppId: 271590, igdbId: "co1q3k", status: "playing", addedAt: "2025-01-01" },
    { name: "Balatro", steamAppId: 2379780, igdbId: "co1q3k", status: "playing", addedAt: "2025-01-01" },
    { name: "Dota 2", steamAppId: 570, igdbId: "co1q3k", status: "playing", addedAt: "2025-01-01" },
    { name: "Counter-Strike 2", steamAppId: 730, igdbId: "co1q3k", status: "playing", addedAt: "2025-01-01" },
    { name: "Helldivers 2", steamAppId: 553850, igdbId: "co1q3k", status: "playing", addedAt: "2025-01-01" },
    { name: "Forza Horizon 5", steamAppId: 1551360, igdbId: "co1q3k", status: "playing", addedAt: "2026-07-01" },

    // ⏳ Want to play
    { name: "Hades II", steamAppId: 1145350, igdbId: "co1q3k", status: "want-to-play", addedAt: "2026-07-01" },
    { name: "Alan Wake 2", steamAppId: 2603300, igdbId: "co1q3k", status: "want-to-play", addedAt: "2025-01-01" },
    { name: "Baldur's Gate 3", steamAppId: 1086940, igdbId: "co1q3k", status: "want-to-play", addedAt: "2025-01-01" },
    { name: "Resident Evil 4", steamAppId: 2050650, igdbId: "co1q3k", status: "want-to-play", addedAt: "2025-01-01" },
    { name: "Monster Hunter: Wilds", steamAppId: 2246340, igdbId: "co1q3k", status: "want-to-play", addedAt: "2025-01-01" },
    { name: "Kingdom Come: Deliverance II", steamAppId: 1771300, igdbId: "co1q3k", status: "want-to-play", addedAt: "2025-01-01" },
    { name: "Mafia: The Old Country", steamAppId: 3014160, igdbId: "co1q3k", status: "want-to-play", addedAt: "2026-07-01" },

    // 👎 Not recommended
    { name: "The Day Before", steamAppId: 1372880, igdbId: "co1q3k", status: "not-recommended", addedAt: "2026-07-01" },
    { name: "FlatOut 3: Chaos & Destruction", steamAppId: 201790, igdbId: "co1q3k", status: "not-recommended", addedAt: "2025-01-01" },
    { name: "Overwatch 2", steamAppId: 2357570, igdbId: "co1q3k", status: "not-recommended", addedAt: "2025-01-01" },
    { name: "Suicide Squad: Kill the Justice League", steamAppId: 315940, igdbId: "co1q3k", status: "not-recommended", addedAt: "2025-01-01" },
    { name: "The Lord of the Rings: Gollum", steamAppId: 1265780, igdbId: "co1q3k", status: "not-recommended", addedAt: "2025-01-01" },
    { name: "Concord", steamAppId: 2951900, igdbId: "co1q3k", status: "not-recommended", addedAt: "2025-01-01" },
    { name: "Starfield", steamAppId: 1716740, igdbId: "co1q3k", status: "not-recommended", addedAt: "2026-07-01" }
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
    categories.forEach(status => {
        const section = document.getElementById(`section-${status}`);
        const navLink = document.getElementById(`nav-${status}`);
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

        categories.forEach(status => {
            const section = document.getElementById(`section-${status}`);
            const visibleCards = Array.from(section.querySelectorAll('.game-card'))
                .filter(c => c.style.display !== 'none');
            if (section) section.style.display = visibleCards.length > 0 ? 'flex' : 'none';
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