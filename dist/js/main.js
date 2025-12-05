// Главный файл инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chicken Road Demo загружается...');
    
    // Проверяем поддержку Canvas
    if (!checkCanvasSupport()) {
        showError('Ваш браузер не поддерживает Canvas. Пожалуйста, обновите браузер.');
        return;
    }
    
    // Проверяем поддержку LocalStorage
    if (!checkLocalStorageSupport()) {
        showWarning('LocalStorage не поддерживается. Прогресс не будет сохранен.');
    }
    
    // Инициализируем UI
    UIManager.init();
    
    // Инициализируем игру (уже делается в game.js)
    console.log('Игра готова к запуску!');
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        UIManager.showNotification('Добро пожаловать в Chicken Road Demo!', 'success');
    }, 1000);
});

// Проверка поддержки Canvas
function checkCanvasSupport() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
}

// Проверка поддержки LocalStorage
function checkLocalStorageSupport() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Показать ошибку
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2><i class="fas fa-exclamation-triangle"></i> Ошибка</h2>
                <p>${message}</p>
                <p>Пожалуйста, обновите браузер или используйте другой браузер.</p>
            </div>
        `;
    }
}

// Показать предупреждение
function showWarning(message) {
    console.warn(message);
    // Можно добавить визуальное предупреждение
}

// Глобальные хоткеи
document.addEventListener('keydown', function(e) {
    // Пропускаем, если пользователь вводит текст
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            e.preventDefault();
            document.getElementById('moveUp').click();
            UIManager.animateButton('moveUp', 'pulse');
            break;
            
        case 'arrowdown':
        case 's':
            e.preventDefault();
            document.getElementById('moveDown').click();
            UIManager.animateButton('moveDown', 'pulse');
            break;
            
        case ' ':
        case 'enter':
            e.preventDefault();
            document.getElementById('startBtn').click();
            break;
            
        case 'a':
            e.preventDefault();
            document.getElementById('autoBtn').click();
            break;
            
        case 'r':
            e.preventDefault();
            document.getElementById('resetBtn').click();
            break;
            
        case 'm':
            e.preventDefault();
            document.getElementById('addCoinsBtn').click();
            break;
    }
});

// Сохраняем состояние при закрытии страницы
window.addEventListener('beforeunload', function() {
    if (typeof ChickenRoadGame !== 'undefined' && ChickenRoadGame.saveState) {
        ChickenRoadGame.saveState();
    }
});