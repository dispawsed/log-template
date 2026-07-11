// База данных: ровно по 7 игр в каждой категории
const gamesData = [
    // 🔥 Recommended
    { title: "Cyberpunk 2077", appId: 1091500, status: "recommended" },
    { title: "The Witcher 3: Wild Hunt", appId: 292030, status: "recommended" },
    { title: "Elden Ring", appId: 1245620, status: "recommended" },
    { title: "Portal 2", appId: 620, status: "recommended" },
    { title: "Red Dead Redemption 2", appId: 1174180, status: "recommended" },
    { title: "Hades", appId: 1145360, status: "recommended" },
    { title: "Persona 5 Royal", appId: 1687950, status: "recommended" },

    // 🎮 Playing
    { title: "Death Stranding", appId: 1190460, status: "playing" },
    { title: "Grand Theft Auto V", appId: 271590, status: "playing" },
    { title: "Balatro", appId: 2379780, status: "playing" },
    { title: "Dota 2", appId: 570, status: "playing" },
    { title: "Counter-Strike 2", appId: 730, status: "playing" },
    { title: "Helldivers 2", appId: 553850, status: "playing" },
    { title: "Forza Horizon 5", appId: 1551360, status: "playing" },

    // ⏳ Want to play
    { title: "Hades II", appId: 1145350, status: "want-to-play" },
    { title: "Alan Wake 2", appId: 2603300, status: "want-to-play" },
    { title: "Baldur's Gate 3", appId: 1086940, status: "want-to-play" },
    { title: "Resident Evil 4", appId: 2050650, status: "want-to-play" },
    { title: "Monster Hunter: Wilds", appId: 2246340, status: "want-to-play" },
    { title: "Kingdom Come: Deliverance II", appId: 1771300, status: "want-to-play" },
    { title: "Mafia: The Old Country", appId: 3014160, status: "want-to-play" },

    // 👎 Not recommended
    { title: "The Day Before", appId: 1372880, status: "not-recommended" },
    { title: "FlatOut 3: Chaos & Destruction", appId: 201790, status: "not-recommended" },
    { title: "Overwatch 2", appId: 2357570, status: "not-recommended" },
    { title: "Suicide Squad: Kill the Justice League", appId: 315940, status: "not-recommended" },
    { title: "The Lord of the Rings: Gollum", appId: 1265780, status: "not-recommended" },
    { title: "Concord", appId: 2951900, status: "not-recommended" },
    { title: "Starfield", appId: 1716740, status: "not-recommended" }
];

// Переводы для локализации
const translations = {
    ru: {
        pageTitle: "Игровая Полка",
        headerTitle: "Игровая Полка",
        recommended: "🔥 Рекомендую",
        playing: "🎮 Играю",
        wantToPlay: "⏳ Хочу сыграть",
        notRecommended: "👎 Не рекомендую"
    },
    en: {
        pageTitle: "Game Shelf",
        headerTitle: "Game Shelf",
        recommended: "🔥 Recommended",
        playing: "🎮 Playing",
        wantToPlay: "⏳ Want to Play",
        notRecommended: "👎 Not Recommended"
    }
};

let currentLang = 'ru';

function createGameCard(game) {
    const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`;
    const steamUrl = `https://store.steampowered.com/app/${game.appId}`;

    const cardLink = document.createElement('a');
    cardLink.href = steamUrl;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = 'game-card';
    
    cardLink.innerHTML = `
        <div class="game-cover-wrap">
            <img class="game-cover" src="${coverUrl}" alt="${game.title}" loading="lazy">
        </div>
        <div class="game-info">
            <h3 class="game-title" title="${game.title}">${game.title}</h3>
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
}

function initGallery() {
    const statuses = ['recommended', 'playing', 'want-to-play', 'not-recommended'];
    
    statuses.forEach(status => {
        const gridContainer = document.getElementById(`grid-${status}`);
        const sectionElement = document.getElementById(`section-${status}`);
        const navLink = document.getElementById(`nav-${status}`);
        
        const currentGames = gamesData.filter(game => game.status === status);
        
        if (currentGames.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            if (navLink) navLink.style.display = 'none';
            return;
        }
        
        // Алфавитный порядок
        currentGames.sort((a, b) => a.title.localeCompare(b.title));
        
        gridContainer.innerHTML = ''; // Очистка перед рендером
        currentGames.forEach(game => {
            const card = createGameCard(game);
            gridContainer.appendChild(card);
        });
    });
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
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initControls();
    applyTranslations(); // Устанавливаем язык при старте
});