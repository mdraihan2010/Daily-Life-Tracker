import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, addDays, parse, loc, fmtDate, weekStart, uid } from '../utils.js';
import { Card, Field, Check, Del, AddRow, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const newWeek = () => ({ focus: '', tasks: [], note: '' });

export default function Weekly() {
  const { data, update, t, lang, N } = useApp();
  const ws = data.profile.weekStart ?? 6;
  const [tab, setTab] = useState('track');
  const [start, setStart] = useState(() => weekStart(today(), ws));
  const wk = data.weeks[start] || newWeek();
  const up = (fn) => update((d) => fn((d.weeks[start] ??= newWeek())));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const thisWeek = weekStart(today(), ws);
  const dayName = (d) => parse(d).toLocaleDateString(loc(lang), { weekday: 'long' });
  const dayShort = (d) => fmtDate(d, lang, { day: 'numeric', month: 'short' });
  const range = `${fmtDate(days[0], lang, { day: 'numeric', month: 'long' })} – ${fmtDate(days[6], lang, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const tasksOf = (i) => wk.tasks.filter((x) => x.day === i);

  return (
    <>
      <PageHead title={t('w_title')} sub={t('w_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      <div className="datebar">
        <button type="button" className="btn" onClick={() => setStart(addDays(start, -7))} aria-label="Previous week">
          ‹
        </button>
        <strong>{range}</strong>
        <button type="button" className="btn" onClick={() => setStart(addDays(start, 7))} aria-label="Next week">
          ›
        </button>
        {start !== thisWeek && (
          <button type="button" className="btn" onClick={() => setStart(thisWeek)}>
            {t('w_this')}
          </button>
        )}
      </div>

      {tab === 'track' ? (
        <>
          <Card>
            <Field label={t('w_focus')}>
              <input value={wk.focus} onChange={(e) => up((w) => (w.focus = e.target.value))} />
            </Field>
          </Card>
          <div className="week-grid">
            {days.map((d, i) => (
              <Card key={d} className={d === today() ? 'is-today' : ''} title={dayName(d)} right={<span className="muted">{dayShort(d)}</span>}>
                {tasksOf(i).map((x) => (
                  <div className={'row' + (x.done ? ' done' : '')} key={x.id}>
                    <Check on={x.done} label={x.text} onClick={() => up((w) => (w.tasks.find((y) => y.id === x.id).done = !x.done))} />
                    <input value={x.text} onChange={(e) => up((w) => (w.tasks.find((y) => y.id === x.id).text = e.target.value))} />
                    <Del onClick={() => up((w) => (w.tasks = w.tasks.filter((y) => y.id !== x.id)))} />
                  </div>
                ))}
                <AddRow placeholder={t('w_task_ph')} label={t('add')} onAdd={(text) => up((w) => w.tasks.push({ id: uid(), day: i, text, done: false }))} />
              </Card>
            ))}
            <Card title={t('w_note')}>
              <textarea rows="5" value={wk.note} onChange={(e) => up((w) => (w.note = e.target.value))} />
            </Card>
          </div>
        </>
      ) : (
        <Sheet title={t('w_title')} sub={range} file={'weekly-plan-' + start}>
          <div className="sh-banner">
            <span>{t('w_focus')}</span>
            <strong>{wk.focus}</strong>
          </div>
          <div className="sh-week">
            {days.map((d, i) => {
              const list = tasksOf(i);
              return (
                <div className="sh-day" key={d}>
                  <header>
                    <b>{dayName(d)}</b>
                    <em>{dayShort(d)}</em>
                  </header>
                  {Array.from({ length: Math.max(5, list.length) }, (_, k) => list[k]).map((x, k) => (
                    <div className="sh-line" key={k}>
                      <i className={'sh-box' + (x?.done ? ' on' : '')}>{x?.done ? '✓' : ''}</i>
                      <span>{x?.text}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            <div className="sh-day">
              <header>
                <b>{t('w_note')}</b>
              </header>
              <p className="sh-pre">{wk.note}</p>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
