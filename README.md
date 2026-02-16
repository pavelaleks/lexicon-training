# Студия «Лексикон» — Каталог тренажёров по русскому языку

Сайт-каталог тренажёров (пунктуация, орфография), статический деплой на GitHub Pages.  
**Разработчик: П. В. Алексеев.** Горно-Алтайск.

## Технологии

- Vite + React + TypeScript
- TailwindCSS (mobile-first)
- Данные: автогенерация из HTML в `trainers_source` → JSON в `public/data`

---

## 1. Куда класть HTML

Положите исходные HTML-файлы тренажёров в папку **`trainers_source`** (в корне проекта).  
Примеры имён: `Тренажер оборотов_Лексикон.html`, `Тренажер Н-НН_Лексикон.html`.

Если файлы лежат в корне репозитория — переместите их в `trainers_source`, затем выполните `npm run build:trainers`.

Скрипт ожидает в каждом HTML:

- тег `<title>` — используется как название тренажёра;
- в одном из `<script>` массив **`EXERCISES`**:
  - для запятых: элементы с полями `words` (массив слов) и `commas` (индексы слотов для запятых);
  - для Н/НН: элементы с полями `phrase` (строка с `___`), `answer` (`'н'` или `'нн'`), `word`, `comment`;
- опционально **`QUEST_STEPS`** — массив шагов квеста (миссии) перед заданиями.

---

## 2. Как запускать парсер

После добавления или изменения HTML в `trainers_source` выполните:

```bash
npm run build:trainers
```

Скрипт:

1. Читает все `*.html` из `trainers_source`.
2. Извлекает `EXERCISES` и при наличии `QUEST_STEPS`.
3. Определяет тип: `punctuation.commas` (слова + запятые) или `spelling.nn` (Н/НН), иначе `generic.html`.
4. Валидирует данные и пишет в **`public/data/trainers/<slug>.json`**.
5. Обновляет **`public/data/index.json`** (каталог для главной страницы).

Slug берётся из имени файла (латиница, kebab-case). В консоли выводится отчёт: сколько файлов обработано и какие ошибки.

---

## 3. Как запустить сайт локально (из папки проекта)

Запускать команды нужно **в папке проекта**, а не из PyCharm или другой IDE.

1. Откройте **терминал** (командную строку):
   - **Windows**: `Win + R` → введите `cmd` или `powershell` → Enter; либо в Проводнике откройте папку проекта и в адресной строке введите `cmd` и Enter.
   - **macOS / Linux**: откройте «Терминал» и перейдите в каталог проекта командой `cd`.
2. Перейдите в папку проекта:
   ```bash
   cd "путь\к\папке\Сайт с заданиями на ГИТ"
   ```
   Пример для Windows: `cd "c:\Users\PC\PycharmProjects\Training\Сайт с заданиями на ГИТ"`.
3. Выполните по очереди:
   ```bash
   npm install
   npm run build:trainers   # если ещё не генерировали данные
   npm run dev
   ```
4. В браузере откройте адрес, который выведет Vite (обычно `http://localhost:5173`).

Остановить сервер: в том же окне терминала нажмите `Ctrl + C`.

Сборка для продакшена (тоже из папки проекта):

```bash
npm run build
npm run preview
```

---

## 4. Как залить проект в GitHub и задеплоить

