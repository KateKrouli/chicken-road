// Управление UI элементами
const UIManager = {
    init() {
        this.initAnimations();
        this.initTooltips();
        this.initHistoryScroll();
    },

    // Инициализация анимаций
    initAnimations() {
        // Добавляем CSS для анимаций
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -100%) scale(0.5); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                40% {transform: translateY(-20px);}
                60% {transform: translateY(-10px);}
            }
            
            .pulse { animation: pulse 0.5s ease-in-out; }
            .shake { animation: shake 0.5s ease-in-out; }
            .bounce { animation: bounce 1s; }
            
            .win { color: #48bb78 !important; }
            .loss { color: #f56565 !important; }
            
            .history-item {
                transition: all 0.3s ease;
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .history-item.win {
                background: rgba(72, 187, 120, 0.1);
                border-left: 3px solid #48bb78;
            }
            
            .history-item.loss {
                background: rgba(245, 101, 101, 0.1);
                border-left: 3px solid #f56565;
            }
            
            .history-item:hover {
                transform: translateX(5px);
                background: rgba(255, 255, 255, 0.05);
            }
            
            .history-time {
                font-size: 0.8rem;
                color: #a0aec0;
                min-width: 60px;
            }
            
            .history-direction {
                font-size: 1.2rem;
                font-weight: bold;
                min-width: 20px;
                text-align: center;
            }
            
            .history-bet {
                flex: 1;
                color: #ffd700;
            }
            
            .history-result {
                font-weight: bold;
                min-width: 150px;
                text-align: right;
            }
            
            .coin-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2rem;
                color: #ffd700;
                font-weight: bold;
                z-index: 1000;
                animation: fadeOut 2s forwards;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
            
            .active {
                background: linear-gradient(45deg, #ff6b6b, #ffd93d) !important;
                color: #000 !important;
                box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            }
        `;
        document.head.appendChild(style);
    },

    // Инициализация подсказок
    initTooltips() {
        const tooltips = {
            'moveUp': 'Переместить цыпленка вверх',
            'moveDown': 'Переместить цыпленка вниз',
            'autoBtn': 'Автоматическая игра (10 раундов)',
            'resetBtn': 'Сбросить игру к начальным настройкам',
            'soundBtn': 'Включить/выключить звук',
            'helpBtn': 'Показать правила игры',
            'addCoinsBtn': 'Добавить 1000 демо-монет',
            'clearHistoryBtn': 'Очистить историю игр'
        };

        Object.keys(tooltips).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('title', tooltips[id]);
            }
        });
    },

    // Инициализация скролла истории
    initHistoryScroll() {
        const historyList = document.getElementById('historyList');
        if (historyList) {
            // Авто-скролл вниз при добавлении новых записей
            const observer = new MutationObserver(() => {
                historyList.scrollTop = 0;
            });
            
            observer.observe(historyList, { childList: true });
        }
    },

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            font-weight: bold;
        `;
        
        // Добавляем CSS для анимации
        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Анимация кнопки
    animateButton(buttonId, animation = 'pulse') {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add(animation);
            setTimeout(() => button.classList.remove(animation), 1000);
        }
    },

    // Обновить цвет баланса в зависимости от изменения
    updateBalanceColor(oldBalance, newBalance) {
        const balanceElement = document.getElementById('balance');
        if (!balanceElement) return;
        
        if (newBalance > oldBalance) {
            balanceElement.classList.add('win');
            setTimeout(() => balanceElement.classList.remove('win'), 1000);
        } else if (newBalance < oldBalance) {
            balanceElement.classList.add('loss');
            setTimeout(() => balanceElement.classList.remove('loss'), 1000);
        }
    }
};

// Инициализация UI при загрузке
window.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});