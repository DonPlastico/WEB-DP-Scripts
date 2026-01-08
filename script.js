/* ==========================================================================
   1. DATOS Y CONFIGURACIÓN GLOBAL
   ========================================================================== */

// Datos simulados para el Widget de "Últimas Compras" (Mix Scripts + Packs)
const recentPaymentsData = [
    { user: "xX_Kiler_Xx", script: "UI ESSENTIALS", price: "3.99€", avatar: "Felix" }, // Pack
    { user: "RoleplayKing", script: "DP-Nitrous", price: "9.95€", avatar: "Aneka" },
    { user: "Sarah_Dev", script: "DP-Hud", price: "17.99€", avatar: "Jocelyn" },
    { user: "Don_Gato", script: "DP-Garages", price: "34.99€", avatar: "Leo" },
    { user: "FiveM_Master", script: "MECHANIC SUITE", price: "54.99€", avatar: "Jack" }, // Pack
    { user: "PoliceChief", script: "DP-Menu + Input", price: "14.95€", avatar: "Avery" },
    { user: "Medic_Girl", script: "IDENTITY PACK", price: "29.99€", avatar: "Maria" }, // Pack
    { user: "Gangster01", script: "DP-Boombox", price: "44.99€", avatar: "Brian" },
    { user: "Mechanic_Joe", script: "DP-Fuel V2", price: "24.95€", avatar: "Christopher" },
    { user: "DJ_Mike", script: "STREET KING", price: "89.99€", avatar: "Caleb" }, // Pack
    { user: "Banker_RP", script: "DP-Banking", price: "29.99€", avatar: "Sawyer" },
    { user: "Trucker_88", script: "DP-TextUI", price: "4.99€", avatar: "Nala" },
    { user: "Fashion_Dva", script: "DP-Clothing", price: "18.99€", avatar: "Valentina" },
    { user: "Admin_God", script: "ULTIMATE COLLECTION", price: "99.99€", avatar: "Alexander" }, // Pack
    { user: "Emote_Lover", script: "DP-Animations", price: "16.99€", avatar: "Willow" },
    { user: "Hacker_Neo", script: "DP-AntiBackdoor", price: "50.00€", avatar: "Ryker" },
    { user: "Newbie_Player", script: "VISUAL OVERHAUL", price: "29.95€", avatar: "Easton" } // Pack
];

// Tasas de cambio aproximadas (Base: 1 EUR)
// Si quieres actualizar precios reales, modifica estos números.
const exchangeRates = {
    EUR: 1.00,
    GBP: 0.86,  // Libra Esterlina
    USD: 1.08,  // Dólar Americano
    PLN: 4.32,  // Zloty Polaco
    RUB: 98.50, // Rublo Ruso
    SEK: 11.20, // Corona Sueca
    DKK: 7.46,  // Corona Danesa
    CZK: 25.30, // Corona Checa
    HUF: 395.00,// Forinto Húngaro
    TRY: 34.50, // Lira Turca
    JPY: 163.00,// Yen Japonés
    KRW: 1450.00 // Won Coreano
};

// Mapa que asocia cada código de idioma con su moneda oficial
const currencyMap = {
    'es': 'EUR', 'fr': 'EUR', 'de': 'EUR', 'it': 'EUR', 'pt': 'EUR',
    'nl': 'EUR', 'fi': 'EUR', 'en': 'GBP', 'pl': 'PLN', 'ru': 'RUB',
    'sv': 'SEK', 'da': 'DKK', 'cs': 'CZK', 'hu': 'HUF', 'tr': 'TRY',
    'ja': 'JPY', 'ko': 'KRW'
};

// Variables de estado global
let translations = {}; // Aquí se cargarán los textos del locales.json
let cart = JSON.parse(localStorage.getItem('dp_cart')) || []; // Cargar carrito guardado o iniciar vacío

/* ==========================================================================
   2. SISTEMA DE TRADUCCIÓN Y MONEDA
   Carga textos, cambia el idioma y recalcula precios.
   ========================================================================== */

/**
 * Carga el archivo JSON de traducciones.
 * Se ejecuta al iniciar la página.
 */
