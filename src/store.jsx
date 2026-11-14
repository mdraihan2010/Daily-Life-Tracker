import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { T } from './i18n.js';
import { today, addDays, num } from './utils.js';

// All user data lives in ONE plain object saved in localStorage.
// Later, a login + cloud sync layer only has to upload/download this object.
const KEY = 'dlt:v1';

export const blank = () => ({
  v: 1,
  profile: { name: '', persona: '', org: '', detail: '', lang: 'bn', theme: 'light', weekStart: 6, onboarded: false },
  planner: {}, // { '2026-11-14': day }
  routine: [], // [{ id, start, end, title, cat }]
  habits: { title: '', start: today(), days: 30, reward: '', list: [], ticks: {} },
  money: {}, // { '2026-11': month }
  weeks: {}, // { '2026-11-14' (week start): { focus, tasks: [{ id, day, text, done }], note } }
  events: [], // [{ id, date, title, type }]
  monthNotes: {}, // { '2026-11': 'text' }
  projects: [], // [{ id, name, goal, start, deadline, steps: [{ id, text, due, done }], notes }]
  savings: { emergency: { monthly: 0, months: 3, saved: 0 }, goals: [], debts: [] }, // goals: [{ id, title, target, saved }], debts: [{ id, who, total, paid, monthly }]
  mood: { target: 8, days: {} }, // days: { '2026-11-14': { mood: 1..5, sleep: 7.5, note } }
  journal: { days: {}, weeks: {} }, // days: { date: { g: ['', '', ''], best } }, weeks: { weekStart: ['', '', ''] }
  books: {}, // { 2026: { target, list: [{ id, title, author, status, rating }], skills: [{ id, name, source, pct }] } }
  report: { months: {}, annual: {} }, // Report Book. months: { '2026-11': { plan, days: { 1: {...} }, extra } }
  goals: {}, // { 2026: { word, list: [{ id, title, area, by, why, steps: [{ text, done }] }], months: {} } }
});

const load = () => {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.v === 1) return { ...blank(), ...d };
  } catch {
    /* ignore broken data */
  }
  return blank();
};

export const newDay = () => ({
  top: [0, 1, 2].map(() => ({ text: '', done: false })),
  todos: [],
  timed: [],
  water: 0,
  gratitude: '',
});
export const getDay = (d, date) => d.planner[date] || newDay();
export const ensureDay = (d, date) => (d.planner[date] ??= newDay());

export const newMonth = () => ({ budget: 0, goal: 0, income: [], expense: [] });
export const getMonth = (d, m) => d.money[m] || newMonth();
export const ensureMonth = (d, m) => (d.money[m] ??= newMonth());

// How many days in a row a habit has been done (counting back from today)
export const streak = (ticks, id) => {
  const tk = ticks[id] || {};
  let d = today();
  if (!tk[d]) d = addDays(d, -1);
  let n = 0;
  while (tk[d]) {
    n++;
    d = addDays(d, -1);
  }
  return n;
};

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(load);

  const [savedAt, setSavedAt] = useState(0); // changes every time something is saved (drives the "Saved" toast)
  const lastJson = useRef(null);

  useEffect(() => {
    const json = JSON.stringify(data);
    if (json === lastJson.current) return;
    const first = lastJson.current === null;
    lastJson.current = json;
    try {
      localStorage.setItem(KEY, json);
      if (!first) setSavedAt(Date.now());
    } catch {
      /* storage full or blocked */
    }
  }, [data]);

  const lang = data.profile.lang;
  const api = useMemo(
    () => ({
      data,
      lang,
      savedAt,
      update: (fn) =>
        setData((d) => {
          const n = structuredClone(d);
          fn(n);
          return n;
        }),
      replace: setData,
      t: (k, vars) => {
        let s = (T[k] || [k, k])[lang === 'bn' ? 0 : 1];
        if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace('{' + a + '}', b);
        return s;
      },
      N: (n) => num(n, lang),
      M: (n) => '৳' + num(Math.round(n || 0), lang),
    }),
    [data, lang, savedAt]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
