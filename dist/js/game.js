// Основной игровой объект - ФИНАЛЬНАЯ ВЕРСИЯ
const ChickenRoadGame = {
    // Конфигурация игры
    config: {
        canvasWidth: 800,
        canvasHeight: 500,
        segmentWidth: 60,
        segments: 12,
        chickenSize: 40,
        flameWidth: 40,
        flameHeight: 60,
        minFlameDuration: 1000,
        maxFlameDuration: 3000,
        minFlameInterval: 1500,
        maxFlameInterval: 4000,
        demoStartBalance: 1000,
        multipliers: [
            1.00, 1.03, 1.07, 1.11, 1.16, 1.21,
            1.26, 1.31, 1.36, 1.42, 1.48, 1.54, 100.00  // Финиш на 100x!
        ]
    },

    // Состояние игры
    state: {
        isPlaying: false,
        gameActive: false,
        balance: 1000,
        currentBet: 10,
        chicken: {
            currentSegment: 0,
            multiplier: 1.00
        },
        segments: [],
        lastResult: null,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        soundEnabled: true,
        autoPlay: false,
        gameHistory: [],
        currentStep: 0,
        canCollect: false,
        potentialWin: 0,
        passedSegments: [] // Пройденные участки (без пламени)
    },

    // DOM элементы
    elements: {
        canvas: null,
        ctx: null,
        balanceDisplay: null,
        betAmountInput: null,
        gamesPlayedDisplay: null,
        winsDisplay: null,
        lossesDisplay: null,
        lastResultDisplay: null,
        currentMultiplierDisplay: null,
        potentialWinDisplay: null,
        currentChoiceDisplay: null,
        historyList: null,
        gameOverlay: null,
        gameMessage: null,
        startButton: null,
        forwardButton: null,
        collectButton: null
    },

    // Инициализация игры
    init() {
        console.log('Инициализация игры Chicken Road - Финальная версия');
        
        // Получаем DOM элементы
        this.getDOMElements();
        
        if (!this.elements.canvas) {
            console.error('Canvas не найден, игра не может быть инициализирована');
            return;
        }
        
        // Инициализируем Canvas
        this.initCanvas();
        
        // Инициализируем участки
        this.initSegments();
        
        // Загружаем сохраненное состояние
        this.loadState();
        
        // Инициализируем события
        this.initEvents();
        
        // Начинаем игровой цикл
        this.gameLoop();
        
        // Запускаем генерацию пламени
        this.startFlameGeneration();
        
        console.log('Игра успешно инициализирована');
    },

    // Получаем DOM элементы
    getDOMElements() {
        console.log('Получаем DOM элементы...');
        
        // Canvas и контекст
        this.elements.canvas = document.getElementById('gameCanvas');
        if (!this.elements.canvas) {
            console.error('Canvas не найден!');
            return;
        }
        this.elements.ctx = this.elements.canvas.getContext('2d');
        
        // Получаем элементы с проверкой
        this.elements.balanceDisplay = document.getElementById('balance');
        this.elements.betAmountInput = document.getElementById('betAmount');
        this.elements.gamesPlayedDisplay = document.getElementById('games-played');
        this.elements.winsDisplay = document.getElementById('wins');
        this.elements.lossesDisplay = document.getElementById('losses');
        this.elements.lastResultDisplay = document.getElementById('lastResult');
        this.elements.currentMultiplierDisplay = document.getElementById('currentMultiplier');
        this.elements.potentialWinDisplay = document.getElementById('potentialWin');
        this.elements.currentChoiceDisplay = document.getElementById('currentChoice');
        this.elements.historyList = document.getElementById('historyList');
        this.elements.gameOverlay = document.getElementById('gameOverlay');
        this.elements.gameMessage = document.getElementById('gameMessage');
        this.elements.startButton = document.getElementById('startBtn');
        this.elements.forwardButton = document.getElementById('moveUp');
        this.elements.collectButton = document.getElementById('moveDown'); // Используем кнопку "назад" для "забрать"
        
        console.log('DOM элементы получены');
    },

    // Инициализация Canvas
    initCanvas() {
        // Устанавливаем размеры Canvas
        this.elements.canvas.width = this.config.canvasWidth;
        this.elements.canvas.height = this.config.canvasHeight;
        
        // Сбрасываем позицию цыпленка
        this.resetChicken();
    },

    // Инициализация участков
    initSegments() {
        this.state.segments = [];
        const segmentWidth = this.config.segmentWidth;
        const startX = 50;
        
        for (let i = 0; i <= this.config.segments; i++) {
            const x = startX + i * segmentWidth;
            this.state.segments.push({
                id: i,
                x: x,
                width: segmentWidth,
                multiplier: this.config.multipliers[i],
                hasFlame: false,
                flameTimer: 0,
                flameStartTime: 0,
                flameDuration: 0,
                isPassed: false // Отметка о прохождении
            });
        }
    },

    // Инициализация событий
    initEvents() {
        console.log('Инициализация событий...');
        
        // Кнопка "Вперед"
        if (this.elements.forwardButton) {
            this.elements.forwardButton.innerHTML = '<i class="fas fa-arrow-right"></i> ВПЕРЕД';
            this.elements.forwardButton.disabled = true;
            this.elements.forwardButton.addEventListener('click', () => {
                this.moveForward();
            });
        }
        
        // Кнопка "Забрать выигрыш"
        if (this.elements.collectButton) {
            this.elements.collectButton.innerHTML = '<i class="fas fa-money-bill-wave"></i> ЗАБРАТЬ';
            this.elements.collectButton.disabled = true;
            this.elements.collectButton.addEventListener('click', () => {
                this.collectWin();
            });
        }
        
        // Кнопка "Начать игру"
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Управление ставкой
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const change = parseInt(e.target.dataset.change);
                this.changeBet(change);
            });
        });
        
        // Быстрые ставки
        document.querySelectorAll('.quick-bet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bet = e.target.dataset.bet;
                if (bet === 'max') {
                    this.setMaxBet();
                } else {
                    this.setBet(parseInt(bet));
                }
            });
        });
        
        // Ввод ставки
        if (this.elements.betAmountInput) {
            this.elements.betAmountInput.addEventListener('change', (e) => {
                this.setBet(parseInt(e.target.value) || 10);
            });
        }
        
        // Кнопка авто-игры
        const autoBtn = document.getElementById('autoBtn');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                this.toggleAutoPlay();
            });
        }
        
        // Кнопка сброса
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        // Кнопка звука
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Кнопка помощи
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
        
        // Добавить монеты
        const addCoinsBtn = document.getElementById('addCoinsBtn');
        if (addCoinsBtn) {
            addCoinsBtn.addEventListener('click', () => {
                this.addCoins(1000);
            });
        }
        
        // Очистить историю
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }
        
        // Модальное окно
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }
        
        // Закрыть модальное окно при клике вне его
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('helpModal');
            if (e.target === modal) {
                this.hideModal();
            }
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                if (this.state.gameActive) {
                    this.moveForward();
                } else {
                    this.startGame();
                }
            } else if (e.key === 'Enter' && this.state.canCollect) {
                e.preventDefault();
                this.collectWin();
            }
        });
        
        console.log('События инициализированы');
    },

    // Игровой цикл
    gameLoop() {
        // Проверяем, инициализирован ли Canvas
        if (!this.elements.ctx) {
            console.error('Canvas context не инициализирован');
            return;
        }
        
        // Очищаем Canvas
        this.clearCanvas();
        
        // Рисуем фон
        this.drawBackground();
        
        // Обновляем пламя (только на непройденных участках)
        this.updateFlames();
        
        // Рисуем дорогу с участками
        this.drawRoad();
        
        // Рисуем пламя
        this.drawFlames();
        
        // Рисуем цыпленка
        this.drawChicken();
        
        // Рисуем UI
        this.drawUI();
        
        // Запрашиваем следующий кадр
        requestAnimationFrame(() => this.gameLoop());
    },

    // Очистка Canvas
    clearCanvas() {
        this.elements.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    },

    // Рисуем фон
    drawBackground() {
        const ctx = this.elements.ctx;
        
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, this.config.canvasHeight);
        gradient.addColorStop(0, '#0c0c0c');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    },

    // Рисуем дорогу с участками
    drawRoad() {
        const ctx = this.elements.ctx;
        const roadY = 250;
        const roadHeight = 100;
        
        // Фон дороги
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(40, roadY, this.config.canvasWidth - 80, roadHeight);
        
        // Рисуем каждый участок
        this.state.segments.forEach((segment, index) => {
            const x = segment.x;
            const width = segment.width;
            
            // Цвет участка зависит от состояния
            let segmentColor;
            if (segment.isPassed) {
                // Пройденные участки - зеленые
                segmentColor = '#2e7d32';
            } else if (segment.hasFlame) {
                // Участки с пламенем - красные
                segmentColor = '#c62828';
            } else {
                // Непройденные без пламени
                segmentColor = index % 2 === 0 ? '#4a5568' : '#5a6578';
            }
            
            ctx.fillStyle = segmentColor;
            ctx.fillRect(x, roadY, width, roadHeight);
            
            // Рамка участка
            ctx.strokeStyle = segment.hasFlame ? '#ff4500' : '#718096';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, roadY, width, roadHeight);
            
            // Номер участка и множитель в центре
            ctx.fillStyle = segment.hasFlame ? '#ff8c00' : '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            
            // Номер участка
            ctx.fillText(`${index}`, x + width / 2, roadY + 30);
            
            // Множитель
            ctx.fillStyle = index === this.config.segments ? '#ff0000' : '#a0aec0';
            ctx.font = index === this.config.segments ? 'bold 18px Arial' : '14px Arial';
            ctx.fillText(`${segment.multiplier.toFixed(2)}x`, x + width / 2, roadY + 50);
            
            // Если это текущая позиция цыпленка
            if (index === this.state.chicken.currentSegment) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 2, roadY + 2, width - 4, roadHeight - 4);
            }
            
            // Если участок пройден - галочка
            if (segment.isPassed && index > 0) {
                ctx.fillStyle = '#00ff00';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('✓', x + width / 2, roadY + 80);
            }
        });
        
        ctx.textAlign = 'left';
        
        // Разметка
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        
        // Центральная линия
        ctx.beginPath();
        ctx.moveTo(40, roadY + roadHeight / 2);
        ctx.lineTo(this.config.canvasWidth - 40, roadY + roadHeight / 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Подписи
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('СТАРТ', 45, roadY - 10);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('ФИНИШ 100x!', this.config.canvasWidth - 110, roadY - 10);
    },

    // Рисуем пламя на участках
    drawFlames() {
        const ctx = this.elements.ctx;
        const roadY = 250;
        const roadHeight = 100;
        const time = Date.now() * 0.001;
        
        this.state.segments.forEach(segment => {
            // Не рисуем пламя на пройденных участках
            if (!segment.hasFlame || segment.isPassed) return;
            
            const x = segment.x + segment.width / 2;
            const y = roadY + roadHeight - 20;
            
            // Анимация пламени
            const waveY = Math.sin(time * 5 + segment.id) * 5;
            
            // Внешнее пламя
            const outerGradient = ctx.createRadialGradient(
                x, y + waveY, 0,
                x, y + waveY, this.config.flameWidth / 2
            );
            outerGradient.addColorStop(0, '#ff4500');
            outerGradient.addColorStop(0.7, 'rgba(255, 140, 0, 0.5)');
            outerGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            this.drawSmallFlameShape(ctx, x, y + waveY, this.config.flameWidth, this.config.flameHeight);
            ctx.fill();
            
            // Внутреннее пламя
            const innerGradient = ctx.createRadialGradient(
                x, y + waveY, 0,
                x, y + waveY, this.config.flameWidth / 4
            );
            innerGradient.addColorStop(0, '#ff8c00');
            innerGradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.3)');
            innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = innerGradient;
            ctx.beginPath();
            this.drawSmallFlameShape(ctx, x, y + waveY, this.config.flameWidth * 0.5, this.config.flameHeight * 0.7);
            ctx.fill();
            
            // Искры
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                const sparkX = x + Math.sin(time * 3 + i) * 10;
                const sparkY = y + waveY - 20 + Math.cos(time * 2 + i) * 5;
                const sparkSize = 1 + Math.sin(time * 2 + i) * 1;
                
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    // Форма маленького пламени
    drawSmallFlameShape(ctx, x, y, width, height) {
        ctx.moveTo(x, y - height / 2);
        ctx.bezierCurveTo(
            x + width / 3, y - height / 4,
            x + width / 3, y + height / 4,
            x, y + height / 4
        );
        ctx.bezierCurveTo(
            x - width / 3, y + height / 4,
            x - width / 3, y - height / 4,
            x, y - height / 2
        );
        ctx.closePath();
    },

    // Рисуем цыпленка
    drawChicken() {
        const ctx = this.elements.ctx;
        const chicken = this.state.chicken;
        const size = this.config.chickenSize;
        const roadY = 250;
        const roadHeight = 100;
        
        // Позиция цыпленка (центр текущего участка)
        const segment = this.state.segments[chicken.currentSegment];
        const x = segment ? segment.x + segment.width / 2 : 70;
        const y = roadY + roadHeight / 2 - 10;
        
        // Тело цыпленка (цвет зависит от состояния)
        let bodyColor = '#ffd700';
        if (this.state.canCollect) {
            bodyColor = '#00ff00'; // Можно забрать - зеленый
        } else if (this.state.gameActive) {
            bodyColor = '#ffa500'; // Игра активна - оранжевый
        }
        
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#ffa500';
        ctx.beginPath();
        ctx.arc(x + size / 3, y - size / 3, size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + size / 3 + 5, y - size / 3 - 3, size / 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + size / 3 + 5, y - size / 3 - 3, size / 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Клюв
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.moveTo(x + size / 3 + 8, y - size / 3);
        ctx.lineTo(x + size / 3 + 15, y - size / 3 + 2);
        ctx.lineTo(x + size / 3 + 8, y - size / 3 + 4);
        ctx.fill();
        
        // Ноги
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size / 6, y + size / 2);
        ctx.lineTo(x - size / 6, y + size / 2 + 10);
        ctx.moveTo(x + size / 6, y + size / 2);
        ctx.lineTo(x + size / 6, y + size / 2 + 10);
        ctx.stroke();
        
        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + size / 2 + 5, size / 1.5, size / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // Рисуем UI поверх игры
    drawUI() {
        const ctx = this.elements.ctx;
        const currentSegment = this.state.segments[this.state.chicken.currentSegment];
        
        // Текущая позиция
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 250, 60);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Текущая позиция:', 20, 35);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Участок ${this.state.chicken.currentSegment}`, 20, 60);
        
        // Текущий множитель
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.config.canvasWidth - 260, 10, 250, 60);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Текущий множитель:', this.config.canvasWidth - 250, 35);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`x${currentSegment.multiplier.toFixed(2)}`, this.config.canvasWidth - 250, 60);
        
        // Статус игры
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.config.canvasWidth / 2 - 100, 10, 200, 40);
        
        let statusText = 'ОЖИДАНИЕ СТАВКИ';
        let statusColor = '#ffd700';
        
        if (this.state.gameActive) {
            statusText = 'ИГРА АКТИВНА';
            statusColor = '#00ff00';
        }
        if (this.state.canCollect) {
            statusText = 'МОЖНО ЗАБРАТЬ!';
            statusColor = '#ff8c00';
        }
        
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(statusText, this.config.canvasWidth / 2, 35);
        
        // Текущий выигрыш
        if (this.state.canCollect) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fillRect(this.config.canvasWidth / 2 - 150, 80, 300, 30);
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`Доступно к получению: ${this.state.potentialWin} монет`, 
                        this.config.canvasWidth / 2, 100);
        }
        
        ctx.textAlign = 'left';
    },

    // Обновляем пламя (только на непройденных участках)
    updateFlames() {
        const now = Date.now();
        
        this.state.segments.forEach(segment => {
            // На старте (участок 0) никогда нет пламени
            if (segment.id === 0) {
                segment.hasFlame = false;
                return;
            }
            
            // На пройденных участках пламя не появляется
            if (segment.isPassed) {
                segment.hasFlame = false;
                return;
            }
            
            if (segment.hasFlame) {
                // Проверяем, закончилось ли время горения пламени
                if (now - segment.flameStartTime >= segment.flameDuration) {
                    segment.hasFlame = false;
                    segment.flameTimer = now + this.getRandomInterval();
                }
            } else {
                // Проверяем, пора ли зажечь новое пламя
                if (now >= segment.flameTimer) {
                    segment.hasFlame = true;
                    segment.flameStartTime = now;
                    segment.flameDuration = this.getRandomDuration();
                }
            }
        });
    },

    // Генерация случайного интервала
    getRandomInterval() {
        return Math.random() * (this.config.maxFlameInterval - this.config.minFlameInterval) 
               + this.config.minFlameInterval;
    },

    // Генерация случайной длительности
    getRandomDuration() {
        return Math.random() * (this.config.maxFlameDuration - this.config.minFlameDuration) 
               + this.config.minFlameDuration;
    },

    // Запуск генерации пламени
    startFlameGeneration() {
        const now = Date.now();
        
        this.state.segments.forEach(segment => {
            // Участок 0 (старт) всегда без пламени
            if (segment.id === 0) {
                segment.hasFlame = false;
                segment.isPassed = true;
                return;
            }
            
            // Устанавливаем случайные таймеры для каждого участка
            segment.flameTimer = now + this.getRandomInterval();
            segment.hasFlame = false;
            segment.isPassed = false;
        });
    },

    // Сброс цыпленка
    resetChicken() {
        this.state.chicken.currentSegment = 0;
        this.state.chicken.multiplier = 1.00;
        this.state.currentStep = 0;
        this.state.canCollect = false;
        this.state.potentialWin = 0;
        this.state.passedSegments = [];
        
        // Сбрасываем пройденные участки
        this.state.segments.forEach(segment => {
            segment.isPassed = false;
        });
        // Старт всегда пройден
        if (this.state.segments[0]) {
            this.state.segments[0].isPassed = true;
        }
    },

