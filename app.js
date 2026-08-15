let appsettings = {};
let translations = {};

let items = [];
let navCache = [];
let searchData = [];

let currentLang = 'en';
let typeMods = {};

const MEMORY_ICON = '🧠';
const MOON_ICON = '🌙';
const SUN_ICON = '☀️';

const THEME_KEY = 'theme';
const DARK_THEME = 'dark-theme';
const LIGHT_THEME = 'light-theme';

const LANGUAGE_KEY = 'language';
const EN_LANGUAGE = 'en';
const RU_LANGUAGE = 'ru';

const RU_LOCALE = 'ru-RU';
const EN_LOCALE = 'en-US';

const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const thresholdDate = Date.now() - NEW_THRESHOLD_MS;

const DEFAULT_COMMENT = '—';
const MEMORY_TYPE = 'memories';
const TYPE_MODS_QUERY_PARAMETER = 'type';

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

        const [appsettingsJson, translationsJson, itemsJson] = await Promise.all([
            fetch('appsettings.json').then(r => r.json()),
            fetch('translations.json').then(r => r.json()),
            fetch('items.json').then(r => r.json())
        ]);

        appsettings = appsettingsJson;
        appsettings.types.push(MEMORY_TYPE);

        translations = translationsJson

        items = itemsJson.map((item, index) => ({
            ...item,
            id: index + 1,
            isNew: new Date(item.updatedAt).getTime() >= thresholdDate
        }));

        setTitleAndFooter();
        renderFooterLinks();
        initCategories();
        initSearchTypes();
        applyTranslations();
        initGallery();
        initControls();
        initSearch();

    } catch (err) {
        console.error("Internal server error:", err);
    }
}

function setTitleAndFooter() {
    const year = new Date().getFullYear();
    const titleText = appsettings.title;

    const mainTitle = document.getElementById('main-title');
    const footer = document.getElementById('footer-copyright');

    document.title = titleText;
    mainTitle.textContent = titleText;
    footer.textContent = `© ${year} ${titleText}`;
}

function initCategories() {
    const categoriesLinksContainer = document.getElementById('categories-links');
    const mainContainer = document.getElementById('main-container');

    appsettings.categories.forEach(category => {
        addCategorySectionLink(categoriesLinksContainer, category);
        addCategorySection(mainContainer, category);
    });
}

function addCategorySectionLink(container, category) {
    const categorySection = document.createElement('a');

    categorySection.id = `nav-${category}`;
    categorySection.href = `#section-${category}`;

    container.appendChild(categorySection);
}

function addCategorySection(container, category) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `section-${category}`;

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.id = `title-${category}`;

    const div = document.createElement('div');
    div.className = 'items-grid';
    div.id = `grid-${category}`;

    section.appendChild(h2);
    section.appendChild(div);

    container.appendChild(section);
}