Репозиторий: **[github.com/pavelaleks/lexicon-training](https://github.com/pavelaleks/lexicon-training)**  
После деплоя сайт будет доступен по адресу: **https://pavelaleks.github.io/lexicon-training/**

### Шаг 1: Отправить код в репозиторий

В терминале, в папке проекта, выполните по очереди:

```bash
cd "c:\Users\PC\PycharmProjects\Training\Сайт с заданиями на ГИТ"
git init
git add .
git commit -m "Студия Лексикон: каталог тренажёров, деплой на GitHub Pages"
git branch -M main
git remote add origin https://github.com/pavelaleks/lexicon-training.git
git push -u origin main
```

Если репозиторий уже был инициализирован и есть `origin`, вместо добавления remote выполните:

```bash
git remote set-url origin https://github.com/pavelaleks/lexicon-training.git
git push -u origin main
```

При запросе авторизации используйте свой GitHub-аккаунт (логин и пароль или [Personal Access Token](https://github.com/settings/tokens)).

### Шаг 2: Включить GitHub Pages

1. На GitHub откройте репозиторий **pavelaleks/lexicon-training**.
2. **Settings** → **Pages**.
3. В блоке **Build and deployment** в поле **Source** выберите **GitHub Actions**.
4. После первого пуша в ветку `main` workflow соберёт проект и задеплоит его. Готовый сайт: **https://pavelaleks.github.io/lexicon-training/**.

Workflow уже настроен: при каждом пуше в `main` выполняются `npm ci` → `npm run build:trainers` → `npm run build` и публикация на Pages (base path `/lexicon-training/` подставляется автоматически).

---

## 5. Как задеплоить на GitHub Pages (общая схема)

1. Создайте репозиторий на GitHub и запушьте код (включая `trainers_source` и скрипты).
2. В настройках репозитория: **Settings → Pages → Source** — выберите **GitHub Actions**.
3. При пуше в ветку `main` workflow **Deploy to GitHub Pages** сам выполнит:
   - `npm ci`
   - `npm run build:trainers`
   - `npm run build`
   - публикацию каталога `dist` на GitHub Pages.

Если сайт открывается по адресу вида `https://<user>.github.io/<repo>/`, в репозитории должен быть задан **base path**. В `vite.config.ts` используется переменная окружения:

```ts
const base = process.env.GITHUB_PAGES_BASE || '/';
```

В workflow уже передаётся `GITHUB_PAGES_BASE=/<repo>/` для project pages. Для корневого сайта (`https://<user>.github.io/`) в `vite.config.ts` задайте `base: '/'` и в workflow удалите или не задавайте `GITHUB_PAGES_BASE`.

---

## 6. Как добавить новый тип тренажёра (новый renderer)

1. **Скрипт парсинга** (`scripts/build_trainers.mjs`): в функции `detectType()` добавьте распознавание нового формата по полям первого элемента `EXERCISES`; верните новый тип, например `'spelling.other'`.
2. **Валидация**: при необходимости добавьте проверку полей в цикле по `EXERCISES` и запись в `payload.type`.
3. **Типы** (`src/types.ts`): расширьте `TrainerType` и при необходимости интерфейсы упражнений.
4. **Рендерер**: в `src/lib/renderers/` создайте файл, например `other.tsx`, с компонентом отображения одного задания и проверкой ответа.
5. **Страница тренажёра** (`src/pages/Trainer.tsx`): в ветке по `trainerType` подключите новый рендерер и логику проверки (аналогично `punctuation.commas` и `spelling.nn`).

После этого новый HTML с такой структурой `EXERCISES` будет автоматически определяться и отображаться новым рендерером.

---

## Мобильные требования (mobile-first)

Интерфейс спроектирован сначала под экраны 360–430 px и удобство на смартфонах.

- **Верстка**: одна колонка, карточки на всю ширину, крупные кликабельные зоны. Используются responsive-классы Tailwind (`sm:`, `md:`, `lg:`).
- **Кнопки и тап-зоны**: минимальный размер кликабельной области **44×44 px** (кнопки «Проверить», «Далее», «Начать», «Н/НН» на мобилке на всю ширину). Слоты запятых между словами увеличены по высоте и подсвечиваются при тапе.
- **Типографика**: базовый размер текста на мобилке 16–18 px, line-height 1.8–2 для предложений, ограничение длины строки на десктопе.
- **Навигация**:  
  - **Sticky header** — при прокрутке виден логотип/название и кнопка «Назад».  
  - **Sticky bottom action bar** на мобилке — внизу экрана закреплены основные кнопки («Проверить», «Следующее», «Н/НН»), чтобы не скроллить к ним.  
  - Индикатор прогресса всегда виден (над заданием или в шапке).
- **Safe area**: для нижней панели кнопок используется `padding-bottom: env(safe-area-inset-bottom)`, чтобы элементы не уходили под системную панель на iPhone и т.п.
- **Каталог**: поиск и фильтры в виде сегмент-кнопок; карточки тренажёров крупные, с тегами и кнопкой «Открыть».

### Как проверить мобильный UX

- **Chrome DevTools**: F12 → Toggle device toolbar (Ctrl+Shift+M), выбрать устройство (например iPhone 12) или задать ширину 360–430 px.
- **Режим устройства**: проверить портретную ориентацию, видимость sticky header и нижней панели, размер кнопок и слотов запятых (тап без промаха).

---

## Структура репозитория

```
/
  package.json
  vite.config.ts
  tsconfig.json
  README.md
  index.html
  public/
    data/              ← автогенерируемые index.json и trainers/*.json
    assets/
  trainers_source/     ← сюда класть HTML-тренажёры
  scripts/
    build_trainers.mjs
  src/
    main.tsx
    App.tsx
    styles.css
    components/
    pages/
    lib/
      loadIndex.ts
      loadTrainer.ts
      renderers/
  .github/workflows/
    deploy.yml
```

---

© Студия «Лексикон». Горно-Алтайск. Разработчик: П. В. Алексеев.