async function loadTranslationsData() {
    try {
        const response = await fetch('./locales.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        translations = await response.json();

        // Una vez cargado, aplicamos el idioma guardado (o 'es' por defecto)
        const savedLang = localStorage.getItem('dp_store_lang') || 'es';
        changeLanguage(savedLang);

    } catch (e) {
        console.error("Error al cargar locales.json:", e);
    }
}

/**
 * Función Principal: Cambia todo el sitio al idioma seleccionado.
 * @param {string} lang - Código del idioma (ej: 'es', 'en')
 */
function changeLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) lang = 'es';

    localStorage.setItem('dp_store_lang', lang);

    // 1. Actualizar indicador en barra
    const langText = document.getElementById('current-lang-text');
    if (langText) langText.textContent = lang.toUpperCase();

    // 2. Actualizar textos normales (data-i18n)
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // 3. NUEVO: Actualizar Placeholders (Buscadores)
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // 4. Marcar activo en la lista
    const allLangs = document.querySelectorAll('#lang-dropdown li');
    allLangs.forEach(li => li.classList.remove('active-lang'));
    const activeItem = document.querySelector(`#lang-dropdown li[data-lang="${lang}"]`);
    if (activeItem) activeItem.classList.add('active-lang');

    // 5. Actualizar UI global
    updatePrices(lang);
    updateCartUI();

    // 6. NUEVO: Re-renderizar los paquetes para traducir sus botones
    if (document.getElementById('view-packages').style.display === 'block') {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        renderPackages(currentFilter);
    }

    const footerLang = document.getElementById('footer-lang-code');
    if (footerLang) footerLang.textContent = lang.toUpperCase() + ".";

    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) dropdown.classList.remove('active');

    renderPayments(false);
}

/**
 * Recalcula los precios mostrados en el grid de productos.
 * Usa 'Intl.NumberFormat' para poner el símbolo de moneda correcto (£, €, ¥).
 */
function updatePrices(lang) {
    const currency = currencyMap[lang] || 'EUR';
    const rate = exchangeRates[currency] || 1;

    const priceElements = document.querySelectorAll('.price');

    priceElements.forEach(el => {
        // Obtenemos el precio base en EUR desde el HTML
        const basePrice = parseFloat(el.getAttribute('data-base-price'));

        if (!isNaN(basePrice)) {
            const newPrice = basePrice * rate;
            el.textContent = new Intl.NumberFormat(lang, {
                style: 'currency',
                currency: currency
            }).format(newPrice);
        }
    });
}

// Alternar visualización del menú de idiomas
function toggleLangDropdown() {
    const dropdown = document.getElementById('lang-dropdown');
    const cartDropdown = document.getElementById('cart-dropdown');

    if (cartDropdown) cartDropdown.classList.remove('active'); // Cerrar carrito si está abierto
    if (dropdown) dropdown.classList.toggle('active');
}

/* ==========================================================================
   3. SISTEMA DE CARRITO DE COMPRAS (SHOPPING CART)
   Lógica para añadir, borrar, cupones y guardar productos.
   ========================================================================== */

// Variable normal. Al recargar (F5) vuelve a 0 automáticamente.
let appliedDiscount = 0;

// Alternar visualización del panel del carrito
function toggleCartDropdown() {
    const dropdown = document.getElementById('cart-dropdown');
    const langDropdown = document.getElementById('lang-dropdown');
    if (langDropdown) langDropdown.classList.remove('active');
    if (dropdown) dropdown.classList.toggle('active');
}

/**
 * Añade un producto al carrito (CON VALIDACIÓN DE DUPLICADOS)
 */
function addToCart(btn) {
    const productId = btn.getAttribute('data-id');

    // 1. COMPROBAR SI YA EXISTE
    const exists = cart.find(item => item.id === productId);

    if (exists) {
        // Feedback visual de ERROR (Rojo/Temblor)
        const originalText = btn.innerHTML;
        const originalBg = btn.style.background;

        btn.innerHTML = '<i class="fas fa-times"></i> YA AÑADIDO';
        btn.style.background = '#ff4757'; // Rojo
        btn.style.color = 'white';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBg;
            btn.style.color = '';
        }, 1500);
        return; // Detenemos la función, no añade nada.
    }

    // 2. SI NO EXISTE, LO AÑADIMOS
    const product = {
        id: productId,
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-base-price')),
        img: btn.getAttribute('data-img'),
        descKey: btn.getAttribute('data-desc')
    };

    cart.push(product);
    saveCart();
    updateCartUI();

    // Feedback visual de ÉXITO (Verde)
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> AÑADIDO';
    btn.style.background = '#2ecc71';
    btn.style.color = '#fff';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 1000);

    const dropdown = document.getElementById('cart-dropdown');
    if (dropdown) dropdown.classList.add('active');
}

