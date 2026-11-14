import { useEffect, useRef, useState } from 'react';
import { useApp, getDay, getMonth, ensureDay, streak, toolOn } from '../store.jsx';
import { today, addDays, parse, loc, toMin, span, fmtDate, fmtTime, daysBetween, uid } from '../utils.js';
import { Check, Bar } from '../components/ui.jsx';
import { Icon } from '../App.jsx';
import { reportStatus, getMonthRep } from '../report.js';

const sum = (a) => a.reduce((s, x) => s + (Number(x.amount) || 0), 0);

// one short tip a day, picked by the day of the year
const TIPS = [
  ['সবচেয়ে কঠিন কাজটা দিনের শুরুতেই সেরে ফেলো।', 'Do the hardest task first thing in the day.'],
  ['ছোট ছোট কাজ প্রতিদিন করলেই বড় ফল আসে।', 'Small things done every day add up to big results.'],
  ['ঘুমানোর আগে কালকের কাজগুলো লিখে রাখো।', "Write tomorrow's tasks before you sleep."],
  ['একসাথে অনেক কাজ নয়, একটা শেষ করে পরেরটা।', 'Not many things at once: finish one, then the next.'],
  ['একদিন বাদ পড়লে হাল ছেড়ো না, পরের দিন আবার শুরু করো।', 'Missed a day? Start again the next day.'],
  ['খরচ লিখে রাখলেই বোঝা যায় টাকা কোথায় যায়।', 'Writing down spending shows where the money goes.'],
  ['দিনশেষে নিজের কাজের হিসাব নিজেই নাও।', 'At the end of the day, take account of your own work.'],
  ['২৫ মিনিট পুরো মন দিয়ে, তারপর ৫ মিনিট বিরতি।', '25 minutes of full focus, then a 5-minute break.'],
  ['যে কাজ দুই মিনিটে হয়, সেটা এখনই করে ফেলো।', 'If it takes two minutes, do it now.'],
  ['ভালো ঘুম মানেই ভালো পরের দিন।', 'Good sleep makes a good next day.'],
];

// the white ring in the welcome banner
function ProgressRing({ pct, label, caption }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="hero-ring">
      <div className="hero-ring-svg">
        <svg viewBox="0 0 110 110" width="118" height="118" aria-hidden="true">
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="10" />
          <circle cx="55" cy="55" r={r} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 55 55)" />
        </svg>
        <strong>{label}</strong>
      </div>
      <span>{caption}</span>
    </div>
  );
}

