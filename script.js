// Инициализируем Telegram Web App
const tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран и показываем, что оно готово
tg.expand();
tg.ready();

// Получаем элементы DOM
const counterElement = document.getElementById('counter-value');
const incrementButton = document.getElementById('increment-button');
const resetButton = document.getElementById('reset-button');
const userInfoElement = document.getElementById('user-info');

// Инициализируем счетчик
let counter = 0;
counterElement.innerText = counter;

// Получаем данные пользователя из Telegram
let user = tg.initDataUnsafe?.user;
if (user) {
    let userName = user.first_name || '';
    if (user.last_name) userName += ' ' + user.last_name;
    userInfoElement.innerText = `Привет, ${userName}! Твой ID: ${user.id}`;
} else {
    userInfoElement.innerText = 'Данные пользователя не найдены';
}

// Функция для обновления интерфейса (счетчика и главной кнопки)
function updateUI() {
    counterElement.innerText = counter;
    // Управляем главной кнопкой Telegram
    if (counter > 0) {
        tg.MainButton.setText(`Счёт: ${counter}`).show();
    } else {
        tg.MainButton.hide();
    }
    // Отправляем данные боту (опционально)
    tg.sendData(JSON.stringify({ counter: counter }));
}

// Обработчик для кнопки "+1"
incrementButton.addEventListener('click', () => {
    counter++;
    updateUI();
    // Вибрация (если поддерживается)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});


// Обработчик нажатия на главную кнопку Telegram
tg.MainButton.onClick(() => {
    tg.sendData(JSON.stringify({ action: 'reset', counter: counter }));
    counter = 0;
    updateUI();
    tg.showPopup({
        title: 'Сброс',
        message: 'Счёт был сброшен через главную кнопку!',
        buttons: [{ type: 'ok' }]
    });
});
// Обработчик для кнопки сброса
resetButton.addEventListener('click', () => {
    counter = 0;
    updateUI();
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
    }
});

// Завершаем инициализацию
updateUI();
console.log('Mini App успешно загружено!');