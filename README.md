# Plana · Notion-connected preview

## Что работает
- Интерфейс Plana, локальные привычки/таймер/аналитика из предыдущей версии.
- **Новая вкладка Notion**: чтение реальных записей баз «Привычки», «Задачи», «Цели», «Проекты» через серверный API Vercel.
- Сервер проверяет подпись Telegram Mini App initData, срок действия и конкретный разрешённый Telegram user ID.
- Notion token и Telegram bot token остаются только на сервере.

## Настройка Vercel
В Project → Environment Variables → Production добавь:
- `NOTION_TOKEN` — секрет интеграции Plana из Notion (уже добавлен ранее).
- `TELEGRAM_BOT_TOKEN` — HTTP API token из BotFather. НЕ добавлять в GitHub или в VITE_*.
- `TELEGRAM_ALLOWED_USER_ID` — **числовой Telegram user ID владельца**, не username бота. Узнать можно через Telegram user-info бот или иной доверенный способ.

После добавления переменных сделай Redeploy из Vercel Deployments или новый commit в GitHub.

## Установка
`npm install && npm run build`

Для публикации: загрузи содержимое **этой** папки `plana/` в корень GitHub-репозитория; Vercel Framework Vite, Build `npm run build`, Output `dist`. Папка `api/` должна находиться рядом с `package.json`.

## Ограничения
- Чтение из Notion, **без записи**. Локальные привычки НЕ записываются в Notion. Не путай два независимых набора данных.
- Вкладка Notion запрашивает до 300 записей на базу; большие базы могут быть усечены.
- При изменении схемы/идентификаторов Notion может потребоваться обновить `api/notion.js`.
- Не готово для публичного многопользовательского доступа. Разрешён один Telegram user ID.
- Не добавляй финансовые базы или их ID.
- Данные API не кэшируются.
- Если Notion возвращает 404, проверь, что интеграции Plana предоставлен доступ к каждой базе.
