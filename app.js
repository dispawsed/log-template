// База данных твоих игр
const gamesData = [
    { title: "The Witcher 3: Wild Hunt", appId: 292030, status: "recommended" },
    { title: "Cyberpunk 2077", appId: 1091500, status: "recommended" },
    { title: "Death Stranding", appId: 1190460, status: "playing" },
    { title: "Elden Ring", appId: 1245620, status: "playing" },
    { title: "Grand Theft Auto V", appId: 271590, status: "playing" },
    { title: "Hades II", appId: 1145350, status: "want-to-play" },
    { title: "Red Dead Redemption 2", appId: 1174180, status: "want-to-play" },
    { title: "Alan Wake 2", appId: 2603300, status: "want-to-play" },
    
    // Тестовые нерекомендуемые игры
    { title: "The Day Before", appId: 1372880, status: "not-recommended" },
    { title: "FlatOut 3: Chaos & Destruction", appId: 201790, status: "not-recommended" }
];

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

function initGallery() {
    // Новый желаемый порядок вывода категорий
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
        
        // Сортировка по алфавиту
        currentGames.sort((a, b) => a.title.localeCompare(b.title));
        
        currentGames.forEach(game => {
            const card = createGameCard(game);
            gridContainer.appendChild(card);
        });
    });
}

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    themeBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            themeBtn.textContent = '☀️';
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            themeBtn.textContent = '🌙';
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initTheme();
});