// Начать игру
startGame() {
    if (this.state.gameActive) {
        console.log('Игра уже активна!');
        return;
    }
    
    // Проверяем ставку
    if (this.state.currentBet > this.state.balance) {
        this.showMessage('Недостаточно средств!', 'Уменьшите ставку или добавьте монет', false);
        this.showMessage('Сделайте ставку!', 'Установите ставку больше 0', false);
        return;
    }
    
    if (this.state.currentBet <= 0) {
        this.showMessage('Сделайте ставку!', 'Установите ставку больше 0', false);
        return;
    }
    
    // Сбрасываем позицию цыпленка
    this.resetChicken();
    
    // Списываем ставку
    this.state.balance -= this.state.currentBet;
    this.updateBalanceDisplay();
    
    // Обновляем статистику
    this.state.gamesPlayed++;
    this.updateStatsDisplay();
    
    // Активируем игру
    this.state.gameActive = true;
    this.state.isPlaying = true;
    this.state.canCollect = false;
    
    // Скрываем сообщение если открыто
    this.hideMessage();
    
    // Активируем кнопку "Вперед"
    if (this.elements.forwardButton) {
        this.elements.forwardButton.disabled = false;
    }
    
    // Блокируем кнопку "Забрать" (будет доступна после первого шага)
    if (this.elements.collectButton) {
        this.elements.collectButton.disabled = true;
    }
    
    // Обновляем UI
    this.updateChoiceDisplay('Игра началась! Нажимайте "ВПЕРЕД"');
    
    // Меняем текст кнопки "Начать игру"
    if (this.elements.startButton) {
        this.elements.startButton.textContent = 'Игра идет...';
        this.elements.startButton.disabled = true;
    }
    
    console.log('Игра началась со ставкой:', this.state.currentBet);
},

    // Движение вперед
    moveForward() {
        if (!this.state.gameActive) {
           this.showMessage('Сначала начните игру!', 'Нажмите кнопку "Начать игру"', false);
            return;
        }
        
        // Проверяем, не достигнут ли финиш
        if (this.state.chicken.currentSegment >= this.config.segments) {
            this.endGameWithWin();
            return;
        }
        
        // Перемещаем на следующий участок
        this.state.chicken.currentSegment++;
        this.state.currentStep++;
        
        // Получаем текущий участок
        const currentSegment = this.state.segments[this.state.chicken.currentSegment];
        
        // Проверяем, есть ли пламя на участке
        if (currentSegment.hasFlame) {
            // Цыпленок сгорел! Полный проигрыш
            this.endGameWithLoss();
        } else {
            // Успешный шаг
            this.state.chicken.multiplier = currentSegment.multiplier;
            
            // Отмечаем участок как пройденный (пламя больше не появится)
            currentSegment.isPassed = true;
            this.state.passedSegments.push(currentSegment.id);
            
            // Рассчитываем потенциальный выигрыш
            this.state.potentialWin = Math.floor(this.state.currentBet * currentSegment.multiplier);
            
            // Активируем кнопку "Забрать выигрыш"
            this.state.canCollect = true;
            if (this.elements.collectButton) {
                this.elements.collectButton.disabled = false;
            }
            
            // Обновляем отображение
            this.updateChoiceDisplay(`Шаг ${this.state.currentStep}: Участок ${this.state.chicken.currentSegment} (x${currentSegment.multiplier.toFixed(2)})`);
            
            // Если достигли финиша (100x)
            if (this.state.chicken.currentSegment === this.config.segments) {
                setTimeout(() => {
                    this.endGameWithWin();
                }, 500);
            }
        }
    },

    // Забрать выигрыш
