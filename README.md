# HTML/SCSS/JS Codespace Template

## Установка и запуск проекта

1. **Склонируйте репозиторий:**
   ```bash
   git clone <ваш-репозиторий>
   cd <папка-проекта>
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запуск в режиме разработки:**
   ```bash
   npm run dev
   ```
   Это автоматически соберёт SCSS, JS, HTML и запустит live-server на http://localhost:5000.

4. **Сборка проекта для продакшена:**
   ```bash
   npm run build
   ```

5. **Описание основных npm-скриптов:**
   - `npm run dev` — параллельный запуск всех вотчеров и сервера для разработки.
   - `npm run build` — сборка production-версии в папку `dist`.
   - `npm run serve` — запуск live-server для папки `dist`.
   - `npm run watch:scss` — вотчер для SCSS.
   - `npm run watch:js` — вотчер для main.js.
   - `npm run watch:html` — вотчер для HTML-компонентов (posthtml).
   - `npm run copy:images` — копирование изображений.
   - `npm run copy:components` — копирование компонентов.

**Требования:**  
Node.js 16+ и npm.
