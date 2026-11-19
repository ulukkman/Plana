# Plana — Personal Intelligence

Premium mobile-first personal productivity app UI for Telegram Mini App deployment. Built with React, TypeScript, Vite, Lucide and Recharts. No finance modules.

## Features implemented

- Five mobile navigation destinations: Home, Habits, Analytics, Insights, Reports.
- Complete **local** habit tracker: add/delete habits, emoji/color selection, mark today and any of the last 14 days, streak, completion percentage, 7-day bars, 7/14/30-day trend.
- Local task list: create, complete and delete tasks.
- Focus timer: start/pause/reset and 15/25/45/60-minute presets. Uses device timestamps, restores active countdown after reopening. Completed sessions saved in browser when app is running.
- Local analytics, factual insights, 7-day report, session history, JSON backup export.
- Dark and light theme, responsive design, keyboard accessibility, no financial data.
- Notion Second Brain categories, with links to known Notion pages.

## Install and run

Requires Node.js 20+ and npm with internet access to download dependencies.

```bash
npm install
npm run dev
```

Visit the URL Vite prints (typically http://localhost:5173).

Production build:

```bash
npm run build
```

Deploy static `dist/` on Vercel: import repository, framework Vite, build command `npm run build`, output directory `dist`.

## Important limitations — NOT a fully integrated production release

- All tasks, habit records, session history and settings live **only in browser localStorage**; they do not sync across devices. Clearing storage removes them. Use Reports → Export to save a JSON backup.
- The initial habit/task names are illustrative starter entries, **not** imported Notion data. Completion data starts empty.
- The Notion workspace was inspected in read-only mode. The real `Привычки` database has a related `Журнал привычек` data source and a `Сделано сегодня` button. This frontend does **not** trigger that button or write to Notion. An actual sync requires a secure backend, Notion authorization, and mapping of the habit journal.
- No Telegram bot, Telegram initData verification, server-side timer, notifications, Notion live sync, multi-user authentication, or PostgreSQL in this package.
- The timer is browser-local; session completion while the app is closed is not guaranteed. Device time can be modified.
- Insights/reports reflect only local entries, not your whole Notion workspace. No composite efficiency index is shown because it cannot be grounded in current data.
- A full production-ready version requires separate backend and integration testing.

## Security

Never put Notion API secrets or Telegram bot tokens into this frontend, public GitHub repository, or Vite environment variables beginning with `VITE_`. Backend must verify Telegram initData and isolate users.

## Notion read-only schema evidence

Habit database: `collection://34d4c96f-ce7a-81b1-a006-000b0c640ca2`.
Properties include `Название`, `Статус`, `Год`, `Цвет`, `Порядок`, `Журнал привычек` (relation), `Сферы жизни` (relation), `Сделано сегодня` (button), and formula/rollup properties. The precise journal sync contract must be investigated before writing.