collectWin() {
    if (!this.state.canCollect || !this.state.gameActive) return;
    
    const winAmount = this.state.potentialWin;
    this.state.balance += winAmount;
    this.state.wins++;
    
    // Добавляем в историю
    this.addToHistory({
        bet: this.state.currentBet,
        win: winAmount,
        steps: this.state.currentStep,
        multiplier: this.state.chicken.multiplier,
        success: true,
        collected: true,
        timestamp: new Date().toLocaleTimeString()
    });
    
    this.state.lastResult = `ЗАБРАЛ! +${winAmount} (шаг ${this.state.currentStep})`;
    
    // Показываем сообщение с кнопкой Новая игра
    this.showMessage(
        'ВЫИГРЫШ ЗАБРАН! 💰',
        `Вы забрали выигрыш на участке ${this.state.chicken.currentSegment}\n` +
        `Множитель: x${this.state.chicken.multiplier.toFixed(2)}\n` +
        `Выигрыш: ${winAmount} монет`,
        true // показывать кнопку "Новая игра"
    );
    
    this.finishGame();
},

// Завершение игры с победой (дошел до финиша 100x)
endGameWithWin() {
    const winAmount = Math.floor(this.state.currentBet * 100); // 100x множитель
    this.state.balance += winAmount;
    this.state.wins++;
    
    // Добавляем в историю
    this.addToHistory({
        bet: this.state.currentBet,
        win: winAmount,
        steps: this.state.currentStep,
        multiplier: 100.00,
        success: true,
        collected: false,
        timestamp: new Date().toLocaleTimeString()
    });
    
    this.state.lastResult = `ДЖЕКПОТ! +${winAmount}`;
    
    // Показываем сообщение с кнопкой Новая игра
    this.showMessage(
        'ДЖЕКПОТ! 🎰 100x!',
        `Цыпленок дошел до ФИНИША!\n` +
        `Множитель: x100.00\n` +
        `ВЫИГРЫШ: ${winAmount} монет`,
        true // показывать кнопку "Новая игра"
    );
    
    this.finishGame();
},

