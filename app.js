const RECOMMENDED_CATEGORY = 'recommended';
const DOING_NOW_CATEGORY = 'doing-now';
const WANT_TO_DO_CATEGORY = 'want-to-do';
const NOT_RECOMMENDED_CATEGORY = 'not-recommended';
let categories = [ 
    RECOMMENDED_CATEGORY, 
    DOING_NOW_CATEGORY, 
    WANT_TO_DO_CATEGORY, 
    NOT_RECOMMENDED_CATEGORY 
];

let appsettings = {};

let items = [];
let navCache = [];
let searchData = [];

let currentLang = 'en';
let isMemoriesMode = false;

const DARK_THEME = 'dark-theme';
const LIGHT_THEME = 'light-theme';
const THEME_KEY = 'theme';
const MOON_ICON = '🌙';
const SUN_ICON = '☀️';

const EN_LANGUAGE = 'en';
const RU_LANGUAGE = 'ru';
const RU_LOCALE = 'ru-RU';
const EN_LOCALE = 'en-US';
const LANGUAGE_KEY = 'language';

const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const thresholdDate = Date.now() - NEW_THRESHOLD_MS;

const DEFAULT_COMMENT = '—';

const themeBtn = document.getElementById('theme-toggle');
const langBtn = document.getElementById('lang-toggle');
const memoriesBtn = document.getElementById('memories-toggle');
const searchInput = document.getElementById('items-search');

const cardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const cardLink = entry.target;
        const itemId = parseInt(cardLink.dataset.id, 10);
        const item = items.find(i => i.id === itemId);

        if (!item) return;

        if (entry.isIntersecting) {
            fillCardData(cardLink, item);
        } else {
            clearCardData(cardLink);
        }
    });
}, {
    root: null,
    rootMargin: "300px 0px 300px 0px"
});

async function initApp() {
    try {
        const [savedTheme, savedLang] = [
            localStorage.getItem(THEME_KEY) || DARK_THEME,
            localStorage.getItem(LANGUAGE_KEY) || EN_LANGUAGE
        ];

        document.body.classList.add(savedTheme);
        currentLang = savedLang;

        const [appsettingsJson, itemsJson] = await Promise.all([
            fetch('appsettings.json').then(r => r.json()),
            fetch('items.json').then(r => r.json())
        ]);

        appsettings = appsettingsJson;

        items = itemsJson.map((item, index) => ({
            ...item,
            id: index + 1,
            isNew: new Date(item.addedAt).getTime() >= thresholdDate
        }));
        
        langBtn.textContent = currentLang === RU_LANGUAGE ? EN_LANGUAGE : RU_LANGUAGE;

        renderFooterLinks();
        applyTranslations();
        initGallery();
        initControls();
        initSearch();

    } catch (err) {
        console.error("Internal server error:", err);
    }
}

function createItemCard(item) {
    const cardLink = document.createElement('a');
    cardLink.href = item.sourceUrl || `${appsettings.itemSourceUrl}/${item.sourceId}`;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = 'item-card';
    cardLink.dataset.id = item.id; 
    cardLink.dataset.loaded = "false"; 

    const displayName = item.translatedName && item.translatedName[currentLang] 
        ? item.translatedName[currentLang] 
        : (item.name || '');

    const info = document.createElement('div');
    info.className = 'item-info';
    
    const title = document.createElement('h3');
    title.className = 'item-title';
    title.textContent = displayName;
    
    info.appendChild(title);
    cardLink.appendChild(info);

    cardsObserver.observe(cardLink);

    return cardLink;
}

