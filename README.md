# АСОШ Таймер — сайт

Сайт-визитка приложения «АСОШ Таймер» (умный дневник АСОШ №2): описание возможностей и инструкции по установке на Android, iPhone и компьютер.

Обычный статический сайт без сборки: `index.html`, `style.css`, `main.js`. Публикуется на GitHub Pages автоматически при каждом коммите в `main`: https://kafeevbogdan347-ui.github.io/asosh-timer-site/

## Ссылки на скачивание

Ссылки задаются в конце `index.html`:

```js
window.LINKS = {
  app: 'https://kafeevbogdan347-ui.github.io/asosh-timer/',
  apk: 'https://github.com/kafeevbogdan347-ui/asosh-timer/releases/download/apk-latest/asosh-timer.apk',
};
```

APK по этой ссылке всегда последний: его обновляет сборка в репозитории приложения при каждом коммите в `main`. Если ссылку очистить, кнопка покажет «скоро».

## Скриншоты

`img/` — экраны в размере iPhone 15 (393×852, с отступом под строку состояния). Рамку iPhone, Dynamic Island и строку состояния рисуют `style.css` и `main.js`.

## Локальный просмотр

```bash
python3 -m http.server 4173
```

Затем откройте http://localhost:4173

## Промо-ролик

`promo.html` — ролик, где Асошик рассказывает про приложение (около 2 минут, голос и субтитры). Озвучка — `promo/voiceNN.mp3` (Gemini TTS, голос Puck), скриншоты — `promo/app-*.jpg`. Тексты реплик и их длительность — в `LINES` внутри `promo.html`.
Сначала нажмите «Смотреть со звуком». Пробел или клик — пауза, ← → — сцены, M — звук, F или двойной клик — на весь экран.