// Завершение игры с поражением (попал в пламя)
endGameWithLoss() {
    this.state.losses++;
    
    // Добавляем в историю
    this.addToHistory({
        bet: this.state.currentBet,
        win: 0,
        steps: this.state.currentStep,
        multiplier: 0,
        success: false,
        collected: false,
        timestamp: new Date().toLocaleTimeString()
    });
    
    this.state.lastResult = `СГОРЕЛ! 0 (шаг ${this.state.currentStep})`;
    
    // Показываем сообщение с кнопкой Новая игра
    this.showMessage(
        'ИГРА ОКОНЧЕНА 🔥',
        `Цыпленок сгорел на участке ${this.state.chicken.currentSegment}\n` +
        `Ставка: ${this.state.currentBet} монет\n` +
        `ВЫИГРЫШ: 0 монет\n` +
        `Ставка не возвращается!`,
        true // показывать кнопку "Новая игра"
    );
    
    this.finishGame();
},

    // Завершение игры с победой (дошел до финиша 100x)
    endGameWithWin() {
        const winAmount = Math.floor(this.state.currentBet * 100); // 100x множитель
        this.state.balance += winAmount;
        this.state.wins++;
        
        // Добавляем в историю
        this.addToHistory({
            bet: this.state.currentBet,
            win: winAmount,
            steps: this.state.currentStep,
            multiplier: 100.00,
            success: true,
            collected: false,
            timestamp: new Date().toLocaleTimeString()
        });
        
        this.state.lastResult = `ДЖЕКПОТ! +${winAmount}`;
        
        // Показываем сообщение
        this.showMessage(
            'ДЖЕКПОТ! 🎰 100x!',
            `Цыпленок дошел до ФИНИША!\n` +
            `Множитель: x100.00\n` +
            `ВЫИГРЫШ: ${winAmount} монет`
        );
        
        this.finishGame();
    },

    // Завершение игры с поражением (попал в пламя)
    endGameWithLoss() {
        this.state.losses++;
        
        // Добавляем в историю
        this.addToHistory({
            bet: this.state.currentBet,
            win: 0,
            steps: this.state.currentStep,
            multiplier: 0,
            success: false,
            collected: false,
            timestamp: new Date().toLocaleTimeString()
        });
        
        this.state.lastResult = `СГОРЕЛ! 0 (шаг ${this.state.currentStep})`;
        
        // Показываем сообщение
        this.showMessage(
            'ИГРА ОКОНЧЕНА 🔥',
            `Цыпленок сгорел на участке ${this.state.chicken.currentSegment}\n` +
            `Ставка: ${this.state.currentBet} монет\n` +
            `ВЫИГРЫШ: 0 монет\n` +
            `Ставка не возвращается!`
        );
        
        this.finishGame();
    },

