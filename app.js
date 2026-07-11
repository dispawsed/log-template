// База данных твоих игр
const gamesData = [
    { id: 1, title: "Cyberpunk 2077", appId: 1091500, status: "recommended" },
    { id: 2, title: "The Witcher 3: Wild Hunt", appId: 292030, status: "recommended" },
    { id: 3, title: "Elden Ring", appId: 1245620, status: "played" },
    { id: 4, title: "Grand Theft Auto V", appId: 271590, status: "played" },
    { id: 5, title: "Hades II", appId: 1145350, status: "want-to-play" },
    { id: 6, title: "Red Dead Redemption 2", appId: 1174180, status: "want-to-play" }
];

// Функция сборки DOM-элемента карточки
function createGameCard(game) {
    // Официальный CDN Steam для вертикальных обложек (размер 600x900)
    const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`;
    const steamUrl = `https://store.steampowered.com/app/${game.appId}`;

    // Создаем ссылку-контейнер
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

// Распределяем игры по соответствующим Grid-сеткам
function initGallery() {
    const statuses = ['recommended', 'played', 'want-to-play', 'not-recommended'];
    
    statuses.forEach(status => {
        const gridContainer = document.getElementById(`grid-${status}`);
        const sectionElement = document.getElementById(`section-${status}`);
        
        // Фильтруем игры по текущему статусу
        const currentGames = gamesData.filter(game => game.status === status);
        
        // Если в этой категории игр нет — полностью скрываем секцию с экрана
        if (currentGames.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            return;
        }
        
        // Рендерим карточки в сетку
        currentGames.forEach(game => {
            const card = createGameCard(game);
            gridContainer.appendChild(card);
        });
    });
}

// Запуск логики после полной загрузки страницы
window.addEventListener('DOMContentLoaded', initGallery);