// Eliminar un producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// Aplicar Cupón de Descuento
function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const msg = document.getElementById('coupon-message');
    const code = input.value.toUpperCase().trim();

    // LÓGICA DE CUPONES
    if (code === 'DP30') {
        appliedDiscount = 0.30; // 30%
        msg.textContent = '¡Código DP30 aplicado! (30% De descuento)';
        msg.className = 'coupon-msg success';
        updateCartUI();
    } else if (code === 'ASHKBDAWKD') {
        appliedDiscount = 0.64; // 64%
        msg.textContent = '¡Código secreto aplicado! (64% De descuento)';
        msg.className = 'coupon-msg success';
        updateCartUI();
    } else if (code === '') {
        msg.textContent = '';
    } else {
        appliedDiscount = 0;
        msg.textContent = 'Código inválido o expirado.';
        msg.className = 'coupon-msg error';
        updateCartUI();
    }
}

// Guardar en LocalStorage
function saveCart() {
    localStorage.setItem('dp_cart', JSON.stringify(cart));
}

/**
 * Renderiza el HTML del carrito y CALCULA TOTALES
 */
function updateCartUI() {
    // Elementos DOM
    const countElement = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total-price');
    const discountRow = document.getElementById('discount-row');
    const discountPriceElement = document.getElementById('cart-discount');
    const discountPercentElement = document.getElementById('discount-percent');

    // Actualizar contador
    if (countElement) countElement.textContent = `(${cart.length})`;

    if (!container) return;

    container.innerHTML = '';

    // Variables para cálculo matemático (EN EUROS SIEMPRE)
    let subtotalEUR = 0;

    // Configuración Moneda
    const currentLang = localStorage.getItem('dp_store_lang') || 'es';
    const targetCurrency = currencyMap[currentLang] || 'EUR';
    const rate = exchangeRates[targetCurrency] || 1;

    // Formateador de moneda
    const formatter = new Intl.NumberFormat(currentLang, {
        style: 'currency', currency: targetCurrency
    });

    // LÓGICA DE CARRITO VACÍO
    if (cart.length === 0) {
        let emptyText = "Tu carrito está vacío.";
        if (translations[currentLang] && translations[currentLang]['cart_empty']) {
            emptyText = translations[currentLang]['cart_empty'];
        }
        container.innerHTML = `<div class="empty-cart-msg">${emptyText}</div>`;

        // Si vacías el carrito, adiós descuento.
        subtotalEUR = 0;
        appliedDiscount = 0;
        const input = document.getElementById('coupon-input');
        if (input) input.value = ''; // Limpiar input
        const msg = document.getElementById('coupon-message');
        if (msg) msg.textContent = ''; // Limpiar mensaje

    } else {
        cart.forEach((item, index) => {
            subtotalEUR += item.price; // Sumar precio base

            // Traducción descripción
            let desc = item.descKey;
            let lookupKey = item.descKey ? item.descKey.toLowerCase() : '';
            if (translations[currentLang] && translations[currentLang][lookupKey]) {
                desc = translations[currentLang][lookupKey];
            }

            const displayPrice = formatter.format(item.price * rate);

            const html = `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-desc">${desc}</div>
                        <div class="cart-item-price">${displayPrice}</div>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.innerHTML += html;
        });
    }

    // --- CÁLCULOS FINALES ---
    let discountAmountEUR = subtotalEUR * appliedDiscount;
    let totalEUR = subtotalEUR - discountAmountEUR;

    // --- RENDERIZADO ---
    if (countElement) countElement.textContent = `(${cart.length})`;
    if (subtotalElement) subtotalElement.textContent = formatter.format(subtotalEUR * rate);
    if (totalElement) totalElement.textContent = formatter.format(totalEUR * rate);

    // Mostrar/Ocultar fila de descuento
    if (appliedDiscount > 0 && cart.length > 0) {
        discountRow.style.display = 'flex';
        discountPercentElement.textContent = (appliedDiscount * 100) + '%';
        discountPriceElement.textContent = '-' + formatter.format(discountAmountEUR * rate);

    } else {
        discountRow.style.display = 'none';
    }
}

/* ==========================================================================
   4. WIDGET DE PAGOS RECIENTES
   Renderiza la lista de últimas compras en el Hero.
   ========================================================================== */

function renderPayments(showAll = false) {
    const listContainer = document.getElementById('payments-list-content');
    const viewBtn = document.getElementById('view-all-payments');

    if (!listContainer) return;

    const currentLang = localStorage.getItem('dp_store_lang') || 'es';
    let boughtText = 'Compró';

    // Traducir la palabra "Compró"
    if (translations[currentLang] && translations[currentLang]['txt_bought']) {
        boughtText = translations[currentLang]['txt_bought'];
    }

    listContainer.innerHTML = '';

    // Mostrar 4 items por defecto, o todos si se pide
    const limit = showAll ? recentPaymentsData.length : 4;
    const dataToShow = recentPaymentsData.slice(0, limit);

    dataToShow.forEach(item => {
        const html = `
            <div class="payment-item fade-in">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${item.avatar}" class="avatar" alt="User">
                <div class="pay-info">
                    <span class="pay-user">${item.user}</span>
                    <span class="pay-detail">${boughtText} <strong>${item.script}</strong></span>
                </div>
                <span class="pay-price">${item.price}</span>
            </div>
        `;
        listContainer.innerHTML += html;
    });

    // Controlar botón "Ver Todos"
    if (viewBtn) {
        if (showAll) {
            viewBtn.innerHTML = 'VER MENOS <i class="fas fa-chevron-up"></i>';
            viewBtn.onclick = () => renderPayments(false);
            listContainer.classList.add('scrollable');
        } else {
            viewBtn.innerHTML = `VER TODOS (${recentPaymentsData.length}) <i class="fas fa-chevron-down"></i>`;
            viewBtn.onclick = () => renderPayments(true);
            listContainer.classList.remove('scrollable');
        }
    }
}

/* ==========================================================================
   5. SISTEMA DE LOGIN Y EVENTOS GLOBALES
   Manejo de clics, modales y sesión de usuario simulada.
   ========================================================================== */

// Evento Global: Cerrar menús al hacer click fuera de ellos
document.addEventListener('click', (e) => {
    // 1. Dropdown Idioma
    const langDropdown = document.getElementById('lang-dropdown');
    const langTrigger = document.querySelector('.lang-selector');
    if (langDropdown && langTrigger && !langDropdown.contains(e.target) && !langTrigger.contains(e.target)) {
        langDropdown.classList.remove('active');
    }

    // 2. Dropdown Carrito
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartTrigger = document.querySelector('.cart-selector');

    // Ignoramos si el click fue en botones de eliminar o añadir (para no cerrar el carrito al usarlo)
    if (cartDropdown && cartTrigger &&
        !cartDropdown.contains(e.target) &&
        !cartTrigger.contains(e.target) &&
        !e.target.closest('.remove-item-btn') &&
        !e.target.closest('.add-cart-btn')) {

        cartDropdown.classList.remove('active');
    }
});

// Botón de Login (Abrir Modal)
const loginBtn = document.querySelector('.login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Si ya está logueado, cerrar sesión. Si no, abrir modal.
        if (localStorage.getItem('dp_user_logged') === 'true') {
            logoutUser();
        } else {
            document.getElementById('login-modal').classList.add('active');
        }
    });
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

// Simular proceso de login (Delay artificial)
function simulateLogin(provider) {
    const modalBody = document.querySelector('.modal-body');
    const originalContent = modalBody.innerHTML;

    // Mostrar spinner de carga
    modalBody.innerHTML = `<div style="padding:40px; color:white;"><i class="fas fa-circle-notch fa-spin fa-2x" style="color:var(--accent-primary)"></i><p style="margin-top:15px">Conectando con ${provider}...</p></div>`;

    setTimeout(() => {
        // Datos de usuario simulados
        const userData = {
            name: 'DonPlastico',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DonPlastico',
            provider: provider
        };

        // Guardar sesión
        localStorage.setItem('dp_user_logged', 'true');
        localStorage.setItem('dp_user_data', JSON.stringify(userData));

        closeLoginModal();

        // Restaurar modal por si se abre de nuevo
        setTimeout(() => modalBody.innerHTML = originalContent, 500);

        // Actualizar interfaz
        checkLoginState();
    }, 1500);
}

// Verificar si hay usuario logueado al cargar
function checkLoginState() {
    const isLogged = localStorage.getItem('dp_user_logged');
    const loginContainer = document.querySelector('.nav-right .login-btn');

    if (isLogged === 'true' && loginContainer) {
        const userData = JSON.parse(localStorage.getItem('dp_user_data'));

        // Reemplazar botón de "Acceder" por perfil de usuario
        loginContainer.outerHTML = `
            <div class="user-profile-nav" onclick="logoutUser()">
                <img src="${userData.avatar}" class="nav-avatar">
                <span class="nav-username">${userData.name}</span>
                <i class="fas fa-sign-out-alt" style="font-size:0.7rem; color:#ff4757; margin-left:5px;"></i>
            </div>
        `;
    }
}

// Cerrar sesión
function logoutUser() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.removeItem('dp_user_logged');
        localStorage.removeItem('dp_user_data');
        location.reload(); // Recargar para limpiar estado
    }
}

/* ==========================================================================
   6. INICIALIZACIÓN (MAIN)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadTranslationsData(); // Cargar textos y aplicar idioma guardado
    checkLoginState();      // Verificar si el usuario ya hizo login
    updateCartUI();         // Renderizar el carrito guardado
});

/* ==========================================================================
   7. LÓGICA DE VISTAS (SPA) Y PAQUETES
   ========================================================================== */

// 1. Cambiar entre Inicio y Paquetes
function switchView(viewName) {
    // 1. Ocultar TODAS las vistas
    document.getElementById('view-home').style.display = 'none';
    document.getElementById('view-packages').style.display = 'none';
    document.getElementById('view-scripts').style.display = 'none'; // <-- NUEVO

    // 2. Quitar clase active de TODOS los links
    const navLinks = document.querySelectorAll('.nav-center a');
    navLinks.forEach(link => link.classList.remove('active'));

    // 3. Mostrar la elegida
    if (viewName === 'home') {
        document.getElementById('view-home').style.display = 'block';
        navLinks[0].classList.add('active');
    } else if (viewName === 'packages') {
        document.getElementById('view-packages').style.display = 'block';
        navLinks[1].classList.add('active');
        renderPackages();
    } else if (viewName === 'scripts') { // <-- NUEVO CASO
        document.getElementById('view-scripts').style.display = 'block';
        navLinks[2].classList.add('active'); // Asumiendo que SCRIPTS es el 3er link
        renderScripts(); // Renderizar al entrar
    }
}

// 2. Datos de Paquetes (10 Packs con LISTA DE CONTENIDO)
const packagesData = [
    {
        id: "pkg-ui-starter",
        name: "UI ESSENTIALS",
        img: "Images/Scripts/DP-Notify.png",
        tags: ["Standalone", "Starter"],
        oldPrice: 4.99,
        price: 3.99,
        descKey: "desc_pkg_ui_starter",
        includes: ["DP-TextUI", "DP-Notify"] // <--- LISTA AÑADIDA
    },
    {
        id: "pkg-speed-hud",
        name: "SPEED & CONTROL",
        img: "Images/Scripts/DP-Hud.png",
        tags: ["QBCore", "Racing"],
        oldPrice: 27.94,
        price: 22.95,
        descKey: "desc_pkg_speed_hud",
        includes: ["DP-Hud", "DP-Nitrous"]
    },
    {
        id: "pkg-garage-pro",
        name: "MECHANIC SUITE",
        img: "Images/Scripts/DP-Garages.png",
        tags: ["QBCore", "Escrow"],
        oldPrice: 67.93,
        price: 54.99,
        descKey: "desc_pkg_garage_pro",
        includes: ["DP-Garages", "DP-Fuel V2", "DP-Extras"]
    },
    {
        id: "pkg-character",
        name: "IDENTITY PACK",
        img: "Images/Scripts/qb-clothing-redesign.png",
        tags: ["QBCore", "Roleplay"],
        oldPrice: 35.98,
        price: 29.99,
        descKey: "desc_pkg_character",
        includes: ["DP-Animations", "DP-Clothing", "DP-Tattoos V1"]
    },
    {
        id: "pkg-visual",
        name: "VISUAL OVERHAUL",
        img: "Images/Scripts/DP-LoadingScreen.png",
        tags: ["Standalone", "QBCore", "UI"],
        oldPrice: 39.93,
        price: 29.95,
        descKey: "desc_pkg_visual_overhaul",
        includes: ["DP-LoadingScreen", "DP-Menu + Input", "DP-TextUI"]
    },
    {
        id: "pkg-social",
        name: "LIFE & FUN",
        img: "Images/Scripts/DP-PetsShop.png",
        tags: ["Roleplay", "Standalone"],
        oldPrice: 77.93,
        price: 59.99,
        descKey: "desc_pkg_social",
        includes: ["DP-PetsShop", "DP-Boombox", "DP-PedsSystem"]
    },
    {
        id: "pkg-server-core",
        name: "SERVER CORE",
        img: "Images/Scripts/DP-Banking.png",
        tags: ["QBCore", "Essentials"],
        oldPrice: 49.93,
        price: 39.95,
        descKey: "desc_pkg_server_core",
        includes: ["DP-Banking", "DP-Menu + Input", "DP-Notify"]
    },
    {
        id: "pkg-police",
        name: "EMERGENCY PACK",
        img: "Images/Scripts/DP-Extras.png",
        tags: ["QBCore", "Jobs"],
        oldPrice: 40.93,
        price: 32.50,
        descKey: "desc_pkg_police_ems",
        includes: ["DP-Extras", "DP-Hud", "DP-Menu + Input"]
    },
    {
        id: "pkg-street",
        name: "STREET KING",
        img: "Images/Scripts/DP-Boombox.png",
        tags: ["QBCore", "Street"],
        oldPrice: 114.92,
        price: 89.99,
        descKey: "desc_pkg_street_king",
        includes: ["DP-Garages", "DP-Nitrous", "DP-Fuel V2", "DP-Boombox"]
    },
    {
        id: "pkg-ultimate",
        name: "ULTIMATE COLLECTION",
        img: "Images/Scripts/DP-CivNets Roleplay.png",
        tags: ["All In One", "Premium"],
        oldPrice: 142.91,
        price: 99.99,
        descKey: "desc_pkg_ultimate",
        includes: ["DP-Garages", "DP-Banking", "DP-Hud", "DP-Menu", "DP-Fuel V2"]
    }
];

// 3. Renderizar Paquetes (CON LISTA DE CONTENIDO)
function renderPackages(filter = 'all') {
    const container = document.getElementById('packages-list');
    if (!container) return;

    container.innerHTML = '';

    const currentLang = localStorage.getItem('dp_store_lang') || 'es';
    const currency = currencyMap[currentLang] || 'EUR';
    const rate = exchangeRates[currency] || 1;
    const formatter = new Intl.NumberFormat(currentLang, { style: 'currency', currency: currency });

    // Texto botón
    let btnText = "ADD TO BASKET";
    if (translations[currentLang] && translations[currentLang]['btn_add_basket']) {
        btnText = translations[currentLang]['btn_add_basket'];
    }

    // Texto "Incluye:"
    let includesText = "INCLUDES:";
    if (translations[currentLang] && translations[currentLang]['txt_includes']) {
        includesText = translations[currentLang]['txt_includes'];
    }

    const filteredData = filter === 'all'
        ? packagesData
        : packagesData.filter(pkg => pkg.tags.some(tag => tag.toLowerCase() === filter.toLowerCase()));

    filteredData.forEach(pkg => {
        const tagsHtml = pkg.tags.map(tag => `<span class="pkg-tag">${tag}</span>`).join('');
        const displayPrice = formatter.format(pkg.price * rate);
        const displayOldPrice = formatter.format(pkg.oldPrice * rate);

        // Traducción descripción
        let descText = pkg.descKey;
        if (translations[currentLang] && translations[currentLang][pkg.descKey]) {
            descText = translations[currentLang][pkg.descKey];
        }

        // GENERAR HTML DE LA LISTA DE SCRIPTS
        let includesListHtml = '';
        if (pkg.includes && pkg.includes.length > 0) {
            includesListHtml = `<div class="pkg-includes-section">
                                    <span class="includes-title">${includesText}</span>
                                    <div class="includes-grid">`;
            pkg.includes.forEach(item => {
                includesListHtml += `<div class="include-item"><i class="fas fa-check"></i> ${item}</div>`;
            });
            includesListHtml += `   </div>
                                 </div>`;
        }

        const html = `
            <div class="pkg-card fade-in">
                <div class="pkg-img-container">
                    <img src="${pkg.img}" alt="${pkg.name}">
                    <div class="pkg-tags">${tagsHtml}</div>
                </div>
                <div class="pkg-info">
                    <h3 class="pkg-title">${pkg.name}</h3>
                    
                    <p class="pkg-desc">${descText}</p>
                    
                    ${includesListHtml}

                    <div class="pkg-price-row">
                        <span class="pkg-old-price">${displayOldPrice}</span>
                        <span class="pkg-new-price">${displayPrice}</span>
                    </div>
                    <button class="pkg-btn" 
                        data-id="${pkg.id}"
                        data-name="${pkg.name}"
                        data-base-price="${pkg.price}"
                        data-img="${pkg.img}"
                        data-desc="${pkg.descKey}"
                        onclick="addToCart(this)">
                        <i class="fas fa-shopping-basket"></i> ${btnText} 
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// 4. Listeners para filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Quitar active de todos
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // Poner active al actual
        btn.classList.add('active');
        // Renderizar con el filtro
        renderPackages(btn.getAttribute('data-filter'));
    });
});

