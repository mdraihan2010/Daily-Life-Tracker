# Daily Life Tracker

A free, offline-first life tracker for everyone: school students (Class 1–12), university students (BSc / MSc / PhD), job holders, business owners, farmers and homemakers.

Plan your day, build habits, keep a routine and track money. Every page can also be downloaded as a **PNG**, a **PDF (A4)** or **printed**.

## Features

| Page | What it does |
|------|--------------|
| Onboarding | Name + "who are you" (9 personas). Fills a sample routine, habits and budget that match the persona. |
| Home | Greeting, what the routine says you should be doing right now, today's top 3 tasks, quick stats. |
| Daily planner | Top 3 tasks, to-do list, timed tasks, water counter, gratitude. Saved separately for every date. |
| Routine | 24-hour routine with a clock chart and time per category. |
| Habit tracker | 7 / 21 / 30-day challenge, tick habits each day, streak counter. |
| Money tracker | Monthly income, spending by category, budget and savings goal. |
| Goal planner | Yearly goals by area, 3 steps each, word of the year, month-by-month focus. |
| Weekly planner | Seven days of tasks on one page, with a weekly focus and notes. |
| Monthly calendar | Exams, meetings, bills and birthdays, colour-coded. Week can start on Saturday, Sunday or Monday. |
| Project/Exam planner | Countdown to a deadline, steps with due dates, progress and timeline. Several plans at once. |
| Savings & debt | Emergency fund, savings goals, debts with remaining amount and months to clear. |
| Mood & sleep | One tap per day for mood, hours slept, monthly average. |
| Journal | Three things to be grateful for each day, best moment, weekly review. |
| Books & learning | Yearly reading target, bookshelf with status and rating, course/skill progress. |
| Guide | Short, practical tips for each area with a link to the matching tool. |
| Settings | Bangla / English, light / dark, backup and restore, erase all. |

- **Bangla + English** – switch any time from Settings.
- **PWA** – install on a phone from the browser menu ("Add to Home screen"). Works without internet.
- **Private** – no login, no server. All data stays in the browser (`localStorage`).

## Run it

```bash
npm install
npm run dev      # open http://localhost:5173
npm run build    # production files go to dist/
npm run preview  # test the production build (PWA works here)
```

## Deploy (free)

Build command `npm run build`, publish folder `dist`. Works on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Project structure

```
src/
  main.jsx          app entry
  App.jsx           layout + navigation (hash routes: #home, #daily, ...)
  store.jsx         all data in one object, saved to localStorage
  i18n.js           every on-screen text: key -> [Bangla, English]
  personas.js       personas + sample data for each
  guide.js          text of the Guide page
  utils.js          date, time and number helpers
  components/
    ui.jsx          small shared pieces (Card, Check, Tabs, Ring chart ...)
    Sheet.jsx       A4 print sheet + PNG / PDF / Print buttons
  pages/            one file per page
```

### How to add a new on-screen text
Add one line in `src/i18n.js`: `my_key: ['বাংলা লেখা', 'English text']`, then use `t('my_key')`.

## Roadmap

- **Phase 3 – accounts:** login + cloud sync (Node/Express + MongoDB). The whole user state is already one JSON object (`store.jsx`), so sync only needs to upload and download that object.
- **Phase 4:** reminders/notifications, Play Store package.