// Завершение игры
finishGame() {
    this.state.gameActive = false;
    this.state.isPlaying = false;
    this.state.canCollect = false;
    
    // Обновляем отображения
    this.updateBalanceDisplay();
    this.updateStatsDisplay();
    this.updateLastResultDisplay();
    
    // Блокируем кнопки
    if (this.elements.forwardButton) {
        this.elements.forwardButton.disabled = true;
    }
    if (this.elements.collectButton) {
        this.elements.collectButton.disabled = true;
    }
    
    // Сбрасываем кнопку "Начать игру" (чтобы она была готова для новой игры)
    if (this.elements.startButton) {
        this.elements.startButton.disabled = false;
        this.elements.startButton.textContent = 'Начать игру';
    }
    
    // Отключаем авто-игру (если включена) - пусть пользователь сам решит
    if (this.state.autoPlay) {
        this.state.autoPlay = false;
        const autoBtn = document.getElementById('autoBtn');
        if (autoBtn) {
            autoBtn.innerHTML = '<i class="fas fa-redo"></i> Авто-игра';
            autoBtn.classList.remove('active');
        }
        
        // Через 3 секунды показываем предложение начать новую игру
        setTimeout(() => {
            if (!this.state.gameActive) {
                this.showMessage(
                    'Готовы к новой игре?',
                    'Авто-игра отключена. Хотите начать новую игру?',
                    true
                );
            }
        }, 3000);
    }
},

    // Изменение ставки
    changeBet(amount) {
        const newBet = this.state.currentBet + amount;
        this.setBet(newBet);
    },

    // Установка ставки
    setBet(amount) {
        if (amount < 1) amount = 1;
        if (amount > this.state.balance) amount = this.state.balance;
        
        this.state.currentBet = amount;
        if (this.elements.betAmountInput) {
            this.elements.betAmountInput.value = amount;
        }
        
        // Обновляем отображение потенциального выигрыша
        this.updatePotentialWinDisplay();
        
        // Сохраняем состояние
        this.saveState();
    },

    // Установить максимальную ставку
    setMaxBet() {
        this.setBet(this.state.balance);
    },

    // Переключение авто-игры
    toggleAutoPlay() {
        this.state.autoPlay = !this.state.autoPlay;
        const btn = document.getElementById('autoBtn');
        
        if (btn) {
            if (this.state.autoPlay) {
                btn.innerHTML = '<i class="fas fa-stop"></i> Стоп авто-игра';
                btn.classList.add('active');
                
                // Запускаем первую игру
                setTimeout(() => {
                    this.startGame();
                }, 500);
            } else {
                btn.innerHTML = '<i class="fas fa-redo"></i> Авто-игра';
                btn.classList.remove('active');
            }
        }
    },

    // Переключение звука
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const btn = document.getElementById('soundBtn');
        
        if (btn) {
            if (this.state.soundEnabled) {
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Звук';
            } else {
                btn.innerHTML = '<i class="fas fa-volume-mute"></i> Звук';
            }
        }
        
        this.saveState();
    },

    // Сброс игры
    resetGame() {
        if (confirm('Сбросить игру и начать заново?')) {
            this.state.balance = this.config.demoStartBalance;
            this.state.wins = 0;
            this.state.losses = 0;
            this.state.gamesPlayed = 0;
            this.state.gameHistory = [];
            this.state.autoPlay = false;
            this.state.gameActive = false;
            this.state.canCollect = false;
            
            this.setBet(10);
            this.resetChicken();
            
            this.updateBalanceDisplay();
            this.updateStatsDisplay();
            this.updateHistoryDisplay();
            this.updateLastResultDisplay();
            this.updateChoiceDisplay('—');
            
            this.showMessage('Игра сброшена!', 'Сделайте ставку и начните новую игру', false);
            
            this.saveState();
        }
    },

    // Добавить монеты
    addCoins(amount) {
        this.state.balance += amount;
        this.updateBalanceDisplay();
        this.saveState();
        
        // Показываем сообщение
        const message = document.createElement('div');
        message.className = 'coin-message';
        message.textContent = `+${amount} монет`;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            color: #ffd700;
            font-weight: bold;
            z-index: 1000;
            animation: fadeOut 2s forwards;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
            pointer-events: none;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    },

    // Показать помощь
    showHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.style.display = 'block';
        }
    },

    // Скрыть модальное окно
    hideModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },


