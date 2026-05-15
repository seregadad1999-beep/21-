// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();          // Растянуть на всё окно
    tg.ready();           // Приложение готово
    tg.enableClosingConfirmation?.(); // Подтверждение при закрытии
}

// --- Игровые переменные ---
let coins = 0;
let clickLevel = 0;       // Уровень улучшения клика (0 = базовый)
let passiveLevel = 0;     // Уровень пассивного дохода
let clickPower = 1;       // Монет за клик (1 + clickLevel)
let passivePerTick = 0;   // Монет за тик (пассивный доход каждые 10 сек)

let passiveInterval = null; // Интервал пассивного дохода

// DOM элементы
const coinAmountSpan = document.getElementById('coinAmount');
const clickPowerSpan = document.getElementById('clickPower');
const passiveIncomeSpan = document.getElementById('passiveIncome');
const clickLevelSpan = document.getElementById('clickLevel');
const passiveLevelSpan = document.getElementById('passiveLevel');
const clickPriceSpan = document.getElementById('clickPrice');
const passivePriceSpan = document.getElementById('passivePrice');

const clickArea = document.getElementById('clickArea');
const buyClickBtn = document.getElementById('buyClickUpgrade');
const buyPassiveBtn = document.getElementById('buyPassiveUpgrade');

// --- Функции расчета цен (экспоненциальный рост) ---
function getClickUpgradePrice(level) {
    return Math.floor(10 * Math.pow(1.5, level));
}

function getPassiveUpgradePrice(level) {
    return Math.floor(50 * Math.pow(1.5, level));
}

// --- Пересчёт производных характеристик ---
function recalcStats() {
    clickPower = 1 + clickLevel;
    passivePerTick = passiveLevel;
}

// --- Обновление интерфейса ---
function updateUI() {
    // Основные значения
    coinAmountSpan.innerText = Math.floor(coins);
    clickPowerSpan.innerText = clickPower;
    passiveIncomeSpan.innerText = passivePerTick;
    clickLevelSpan.innerText = clickLevel;
    passiveLevelSpan.innerText = passiveLevel;
    
    // Цены в магазине
    clickPriceSpan.innerText = getClickUpgradePrice(clickLevel);
    passivePriceSpan.innerText = getPassiveUpgradePrice(passiveLevel);
}

// --- Сохранение в localStorage ---
function saveGame() {
    const gameState = {
        coins: coins,
        clickLevel: clickLevel,
        passiveLevel: passiveLevel
    };
    localStorage.setItem('hamsterClicker', JSON.stringify(gameState));
}

// --- Загрузка из localStorage ---
function loadGame() {
    const saved = localStorage.getItem('hamsterClicker');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            coins = state.coins ?? 0;
            clickLevel = state.clickLevel ?? 0;
            passiveLevel = state.passiveLevel ?? 0;
        } catch(e) {
            console.warn('Ошибка загрузки сохранения');
        }
    } else {
        // Стартовые значения: 0 монет, без улучшений
        coins = 0;
        clickLevel = 0;
        passiveLevel = 0;
    }
    recalcStats();
    updateUI();
}

// --- Пассивный доход (вызывается каждые 10 секунд) ---
function addPassiveIncome() {
    if (passivePerTick > 0) {
        coins += passivePerTick;
        saveGame();
        updateUI();
        // Лёгкая вибрация при получении пассивного дохода (если разрешено)
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
}

// --- Запуск интервала пассивного дохода (один раз при загрузке)---
function startPassiveIncomeInterval() {
    if (passiveInterval) clearInterval(passiveInterval);
    passiveInterval = setInterval(() => {
        addPassiveIncome();
    }, 10000); // 10 секунд
}

// --- Вибрация (Telegram или fallback)---
function vibrate() {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    } else if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// --- Обработчик клика по хомяку ---
function onHamsterClick() {
    coins += clickPower;
    saveGame();
    updateUI();
    vibrate();
    
    // Небольшая анимация нажатия через CSS уже есть, но добавим визуальный эффект
    clickArea.style.transform = 'scale(0.94)';
    setTimeout(() => {
        clickArea.style.transform = '';
    }, 100);
}

// --- Покупка улучшения клика ---
function buyClickUpgrade() {
    const price = getClickUpgradePrice(clickLevel);
    if (coins >= price) {
        coins -= price;
        clickLevel++;
        recalcStats();
        saveGame();
        updateUI();
        vibrate();
    } else {
        // Сообщение при недостатке монет
        if (tg && tg.showPopup) {
            tg.showPopup({ title: 'Не хватает монет', message: `Нужно ${price}🪙`, buttons: [{ type: 'ok' }] });
        } else {
            alert(`Недостаточно монет! Нужно ${price} 🪙`);
        }
    }
}

// --- Покупка пассивного улучшения ---
function buyPassiveUpgrade() {
    const price = getPassiveUpgradePrice(passiveLevel);
    if (coins >= price) {
        coins -= price;
        passiveLevel++;
        recalcStats();
        saveGame();
        updateUI();
        vibrate();
    } else {
        if (tg && tg.showPopup) {
            tg.showPopup({ title: 'Не хватает монет', message: `Нужно ${price}🪙`, buttons: [{ type: 'ok' }] });
        } else {
            alert(`Недостаточно монет! Нужно ${price} 🪙`);
        }
    }
}

// --- Инициализация приложения ---
function init() {
    loadGame();                      // Восстанавливаем прогресс
    startPassiveIncomeInterval();    // Запускаем пассивный доход
    updateUI();                      // Обновляем экран
    
    // Вешаем обработчики
    clickArea.addEventListener('click', onHamsterClick);
    buyClickBtn.addEventListener('click', buyClickUpgrade);
    buyPassiveBtn.addEventListener('click', buyPassiveUpgrade);
}

// Запуск после полной загрузки DOM
document.addEventListener('DOMContentLoaded', init);