function fillCardData(cardLink, item) {
    if (cardLink.dataset.loaded === "true") return;

    const t = appsettings.translations[currentLang];

    if (item.isNew) {
        const badge = document.createElement('div');
        badge.className = 'new-badge';
        badge.textContent = t.newLabel;
        cardLink.appendChild(badge);
    }

    const coverWrap = document.createElement('div');
    coverWrap.className = 'item-cover-wrap';

    const displayName = item.translatedName && item.translatedName[currentLang] 
        ? item.translatedName[currentLang] 
        : (item.name || '');

    const img = document.createElement('img');
    img.className = 'item-cover';
    img.src = `${appsettings.itemImageUrl}/${item.imageId}.webp`;
    img.alt = displayName;
    img.loading = 'lazy';
    coverWrap.appendChild(img);

    const statsText = t.itemStats;
    const dateObj = new Date(item.addedAt);
    const formattedDate = dateObj.toLocaleDateString(currentLang === RU_LANGUAGE ? RU_LOCALE : EN_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const userComment = item.comment ? (currentLang === RU_LANGUAGE ? item.comment.ru : item.comment.en) : DEFAULT_COMMENT;

    const statsOverlay = document.createElement('div');
    statsOverlay.className = 'item-stats-overlay';
    
    statsOverlay.innerHTML = `
        <div class="stats-item">
            <span class="stats-label">${statsText.added}</span>
            <span class="stats-value">${formattedDate}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">${statsText.comment}</span>
            <span class="stats-value comment-text">«${userComment}»</span>
        </div>
    `;
    
    coverWrap.appendChild(statsOverlay);

    const infoEl = cardLink.querySelector('.item-info');
    cardLink.insertBefore(coverWrap, infoEl);

    cardLink.dataset.loaded = "true";
}

function clearCardData(cardLink) {
    if (cardLink.dataset.loaded !== "true") return;
    
    const coverWrap = cardLink.querySelector('.item-cover-wrap');
    if (coverWrap) coverWrap.remove();
    
    const badge = cardLink.querySelector('.new-badge');
    if (badge) badge.remove();

    cardLink.dataset.loaded = "false";
}

function applyTranslations() {
    const t = appsettings.translations[currentLang];
    
    const update = (ids, value) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    };

    update(['nav-recommended', 'title-recommended'], t.categories.recommended);
    update(['nav-doing-now', 'title-doing-now'], t.categories.doingNow);
    update(['nav-want-to-do', 'title-want-to-do'], t.categories.wantToDo);
    update(['nav-not-recommended', 'title-not-recommended'], t.categories.notRecommended);
    
    update(['no-results-message'], t.noResults);

    appsettings.links.forEach(link => {
        update([link.id], t.links[link.id]);
    });

    searchInput.placeholder = t.searchPlaceholder;

    document.querySelectorAll('.item-card').forEach(card => {
        const itemId = parseInt(card.dataset.id, 10);
        const item = items.find(i => i.id === itemId);

        if (item) {
            const titleEl = card.querySelector('.item-title');
            const imgEl = card.querySelector('.item-cover');

            const newDisplayName = item.translatedName && item.translatedName[currentLang]
                ? item.translatedName[currentLang]
                : item.name;

            if (titleEl) titleEl.textContent = newDisplayName;
            if (imgEl) imgEl.alt = newDisplayName;
        }
    });
}