// Показать сообщение
showMessage(title, text, showNewGameButton = true) {
    if (this.elements.gameOverlay && this.elements.gameMessage) {
        this.elements.gameOverlay.style.display = 'flex';
        
        // Определяем какая кнопка будет в попапе
        let buttonHtml = '';
        if (showNewGameButton) {
            buttonHtml = `
                <div style="display: flex; gap: 20px; margin-top: 20px;">
                    <button class="start-btn" id="continueBtn" style="flex: 1;">ОК</button>
                    <button class="start-btn" id="newGameBtn" style="flex: 1; background: #00b300;">Новая игра</button>
                </div>
            `;
        } else {
            buttonHtml = `<button class="start-btn" id="continueBtn">ОК</button>`;
        }
        
        this.elements.gameMessage.innerHTML = `
            <h2>${title}</h2>
            <p style="white-space: pre-line;">${text}</p>
            ${buttonHtml}
        `;
        
        // Добавляем обработчик для кнопки продолжения
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.hideMessage());
        }
        
        // Добавляем обработчик для кнопки новой игры (если есть)
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.hideMessage();
                setTimeout(() => {
                    this.startGame();
                }, 300);
            });
        }
        
        // Блокируем кнопки пока открыт попап
        if (this.elements.startButton) {
            this.elements.startButton.disabled = true;
        }
        if (this.elements.forwardButton) {
            this.elements.forwardButton.disabled = true;
        }
        if (this.elements.collectButton) {
            this.elements.collectButton.disabled = true;
        }
    }
},

