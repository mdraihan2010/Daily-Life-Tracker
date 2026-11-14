import { useState } from 'react';
import { useApp, streak } from '../store.jsx';
import { habitIdeas } from '../personas.js';
import { today, addDays, parse, loc, fmtDate, uid } from '../utils.js';
import { Card, Field, Check, Del, AddRow, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

export default function Habits() {
  const { data, update, t, lang, N } = useApp();
  const [tab, setTab] = useState('track');
  const h = data.habits;
  const now = today();
  const days = Array.from({ length: h.days }, (_, i) => addDays(h.start, i));
  const over = now > days.at(-1);
  const elapsed = days.filter((d) => d <= now).length;
  const count = (id) => days.filter((d) => h.ticks[id]?.[d]).length;
  const totalTicks = h.list.reduce((s, x) => s + count(x.id), 0);
  const pct = h.list.length && elapsed ? Math.round((totalTicks / (h.list.length * elapsed)) * 100) : 0;
  const title = h.title || t('h_name_ph');
  const ideas = habitIdeas(data.profile.persona, lang).filter((x) => !h.list.some((y) => y.name === x));

  const toggle = (id, d) =>
    update((dd) => {
      const tk = (dd.habits.ticks[id] ??= {});
      if (tk[d]) delete tk[d];
      else tk[d] = 1;
    });
  const addHabit = (name) => update((d) => d.habits.list.push({ id: uid(), name }));
  const dayNum = (d) => N(parse(d).getDate());
  const dayName = (d) => parse(d).toLocaleDateString(loc(lang), { weekday: 'narrow' });
  const range = `${fmtDate(days[0], lang, { day: 'numeric', month: 'long' })} – ${fmtDate(days.at(-1), lang, { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <>
      <PageHead title={t('h_title')} sub={t('h_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <>
          {over && (
            <div className="notice">
              {t('h_over')}{' '}
              <button type="button" className="btn" onClick={() => update((d) => (d.habits.start = now))}>
                {t('h_restart')}
              </button>
            </div>
          )}

          <div className="cols">
            <Card title={t('h_today')} hint={fmtDate(now, lang)}>
              {h.list.length === 0 && <p className="muted">{t('h_empty')}</p>}
              <ul className="list">
                {h.list.map((x) => {
                  const on = !!h.ticks[x.id]?.[now];
                  return (
                    <li key={x.id} className={on ? 'done' : ''}>
                      <Check on={on} label={x.name} onClick={() => toggle(x.id, now)} />
                      <span>{x.name}</span>
                      <small className="streak">{t('best_streak', { n: N(streak(h.ticks, x.id)) })}</small>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <div>
              <Card title={t('h_setup')}>
                <Field label={t('h_name')}>
                  <input value={h.title} placeholder={t('h_name_ph')} onChange={(e) => update((d) => (d.habits.title = e.target.value))} />
                </Field>
                <div className="grid2">
                  <Field label={t('h_start')}>
                    <input type="date" value={h.start} onChange={(e) => e.target.value && update((d) => (d.habits.start = e.target.value))} />
                  </Field>
                  <Field label={t('h_len')}>
                    <select value={h.days} onChange={(e) => update((d) => (d.habits.days = Number(e.target.value)))}>
                      {[7, 21, 30].map((n) => (
                        <option key={n} value={n}>
                          {t('h_days', { n: N(n) })}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={t('h_reward')}>
                  <input value={h.reward} onChange={(e) => update((d) => (d.habits.reward = e.target.value))} />
                </Field>
              </Card>

              <Card title={t('h_list')}>
                {h.list.map((x, i) => (
                  <div className="row" key={x.id}>
                    <input value={x.name} onChange={(e) => update((d) => (d.habits.list[i].name = e.target.value))} />
                    <Del onClick={() => update((d) => d.habits.list.splice(i, 1))} />
                  </div>
                ))}
                <AddRow placeholder={t('h_ph')} label={t('add')} onAdd={addHabit} />
                {ideas.length > 0 && (
                  <div className="chips">
                    <span className="hint">{t('h_suggest')}</span>
                    {ideas.map((x) => (
                      <button type="button" className="chip" key={x} onClick={() => addHabit(x)}>
                        + {x}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {h.list.length > 0 && (
            <Card title={t('h_grid')} hint={`${range} · ${t('h_progress', { p: N(pct) })}`}>
              <div className="grid-scroll">
                <table className="hgrid">
                  <thead>
                    <tr>
                      <th>{t('h_habit')}</th>
                      {days.map((d) => (
                        <th key={d} className={d === now ? 'now-col' : ''}>
                          {dayNum(d)}
                          <small>{dayName(d)}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {h.list.map((x) => (
                      <tr key={x.id}>
                        <th>{x.name}</th>
                        {days.map((d) => (
                          <td key={d} className={d === now ? 'now-col' : ''}>
                            <Check on={!!h.ticks[x.id]?.[d]} disabled={d > now} label={`${x.name} ${d}`} onClick={() => toggle(x.id, d)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Sheet title={title} sub={range} file="habit-tracker">
          <table className={'sh-grid d' + h.days}>
            <thead>
              <tr>
                <th>{t('h_habit')}</th>
                {days.map((d) => (
                  <th key={d}>
                    {dayNum(d)}
                    <small>{dayName(d)}</small>
                  </th>
                ))}
                <th>{t('h_total')}</th>
              </tr>
            </thead>
            <tbody>
              {h.list.map((x) => (
                <tr key={x.id}>
                  <th>{x.name}</th>
                  {days.map((d) => (
                    <td key={d}>{h.ticks[x.id]?.[d] ? '✓' : ''}</td>
                  ))}
                  <td>{count(x.id) ? N(count(x.id)) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="sh-note">{t('h_rule')}</p>
          <h4 className="sh-h">{t('h_reward')}</h4>
          <div className="sh-line tall">
            <span>{h.reward}</span>
          </div>
        </Sheet>
      )}
    </>
  );
}