// 5. Buscador simple
function filterPackages() {
    const query = document.getElementById('pkg-search').value.toLowerCase();
    const allCards = document.querySelectorAll('.pkg-card');

    allCards.forEach(card => {
        const title = card.querySelector('.pkg-title').textContent.toLowerCase();
        if (title.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================================================
   8. LÓGICA DE VISTA SCRIPTS (19 ITEMS)
   ========================================================================== */

// 1. Base de datos de Scripts (18 Items) - PRECIOS ACTUALIZADOS
const scriptsData = [
    {
        id: "dp-textui",
        name: "DP-TextUI",
        price: 4.99, // Ajustado .99
        img: "Images/Scripts/DP-TextUI.png",
        tags: ["ESX", "QBCore", "Standalone"],
        descKey: "desc_textui"
    },
    {
        id: "dp-nitro",
        name: "DP-Nitrous",
        price: 9.95, // Subido por complejidad lógica
        img: "Images/Scripts/DP-Nitrous.png",
        tags: ["QBCore"],
        descKey: "desc_nitrous"
    },
    {
        id: "dp-hud",
        name: "DP-Hud",
        price: 17.99, // Subido por diseño y reescrituras
        img: "Images/Scripts/DP-Hud.png",
        tags: ["QBCore"],
        descKey: "desc_hud"
    },
    {
        id: "dp-garage",
        name: "DP-Garages",
        price: 34.99, // 7.000 líneas de código merecen este precio
        img: "Images/Scripts/DP-Garages.png",
        tags: ["QBCore"],
        descKey: "desc_garages"
    },
    {
        id: "dp-load",
        name: "DP-LoadingScreen",
        price: 9.99, // Ajustado a la realidad (sencillo)
        img: "Images/Scripts/DP-LoadingScreen.png",
        tags: ["Standalone"],
        descKey: "desc_loadingscreen"
    },
    {
        id: "dp-menu",
        name: "DP-Menu + Input",
        price: 14.95, // Pack de 2 scripts esenciales
        img: "Images/Scripts/DP-Menu-DP-Input.png",
        tags: ["QBCore"],
        descKey: "desc_menu"
    },
    {
        id: "dp-pets",
        name: "DP-PetsShop",
        price: 19.99, // Sistema completo con NUI
        img: "Images/Scripts/DP-PetsShop.png",
        tags: ["Standalone"],
        descKey: "desc_petsshop"
    },
    {
        id: "dp-peds",
        name: "DP-PedsSystem",
        price: 12.95,
        img: "Images/Scripts/DP-PedsSystem.png",
        tags: ["QBCore"],
        descKey: "desc_peds"
    },
    {
        id: "dp-extras",
        name: "DP-Extras",
        price: 7.99,
        img: "Images/Scripts/DP-Extras.png",
        tags: ["QBCore"],
        descKey: "desc_extras"
    },
    {
        id: "dp-boom",
        name: "DP-Boombox",
        price: 44.99, // La joya de la corona (17k líneas)
        img: "Images/Scripts/DP-Boombox.png",
        tags: ["Standalone"],
        descKey: "desc_boombox"
    },
    {
        id: "dp-bank",
        name: "DP-Banking",
        price: 29.99, // Sistema bancario complejo (7k líneas totales)
        img: "Images/Scripts/DP-Banking.png",
        tags: ["QBCore"],
        descKey: "desc_banking"
    },
    {
        id: "dp-skate",
        name: "DP-StreetBoard",
        price: 12.95,
        img: "Images/Scripts/DP-StreetBoard.png",
        tags: ["QBCore"],
        descKey: "desc_skate"
    },
    {
        id: "dp-escaparate",
        name: "DP-PdmEscaparates",
        price: 0.00,
        img: "Images/Scripts/DP-PdmEscaparates.png",
        tags: ["QBCore", "Free"],
        descKey: "desc_escaparate"
    },
    {
        id: "dp-mileage",
        name: "DP-VehicleMileage",
        price: 6.22,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["QBCore"],
        descKey: "desc_mileage"
    },
    {
        id: "dp-fuelv1",
        name: "DP-Fuel V1",
        price: 0.00,
        img: "Images/Scripts/DP-Fuel-V1.png",
        tags: ["QBCore", "Free"],
        descKey: "desc_fuelv1"
    },
    {
        id: "dp-fuelv2",
        name: "DP-Fuel V2",
        price: 24.95, // Rediseño completo + Escrow
        img: "Images/Scripts/DP-Fuel-V2.png",
        tags: ["QBCore", "Escrow"],
        descKey: "desc_fuelv2"
    },
    {
        id: "dp-cloth",
        name: "DP-Clothing",
        price: 18.99, // Gran cantidad de líneas CSS/JS
        img: "Images/Scripts/qb-clothing-redesign.png",
        tags: ["QBCore"],
        descKey: "desc_clothing"
    },
    {
        id: "dp-notify",
        name: "DP-Notify",
        price: 0.00,
        img: "Images/Scripts/DP-Notify.png",
        tags: ["Standalone", "Free"],
        descKey: "desc_notify"
    },
    {
        id: "dp-anim",
        name: "DP-Animations",
        price: 16.99, // Base de datos inmensa (50k líneas)
        img: "Images/Scripts/DP-Animations.png",
        tags: ["QBCore"],
        descKey: "desc_animations"
    },
    {
        id: "dp-realmoney",
        name: "DP-RealMoney",
        price: 1.99,
        img: "Images/Scripts/DP-RealMoney.png",
        tags: ["QBCore"],
        descKey: "desc_realmoney"
    },
    {
        id: "dp-quests",
        name: "DP-Quests",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_quests"
    },
    {
        id: "dp-tattoos",
        name: "DP-Tattoos V1",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_tattoos"
    },
    {
        id: "dp-vehicleshop",
        name: "DP-VehicleShop",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_vehicleshop"
    },
    {
        id: "dp-pausemenu",
        name: "DP-PauseMenu",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_pausemenu"
    },
    {
        id: "dp-admin",
        name: "DP-Admin",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_admin"
    },
    {
        id: "dp-Racing",
        name: "DP-Racing",
        price: 0.00,
        img: "Images/Scripts/proximamente.jpg",
        tags: ["Proximamente"],
        descKey: "desc_Racing"
    }
];

// 2. Renderizar Scripts
function renderScripts(filter = 'all') {
    const container = document.getElementById('scripts-list');
    if (!container) return;

    container.innerHTML = '';

    // Configuración Moneda
    const currentLang = localStorage.getItem('dp_store_lang') || 'es';
    const currency = currencyMap[currentLang] || 'EUR';
    const rate = exchangeRates[currency] || 1;
    const formatter = new Intl.NumberFormat(currentLang, { style: 'currency', currency: currency });

    // Texto Botón
    let btnText = "ADD TO BASKET";
    if (translations[currentLang] && translations[currentLang]['btn_add_basket']) {
        btnText = translations[currentLang]['btn_add_basket'];
    }

    // Filtrado
    const filteredData = filter === 'all'
        ? scriptsData
        : scriptsData.filter(item => item.tags.some(tag => tag.toLowerCase() === filter.toLowerCase()));

    filteredData.forEach(item => {
        // Generar tags HTML
        const tagsHtml = item.tags.map(tag => `<span class="pkg-tag">${tag}</span>`).join('');

        // Precio (Si es 0, poner GRATIS/FREE)
        let displayPrice = formatter.format(item.price * rate);
        if (item.price === 0) displayPrice = "FREE";

        // Precio tachado falso (un 20% más) para efecto visual
        const oldPriceVal = item.price * 1.2;
        const displayOldPrice = item.price > 0 ? formatter.format(oldPriceVal * rate) : "";

        const html = `
            <div class="pkg-card fade-in">
                <div class="pkg-img-container">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="pkg-tags">${tagsHtml}</div>
                </div>
                <div class="pkg-info">
                    <h3 class="pkg-title">${item.name}</h3>
                    <div class="pkg-price-row">
                        ${item.price > 0 ? `<span class="pkg-old-price">${displayOldPrice}</span>` : ''}
                        <span class="pkg-new-price">${displayPrice}</span>
                    </div>
                    <button class="pkg-btn" 
                        data-id="${item.id}"
                        data-name="${item.name}"
                        data-base-price="${item.price}"
                        data-img="${item.img}"
                        data-desc="${item.desc}"
                        onclick="addToCart(this)">
                        <i class="fas fa-shopping-basket"></i> ${btnText}
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// 3. Listeners Filtros Scripts
document.querySelectorAll('.script-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.script-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderScripts(btn.getAttribute('data-filter'));
    });
});

// 4. Buscador Scripts
function filterScripts() {
    const query = document.getElementById('script-search').value.toLowerCase();
    // Buscamos solo dentro de #scripts-list
    const allCards = document.querySelectorAll('#scripts-list .pkg-card');

    allCards.forEach(card => {
        const title = card.querySelector('.pkg-title').textContent.toLowerCase();
        if (title.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}