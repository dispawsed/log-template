// База данных твоих игр
const gamesData = [
    {
        id: 1,
        title: "Cyberpunk 2077",
        appId: 1091500,
        status: "recommended",
        comment: "Потрясающий сюжет и атмосфера. Найт-Сити затягивает с головой, особенно после патчей."
    },
    {
        id: 2,
        title: "Hades II",
        appId: 1145350,
        status: "want-to-play",
        comment: "Жду полного релиза, оригинал был абсолютным шедевром."
    },
    {
        id: 3,
        title: "Elden Ring",
        appId: 1245620,
        status: "played",
        comment: "Прошел полностью. Мир огромный и красивый, но гринд местами утомляет."
    },
    {
        id: 4,
        title: "The Witcher 3: Wild Hunt",
        appId: 292030,
        status: "recommended",
        comment: "Классика, которую перепрохожу раз в пару лет. Лучшие квесты в индустрии."
    }
];

// Словарик для человекочитаемых статусов
const statusLabels = {
    "recommended": "🔥 Рекомендую",
    "played": "🎮 Играл",
    "want-to-play": "⏳ Хочу сыграть",
    "not-recommended": "👎 Не рекомендую"
};

const gamesGrid = document.getElementById('games-grid');
const filterContainer = document.getElementById('filter-container');

// Функция создания карточки игры
function createGameCard(game) {
    // Собираем ссылки на основе Steam AppID
    const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`;
    const steamUrl = `https://store.steampowered.com/app/${game.appId}`;

    const card = document.createElement('div');
    card.className = 'game-card';
    
    card.innerHTML = `
        <div class="game-cover-wrap">
            <img class="game-cover" src="${coverUrl}" alt="${game.title}" loading="lazy">
        </div>
        <div class="game-info">
            <span class="game-status status-${game.status}">${statusLabels[game.status]}</span>
            <h3 class="game-title">${game.title}</h3>
            <p class="game-comment">${game.comment || 'Без комментария.'}</p>
            <a href="${steamUrl}" target="_blank" rel="noopener noreferrer" class="steam-link">
                <span>Страница в Steam</span>
            </a>
        </div>
    `;
    return card;
}

// Функция рендеринга списка игр с фильтрацией
function renderGames(filter = 'all') {
    gamesGrid.innerHTML = ''; // Очищаем сетку
    
    const filteredGames = filter === 'all' 
        ? gamesData 
        : gamesData.filter(game => game.status === filter);

    if (filteredGames.length === 0) {
        gamesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Тут пока ничего нет...</p>`;
        return;
    }

    filteredGames.forEach(game => {
        const card = createGameCard(game);
        gamesGrid.appendChild(card);
    });
}

// Слушатель кликов по кнопкам фильтрации
filterContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (!button) return;

    // Переключаем активный класс на кнопках
    filterContainer.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Фильтруем
    const filterValue = button.getAttribute('data-filter');
    renderGames(filterValue);
});

// Первый запуск — отображаем все игры
document.addEventListener('DOMContentLoaded', () => {
    renderGames('all');
});