export default function Home() {
  const { data, update, t, lang, N, M } = useApp();
  const i = lang === 'bn' ? 0 : 1;
  const L = (bn, en) => (i ? en : bn);
  const D = (s) => (i ? String(s) : String(s).replace(/[0-9]/g, (c) => '০১২৩৪৫৬৭৮৯'[c]));

  // live clock: refresh every 20 seconds
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);

  const [draft, setDraft] = useState('');
  const addRef = useRef(null);

  const date = today();
  const day = getDay(data, date);
  const hr = now.getHours();
  const greet = hr < 5 ? 'greet_n' : hr < 12 ? 'greet_m' : hr < 17 ? 'greet_a' : hr < 21 ? 'greet_e' : 'greet_n';
  const clock = now.toLocaleTimeString(loc(lang), { hour: 'numeric', minute: '2-digit' });
  const dayOfYear = Math.floor((parse(date) - new Date(parse(date).getFullYear(), 0, 0)) / 864e5);
  const tip = TIPS[dayOfYear % TIPS.length][i];

  const on = (k) => toolOn(data.profile, k);
  const show = data.profile.dailyShow || {};

  // routine: the block happening now and the next one
  const mins = hr * 60 + now.getMinutes();
  const current = data.routine.find((b) => (mins - toMin(b.start) + 1440) % 1440 < span(b.start, b.end));
  const nextBlock = [...data.routine]
    .filter((b) => b !== current)
    .sort((a, b) => ((toMin(a.start) - mins + 1440) % 1440) - ((toMin(b.start) - mins + 1440) % 1440))[0];

  // today
  const todosDone = day.todos.filter((x) => x.done).length;
  const habits = data.habits.list;
  const isTicked = (id, d = date) => !!data.habits.ticks[id]?.[d];
  const ticked = habits.filter((h) => isTicked(h.id)).length;
  const best = Math.max(0, ...habits.map((h) => streak(data.habits.ticks, h.id)));
  const month = getMonth(data, date.slice(0, 7));
  const inc = sum(month.income);
  const out = sum(month.expense);
  const pct = month.budget > 0 ? Math.round((out / month.budget) * 100) : null;
  const rep = on('report') ? reportStatus(data, date) : null;

  // today's progress = average of the parts that are switched on and have something to do
  const parts = [];
  if (on('daily') && day.todos.length) parts.push(todosDone / day.todos.length);
  if (on('habits') && habits.length) parts.push(ticked / habits.length);
  if (rep) parts.push(rep.parts / 7);
  const overall = parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) : 0;

  // last 7 days: was anything done that day?
  const week = Array.from({ length: 7 }, (_, k) => addDays(date, k - 6)).map((d) => {
    const pd = data.planner[d];
    const rd = getMonthRep(data, d.slice(0, 7)).days[Number(d.slice(8))];
    const active = !!((pd && pd.todos.some((x) => x.done)) || habits.some((h) => isTicked(h.id, d)) || (on('report') && rd && Object.keys(rd).length > 0));
    return { d, active };
  });
  const activeDays = week.filter((x) => x.active).length;

  // what is coming up
  const upcoming = [
    ...(on('calendar') ? data.events.filter((e) => e.date >= date).map((e) => ({ id: e.id, title: e.title, date: e.date, href: '#calendar', kind: 'event' })) : []),
    ...(on('project') ? data.projects.filter((p) => p.deadline >= date).map((p) => ({ id: p.id, title: p.name || t('p_untitled'), date: p.deadline, href: '#project', kind: 'deadline' })) : []),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const inDays = (d) => {
    const n = daysBetween(date, d);
    return n === 0 ? L('আজ', 'Today') : n === 1 ? L('আগামীকাল', 'Tomorrow') : L(`${N(n)} দিন বাকি`, `in ${n} days`);
  };

  const addTodo = () => {
    const text = draft.trim();
    if (!text) return;
    update((d) => ensureDay(d, date).todos.push({ id: uid(), text, done: false }));
    setDraft('');
  };
  const toggleHabit = (id) =>
    update((d) => {
      const tk = (d.habits.ticks[id] ??= {});
      if (tk[date]) delete tk[date];
      else tk[date] = 1;
    });

  const actions = [
    on('daily') && { k: 'daily', label: L('নতুন কাজ', 'New task'), onClick: () => addRef.current?.focus() },
    rep && { k: 'report', label: L('আজকের রিপোর্ট', "Today's report"), href: '#report' },
    on('money') && { k: 'money', label: L('খরচ লেখো', 'Add spending'), href: '#money' },
    on('habits') && { k: 'habits', label: L('অভ্যাস', 'Habits'), href: '#habits' },
    on('calendar') && { k: 'calendar', label: L('ক্যালেন্ডার', 'Calendar'), href: '#calendar' },
    on('weekly') && { k: 'weekly', label: L('এই সপ্তাহ', 'This week'), href: '#weekly' },
  ].filter(Boolean);

  return (
    <>
      {/* welcome banner */}
      <section className="hero">
        <div className="hero-main">
          <p className="hero-date">
            {fmtDate(date, lang)} · <b>{clock}</b>
          </p>
          <h1>
            {t(greet)}, {data.profile.name}
          </h1>
          <p className="hero-tip">💡 {tip}</p>
          <div className="hero-week" aria-label={L('গত ৭ দিন', 'Last 7 days')}>
            {week.map(({ d, active }) => (
              <span key={d} className={(active ? 'on ' : '') + (d === date ? 'is-today' : '')} title={fmtDate(d, lang)}>
                <small>{parse(d).toLocaleDateString(loc(lang), { weekday: 'narrow' })}</small>
                <i>{active ? '✓' : N(parse(d).getDate())}</i>
              </span>
            ))}
            <em>{L(`গত ৭ দিনে ${N(activeDays)} দিন কাজ হয়েছে`, `Active ${activeDays} of the last 7 days`)}</em>
          </div>
        </div>
        <ProgressRing pct={overall} label={D(overall) + '%'} caption={L('আজকের অগ্রগতি', "Today's progress")} />
      </section>

      {/* quick actions */}
      {actions.length > 0 && (
        <div className="quick">
          {actions.map((a) =>
            a.href ? (
              <a key={a.k} className="quick-btn" href={a.href}>
                <Icon name={a.k} />
                {a.label}
              </a>
            ) : (
              <button key={a.k} type="button" className="quick-btn" onClick={a.onClick}>
                <Icon name={a.k} />
                {a.label}
              </button>
            )
          )}
        </div>
      )}

      {on('routine') && (
        <a className="now" href="#routine">
          <span className="now-pulse" aria-hidden="true" />
          <div className="now-text">
            <span>{t('now_routine')}</span>
            <strong className={data.routine.length === 0 ? 'small' : ''}>{data.routine.length === 0 ? t('no_routine') : current ? current.title : t('free_time')}</strong>
            {nextBlock && (
              <small>
                {L('এরপর', 'Next')}: {nextBlock.title || '–'} · {fmtTime(nextBlock.start, lang)}
              </small>
            )}
          </div>
          {current && (
            <em>
              {fmtTime(current.start, lang)} – {fmtTime(current.end, lang)}
            </em>
          )}
        </a>
      )}

      <div className="home-grid">
        <div>
          {on('daily') && (
            <section className="card has-head" style={{ '--tone': '#2f4bd8' }}>
              <header className="card-h">
                <div>
                  <h3>{t('home_todos')}</h3>
                </div>
                {day.todos.length > 0 && <strong className="pill">{t('done_of', { a: N(todosDone), b: N(day.todos.length) })}</strong>}
              </header>
              {show.top && day.top.some((x) => x.text) && (
                <>
                  <p className="hint">{t('top3')}</p>
                  <ul className="list" style={{ marginBottom: 10 }}>
                    {day.top.map(
                      (x, k) =>
                        x.text && (
                          <li key={k} className={x.done ? 'done' : ''}>
                            <Check on={x.done} label={x.text} onClick={() => update((d) => (ensureDay(d, date).top[k].done = !x.done))} />
                            <span>{x.text}</span>
                          </li>
                        )
                    )}
                  </ul>
                </>
              )}
              {day.todos.length > 0 && <Bar value={todosDone} max={day.todos.length} color="var(--ok)" />}
              {day.todos.length === 0 ? (
                <p className="muted empty">{t('home_todos_empty')}</p>
              ) : (
                <ul className="list">
                  {day.todos.map((x, k) => (
                    <li key={x.id} className={x.done ? 'done' : ''}>
                      <Check on={x.done} label={x.text} onClick={() => update((d) => (ensureDay(d, date).todos[k].done = !x.done))} />
                      <span>{x.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="row add-row quick-add">
                <input ref={addRef} value={draft} placeholder={t('todo_ph')} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTodo()} />
                <button type="button" className="btn primary" onClick={addTodo}>
                  + {t('add')}
                </button>
              </div>
            </section>
          )}

          {on('habits') && habits.length > 0 && (
            <section className="card has-head" style={{ '--tone': '#17865a' }}>
              <header className="card-h">
                <div>
                  <h3>{t('habits_today')}</h3>
                  <p className="hint">🔥 {t('best_streak', { n: N(best) })}</p>
                </div>
                <strong className="pill">{t('done_of', { a: N(ticked), b: N(habits.length) })}</strong>
              </header>
              <div className="habit-chips">
                {habits.map((h) => (
                  <button key={h.id} type="button" className={'habit-chip' + (isTicked(h.id) ? ' on' : '')} aria-pressed={isTicked(h.id)} onClick={() => toggleHabit(h.id)}>
                    <i>{isTicked(h.id) ? '✓' : ''}</i>
                    {h.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div>
          {rep && (
            <a className={'home-tile' + (rep.behind ? ' behind' : '')} href="#report" style={{ '--tone': rep.behind ? '#c9354e' : '#17865a' }}>
              <span className="tile-icon">
                <Icon name="report" />
              </span>
              <div className="tile-body">
                <span>{t('rp_home')}</span>
                <strong>{rep.behind ? t('rp_behind', { n: N(rep.behind) }) : rep.hasPlan ? t('rp_ok') : t('rp_noplan')}</strong>
                <div className="parts" title={L(`আজকের ৭টা অংশের ${N(rep.parts)}টা লেখা হয়েছে`, `${rep.parts} of 7 parts written today`)}>
                  {Array.from({ length: 7 }, (_, k) => (
                    <i key={k} className={k < rep.parts ? 'on' : ''} />
                  ))}
                </div>
                <small>
                  {rep.todayDone ? t('rp_today_yes') : t('rp_today_no')} · {L(`${N(rep.parts)}/৭ অংশ`, `${rep.parts}/7 parts`)}
                </small>
              </div>
              <b className="tile-go">→</b>
            </a>
          )}

          {on('money') && (
            <a className="home-tile" href="#money" style={{ '--tone': '#b06f0a' }}>
              <span className="tile-icon">
                <Icon name="money" />
              </span>
              <div className="tile-body">
                <span>{t('this_month')}</span>
                <strong className={inc - out < 0 ? 'bad' : ''}>{M(inc - out)}</strong>
                {pct !== null && <Bar value={out} max={month.budget} color={pct > 100 ? 'var(--bad)' : pct > 80 ? '#f2a03d' : 'var(--ok)'} />}
                <small>{pct === null ? t('no_budget') : t('budget_used', { p: N(pct) })}</small>
              </div>
              <b className="tile-go">→</b>
            </a>
          )}

          {on('daily') && show.water && (
            <a className="home-tile" href="#daily" style={{ '--tone': '#0b7f8a' }}>
              <span className="tile-icon">💧</span>
              <div className="tile-body">
                <span>{t('water')}</span>
                <strong>{t('glasses', { n: N(day.water) })}</strong>
                <Bar value={day.water} max={8} color="#0e9aa7" />
              </div>
              <b className="tile-go">→</b>
            </a>
          )}

          {upcoming.length > 0 && (
            <section className="card has-head" style={{ '--tone': '#6d4de0' }}>
              <header className="card-h">
                <div>
                  <h3>{L('সামনে যা আছে', 'Coming up')}</h3>
                </div>
              </header>
              <ul className="upcoming">
                {upcoming.map((u) => (
                  <li key={u.kind + u.id}>
                    <a href={u.href}>
                      <span className="cal-chip">
                        <small>{parse(u.date).toLocaleDateString(loc(lang), { month: 'short' })}</small>
                        <b>{N(parse(u.date).getDate())}</b>
                      </span>
                      <span className="up-text">
                        <strong>{u.title}</strong>
                        <small>{u.kind === 'deadline' ? t('next_deadline') : fmtDate(u.date, lang, { weekday: 'long' })}</small>
                      </span>
                      <em className={daysBetween(date, u.date) <= 2 ? 'soon' : ''}>{inDays(u.date)}</em>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
