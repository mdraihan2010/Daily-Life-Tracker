import { useApp, getDay, getMonth, ensureDay, streak } from '../store.jsx';
import { today, toMin, span, fmtDate, fmtTime } from '../utils.js';
import { Check, Bar } from '../components/ui.jsx';

const sum = (a) => a.reduce((s, x) => s + (Number(x.amount) || 0), 0);

export default function Home() {
  const { data, update, t, lang, N, M } = useApp();
  const date = today();
  const day = getDay(data, date);
  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 5 ? 'greet_n' : hr < 12 ? 'greet_m' : hr < 17 ? 'greet_a' : hr < 21 ? 'greet_e' : 'greet_n';

  // which routine block contains the current time?
  const mins = hr * 60 + now.getMinutes();
  const current = data.routine.find((b) => {
    const s = toMin(b.start);
    const off = (mins - s + 1440) % 1440;
    return off < span(b.start, b.end);
  });

  const top = day.top.filter((x) => x.text);
  const todosDone = day.todos.filter((x) => x.done).length;
  const habits = data.habits.list;
  const ticked = habits.filter((h) => data.habits.ticks[h.id]?.[date]).length;
  const best = Math.max(0, ...habits.map((h) => streak(data.habits.ticks, h.id)));
  const month = getMonth(data, date.slice(0, 7));
  const inc = sum(month.income);
  const out = sum(month.expense);
  const pct = month.budget > 0 ? Math.round((out / month.budget) * 100) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="muted">{fmtDate(date, lang)}</p>
          <h1>
            {t(greet)}, {data.profile.name}
          </h1>
          <p className="muted">{t('home_sub')}</p>
        </div>
      </div>

      <a className="now" href="#routine">
        <span>{t('now_routine')}</span>
        {data.routine.length === 0 ? (
          <strong className="small">{t('no_routine')}</strong>
        ) : current ? (
          <>
            <strong>{current.title}</strong>
            <em>
              {fmtTime(current.start, lang)} – {fmtTime(current.end, lang)}
            </em>
          </>
        ) : (
          <strong>{t('free_time')}</strong>
        )}
      </a>

      <section className="card">
        <header className="card-h">
          <div>
            <h3>{t('top3')}</h3>
            <p className="hint">{t('d_top_hint')}</p>
          </div>
          <a className="btn" href="#daily">
            {t('d_title')} →
          </a>
        </header>
        {top.length === 0 ? (
          <p className="muted">
            {t('top3_empty')} <a href="#daily">{t('write_now')}</a>
          </p>
        ) : (
          <ul className="list">
            {day.top.map(
              (x, i) =>
                x.text && (
                  <li key={i} className={x.done ? 'done' : ''}>
                    <Check on={x.done} label={x.text} onClick={() => update((d) => (ensureDay(d, date).top[i].done = !x.done))} />
                    <span>{x.text}</span>
                  </li>
                )
            )}
          </ul>
        )}
      </section>

      <div className="stats">
        <a className="stat" href="#daily">
          <span>{t('todos')}</span>
          <strong>{t('done_of', { a: N(todosDone), b: N(day.todos.length) })}</strong>
          <Bar value={todosDone} max={day.todos.length} color="var(--pri)" />
        </a>
        <a className="stat" href="#habits">
          <span>{t('habits_today')}</span>
          <strong>{t('done_of', { a: N(ticked), b: N(habits.length) })}</strong>
          <small>{t('best_streak', { n: N(best) })}</small>
        </a>
        <a className="stat" href="#money">
          <span>{t('this_month')}</span>
          <strong className={inc - out < 0 ? 'bad' : ''}>{M(inc - out)}</strong>
          <small>{pct === null ? t('no_budget') : t('budget_used', { p: N(pct) })}</small>
        </a>
        <a className="stat" href="#daily">
          <span>{t('water')}</span>
          <strong>{t('glasses', { n: N(day.water) })}</strong>
          <Bar value={day.water} max={8} color="#0e9aa7" />
        </a>
      </div>
    </>
  );
}