// Скрыть сообщение
hideMessage() {
    if (this.elements.gameOverlay) {
        this.elements.gameOverlay.style.display = 'none';
        
        // Возвращаем цыпленка на старт
        this.resetChicken();
        
        // Обновляем отображение
        this.updateChoiceDisplay('—');
        
        // Активируем кнопку "Начать игру"
        if (this.elements.startButton) {
            this.elements.startButton.disabled = false;
            this.elements.startButton.textContent = 'Начать игру';
        }
        
        // Блокируем остальные кнопки до начала новой игры
        if (this.elements.forwardButton) {
            this.elements.forwardButton.disabled = true;
        }
        if (this.elements.collectButton) {
            this.elements.collectButton.disabled = true;
        }
        
        // Обновляем потенциальный выигрыш
        this.updatePotentialWinDisplay();
    }
},

    // Добавить запись в историю
    addToHistory(record) {
        this.state.gameHistory.unshift(record);
        
        // Ограничиваем историю 50 записями
        if (this.state.gameHistory.length > 50) {
            this.state.gameHistory.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveState();
    },

    // Очистить историю
    clearHistory() {
        if (confirm('Очистить историю игр?')) {
            this.state.gameHistory = [];
            this.updateHistoryDisplay();
            this.saveState();
        }
    },

    // Обновление отображений
    updateBalanceDisplay() {
        if (this.elements.balanceDisplay) {
            this.elements.balanceDisplay.textContent = this.state.balance;
        }
    },

    updateStatsDisplay() {
        if (this.elements.gamesPlayedDisplay) {
            this.elements.gamesPlayedDisplay.textContent = this.state.gamesPlayed;
        }
        if (this.elements.winsDisplay) {
            this.elements.winsDisplay.textContent = this.state.wins;
        }
        if (this.elements.lossesDisplay) {
            this.elements.lossesDisplay.textContent = this.state.losses;
        }
    },

    updateLastResultDisplay() {
        if (this.elements.lastResultDisplay) {
            this.elements.lastResultDisplay.textContent = this.state.lastResult || '—';
            this.elements.lastResultDisplay.className = 'result-text ' + 
                (this.state.lastResult && (this.state.lastResult.includes('ЗАБРАЛ') || this.state.lastResult.includes('ДЖЕКПОТ')) ? 'win' : 'loss');
        }
    },

    updatePotentialWinDisplay() {
        // Показываем максимальный возможный выигрыш (100x)
        const maxWin = Math.floor(this.state.currentBet * 100);
        
        if (this.elements.potentialWinDisplay) {
            this.elements.potentialWinDisplay.textContent = maxWin;
        }
        if (this.elements.currentMultiplierDisplay) {
            this.elements.currentMultiplierDisplay.textContent = 'до x100.00';
        }
    },

    updateChoiceDisplay(choice) {
        if (this.elements.currentChoiceDisplay) {
            this.elements.currentChoiceDisplay.textContent = choice;
        }
    },

    updateHistoryDisplay() {
        if (!this.elements.historyList) return;
        
        const historyList = this.elements.historyList;
        
        if (this.state.gameHistory.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <p>Здесь будет отображаться история ваших игр</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.state.gameHistory.map(record => `
            <div class="history-item ${record.success ? 'win' : 'loss'}">
                <div class="history-time">${record.timestamp}</div>
                <div class="history-steps">${record.steps} шаг.</div>
                <div class="history-bet">Ставка: ${record.bet}</div>
                <div class="history-result">
                    ${record.success ? 
                        (record.collected ? 
                            `Забрал: +${record.win} (x${record.multiplier.toFixed(2)})` : 
                            record.multiplier === 100 ? 
                                `ДЖЕКПОТ: +${record.win} (x100!)` : 
                                `Выигрыш: +${record.win} (x${record.multiplier.toFixed(2)})`) : 
                        'Сгорел: 0'}
                </div>
            </div>
        `).join('');
    },

    // Сохранение состояния в LocalStorage
    saveState() {
        const saveData = {
            balance: this.state.balance,
            wins: this.state.wins,
            losses: this.state.losses,
            gamesPlayed: this.state.gamesPlayed,
            currentBet: this.state.currentBet,
            soundEnabled: this.state.soundEnabled,
            gameHistory: this.state.gameHistory.slice(0, 20)
        };
        
        try {
            localStorage.setItem('chickenRoadFinalDemo', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Не удалось сохранить данные:', e);
        }
    },

    // Загрузка состояния из LocalStorage
    loadState() {
        try {
            const saved = localStorage.getItem('chickenRoadFinalDemo');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.state.balance = data.balance || this.config.demoStartBalance;
                this.state.wins = data.wins || 0;
                this.state.losses = data.losses || 0;
                this.state.gamesPlayed = data.gamesPlayed || 0;
                this.state.currentBet = data.currentBet || 10;
                this.state.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                this.state.gameHistory = data.gameHistory || [];
                
                if (this.elements.betAmountInput) {
                    this.elements.betAmountInput.value = this.state.currentBet;
                }
                this.updateBalanceDisplay();
                this.updateStatsDisplay();
                this.updateHistoryDisplay();
                this.updatePotentialWinDisplay();
            }
        } catch (e) {
            console.warn('Не удалось загрузить сохраненные данные:', e);
        }
    }
};

// Инициализируем игру при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    ChickenRoadGame.init();
});