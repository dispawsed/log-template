// База данных твоих игр (без id)
const gamesData = [
    { title: "The Witcher 3: Wild Hunt", appId: 292030, status: "recommended" },
    { title: "Cyberpunk 2077", appId: 1091500, status: "recommended" },
    { title: "Death Stranding", appId: 1190460, status: "played" },
    { title: "Elden Ring", appId: 1245620, status: "played" },
    { title: "Grand Theft Auto V", appId: 271590, status: "played" },
    { title: "Hades II", appId: 1145350, status: "want-to-play" },
    { title: "Red Dead Redemption 2", appId: 1174180, status: "want-to-play" },
    { title: "Alan Wake 2", appId: 2603300, status: "want-to-play" }
];

// Функция сборки DOM-элемента карточки
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

// Распределяем игры по соответствующим Grid-сеткам с алфавитной сортировкой
function initGallery() {
    // Жестко заданный порядок категорий
    const statuses = ['want-to-play', 'played', 'recommended', 'not-recommended'];
    
    statuses.forEach(status => {
        const gridContainer = document.getElementById(`grid-${status}`);
        const sectionElement = document.getElementById(`section-${status}`);
        const navLink = document.getElementById(`nav-${status}`);
        
        // 1. Фильтруем игры по текущему статусу
        const currentGames = gamesData.filter(game => game.status === status);
        
        // Если игр в категории нет — скрываем секцию и ссылку в меню
        if (currentGames.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            if (navLink) navLink.style.display = 'none';
            return;
        }
        
        // 2. Сортируем игры внутри категории по алфавиту (A-Я)
        currentGames.sort((a, b) => a.title.localeCompare(b.title));
        
        // 3. Рендерим отсортированные карточки в сетку
        currentGames.forEach(game => {
            const card = createGameCard(game);
            gridContainer.appendChild(card);
        });
    });
}

// Логика переключения светлой/темной темы
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

// Запуск инициализации после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initTheme();
});