function initGallery() {
    categories.forEach(category => {
        const gridContainer = document.getElementById(`grid-${category}`);
        const sectionElement = document.getElementById(`section-${category}`);
        const navLink = document.getElementById(`nav-${category}`);

        const currentItems = items.filter(item => item.category === category);
        
        if (currentItems.length === 0) {
            if (sectionElement) sectionElement.style.display = 'none';
            if (navLink) navLink.style.display = 'none';
            return;
        }
        
        currentItems.sort((a, b) => {
            if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;

            const getName = (item) => {
                if (item.translatedName && item.translatedName[currentLang]) {
                    return item.translatedName[currentLang];
                }
                return item.name || '';
            };

            const nameA = getName(a);
            const nameB = getName(b);

            return nameA.localeCompare(nameB);
        });
        
        if (gridContainer) {
            gridContainer.innerHTML = '';
            const fragment = document.createDocumentFragment();
            
            currentItems.forEach(item => {
                fragment.appendChild(createItemCard(item));
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

        const term = searchInput.value.toLowerCase();
        performSearch(term); 
    });

    memoriesBtn.addEventListener('click', () => {
        isMemoriesMode = !isMemoriesMode;
        memoriesBtn.classList.toggle('active', isMemoriesMode);

        updateMemoriesQueryParam(isMemoriesMode);

        performSearch(searchInput ? searchInput.value.toLowerCase() : '');
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
        const hasVisible = Array.from(section.querySelectorAll('.item-card'))
            .some(card => card.style.display !== 'none');

        navLink.style.display = hasVisible ? 'inline-block' : 'none';
    });
}

function refreshSearchCache() {
    searchData = Array.from(document.querySelectorAll('.item-card')).map(card => {
        const itemId = parseInt(card.dataset.id, 10);
        const item = items.find(i => i.id === itemId);
        
        let searchString = '';
        let hasMemory = false;

        if (item) {
            if (item.name) searchString += item.name.toLowerCase() + ' ';
            if (item.translatedName) {
                if (item.translatedName.ru) searchString += item.translatedName.ru.toLowerCase() + ' ';
                if (item.translatedName.en) searchString += item.translatedName.en.toLowerCase() + ' ';
            }

            const userComment = item.comment ? (currentLang === RU_LANGUAGE ? item.comment.ru : item.comment.en) : '';
            hasMemory = userComment && userComment !== DEFAULT_COMMENT && userComment.trim() !== '';
        }

        return {
            element: card,
            searchNames: searchString.trim(),
            hasMemory: hasMemory
        };
    });
}

function initSearch() {
    const searchInput = document.getElementById('items-search');
    const clearBtn = document.getElementById('clear-search');
    const memoriesBtn = document.getElementById('memories-toggle');

    const urlParams = new URLSearchParams(window.location.search);
    const initialTerm = urlParams.get('search');
    const initialMemories = urlParams.get('memories') === 'true';

    if (initialMemories) {
        isMemoriesMode = true;
        if (memoriesBtn) {
            memoriesBtn.classList.add('active');
        }
    }
    
    const toggleClearButton = (term) => {
        clearBtn.style.display = term ? 'flex' : 'none';
    };
    
    if (initialTerm) {
        searchInput.value = initialTerm;
        toggleClearButton(initialTerm);
    }

    if (initialTerm || initialMemories) {
        setTimeout(() => performSearch(initialTerm || ''), 100); 
    }

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        toggleClearButton(term);
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(term);
            updateSearchQueryParam(term);
        }, 100);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearButton('');
        performSearch('');
        updateSearchQueryParam('');
        searchInput.focus();
    });
}

function performSearch(term) {
    let hasAnyVisible = false;

    searchData.forEach(({ element, searchNames,hasMemory }) => {
        const isMatch = searchNames.includes(term);
        const matchesMemories = !isMemoriesMode || hasMemory;

        const shouldShow = isMatch && matchesMemories;
        element.style.display = shouldShow ? 'flex' : 'none';

        if (shouldShow) hasAnyVisible = true;
    });

    categories.forEach(category => {
        const section = document.getElementById(`section-${category}`);
        if (!section) return;

        const hasVisibleInSection = Array.from(section.querySelectorAll('.item-card'))
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

function updateMemoriesQueryParam(isActive) {
    const url = new URL(window.location);

    if (isActive) {
        url.searchParams.set('memories', 'true');
    } else {
        url.searchParams.delete('memories');
    }

    window.history.replaceState(null, '', url);
}

function renderFooterLinks() {
    const container = document.getElementById('footer-links');

    container.innerHTML = '';

    appsettings.links.forEach(link => {
        const a = document.createElement('a');
        
        a.id = link.id;
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        container.appendChild(a);
    });
}

document.addEventListener('DOMContentLoaded', initApp);