function initSearchTypes() {
    const searchWrapperContainer = document.getElementById('search-wrapper-container');

    appsettings.types.reverse().forEach(type => {
        typeMods[type] = false;

        const button = document.createElement('button');

        button.classList.add("type-btn", "custom-tooltip");
        button.id = `${type}-toggle`;

        searchWrapperContainer.prepend(button);
    });
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

    const t = translations[currentLang];

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
    const dateObj = new Date(item.updatedAt);
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
    const searchInput = document.getElementById('items-search');

    const t = translations[currentLang];
    
    const update = (ids, value) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    };

    appsettings.categories.forEach(category => {
        update([`nav-${category}`, `title-${category}`], t.categories[category]);
    });
    
    update(['no-results-message'], t.noResults);

    appsettings.links.forEach(link => {
        update([link.id], t.links[link.id]);
    });

    appsettings.types.forEach(type => {
        const typeBtn = document.getElementById(`${type}-toggle`);

        typeBtn.dataset.tooltip = type === MEMORY_TYPE ? t.memoriesType : t.types[type].tooltip;
        typeBtn.textContent = type === MEMORY_TYPE ? MEMORY_ICON : t.types[type].icon;
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
    appsettings.categories.forEach(category => {
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
    const themeBtn = document.getElementById('theme-toggle');
    const langBtn = document.getElementById('lang-toggle');
    const searchInput = document.getElementById('items-search');

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

    appsettings.types.forEach(type => {
        const typeBtn = document.getElementById(`${type}-toggle`);

        typeBtn.addEventListener('click', () => {
            const isActive = !typeMods[type];

            if (isActive && type !== MEMORY_TYPE) {
                appsettings.types.forEach(innerType => {
                    if (innerType !== MEMORY_TYPE && innerType !== type)
                    {
                        const innerTypeBtn = document.getElementById(`${innerType}-toggle`);

                        const innerIsActive = false;

                        typeMods[innerType] = innerIsActive;
                        innerTypeBtn.classList.toggle('active', innerIsActive);

                        updateTypeModsQueryParam(innerType);
                    }
                });
            }

            typeMods[type] = isActive;
            typeBtn.classList.toggle('active', isActive);

            updateTypeModsQueryParam(type);

            performSearch(searchInput ? searchInput.value.toLowerCase() : '');
        });
    });
}

function initNavCache() {
    navCache = appsettings.categories.map(category => ({
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
        let type = '';

        if (item) {
            if (item.name) searchString += item.name.toLowerCase() + ' ';
            if (item.translatedName) {
                if (item.translatedName.ru) searchString += item.translatedName.ru.toLowerCase() + ' ';
                if (item.translatedName.en) searchString += item.translatedName.en.toLowerCase() + ' ';
            }

            const userComment = item.comment ? (currentLang === RU_LANGUAGE ? item.comment.ru : item.comment.en) : '';
            hasMemory = userComment && userComment !== DEFAULT_COMMENT && userComment.trim() !== '';
            type = item.type;
        }

        return {
            element: card,
            searchNames: searchString.trim(),
            hasMemory: hasMemory,
            type: type
        };
    });
}

function initSearch() {
    const searchInput = document.getElementById('items-search');
    const clearBtn = document.getElementById('clear-search');

    const urlParams = new URLSearchParams(window.location.search);
    const initialTerm = urlParams.get('search');
    const memoriesType = urlParams.get(MEMORY_TYPE) === 'true';
    const type = urlParams.get(TYPE_MODS_QUERY_PARAMETER);

    if (memoriesType) {
        typeMods[MEMORY_TYPE] = true;

        const typeBtn = document.getElementById(`${MEMORY_TYPE}-toggle`);
        typeBtn.classList.add('active');
    }

    if (type) {
        typeMods[type] = true;

        const typeBtn = document.getElementById(`${type}-toggle`);
        typeBtn.classList.add('active');
    }
    
    const toggleClearButton = (term) => {
        clearBtn.style.display = term ? 'flex' : 'none';
    };
    
    if (initialTerm) {
        searchInput.value = initialTerm;
        toggleClearButton(initialTerm);
    }

    if (initialTerm || memoriesType || type) {
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

    searchData.forEach(data => {
        const isMatch = data.searchNames.includes(term);
        const matchesMemories = !typeMods[MEMORY_TYPE] || data.hasMemory;

        let matchesTypes = true;
        appsettings.types.forEach(type => {
            if (type === MEMORY_TYPE) {
                matchesTypes = matchesTypes && (!typeMods[type] || data.hasMemory);
            }
            else {
                matchesTypes = matchesTypes && (!typeMods[type] || data.type === type);
            }
        });

        const shouldShow = isMatch && matchesTypes;
        data.element.style.display = shouldShow ? 'flex' : 'none';

        if (shouldShow) hasAnyVisible = true;
    });

    appsettings.categories.forEach(category => {
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

function updateTypeModsQueryParam(type) {
    const url = new URL(window.location);

    if (type === MEMORY_TYPE) {
        if (typeMods[type]) {
            url.searchParams.set(type, 'true');
        } else {
            url.searchParams.delete(type);
        }
    }
    else {
        if (typeMods[type]) {
            url.searchParams.set(TYPE_MODS_QUERY_PARAMETER, type);
        } else {
            url.searchParams.delete(TYPE_MODS_QUERY_PARAMETER);
        }
    }

    window.history.replaceState(null, '', url);
}

function renderFooterLinks() {
    const container = document.getElementById('footer-links');

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