import { useState } from 'react';
import { useApp, ensureDay, getDay } from '../store.jsx';
import { today, addDays, fmtDate, fmtTime, toMin, uid, pad } from '../utils.js';
import { Card, Check, Del, AddRow, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM to 11 PM

export default function Daily() {
  const { data, update, t, lang, N } = useApp();
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState('track');
  const [time, setTime] = useState('10:00');
  const day = getDay(data, date);
  const up = (fn) => update((d) => fn(ensureDay(d, date)));
  const timed = [...day.timed].sort((a, b) => toMin(a.time) - toMin(b.time));

  return (
    <>
      <PageHead title={t('d_title')} sub={t('d_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      <div className="datebar">
        <button type="button" className="btn" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
          ‹
        </button>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button type="button" className="btn" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
          ›
        </button>
        {date !== today() && (
          <button type="button" className="btn" onClick={() => setDate(today())}>
            {t('today')}
          </button>
        )}
        <span className="muted">{fmtDate(date, lang)}</span>
      </div>

      {tab === 'track' ? (
        <div className="cols">
          <div>
            <Card title={t('top3')} hint={t('d_top_hint')}>
              {day.top.map((x, i) => (
                <div className={'row' + (x.done ? ' done' : '')} key={i}>
                  <Check on={x.done} label={t('task_n', { n: N(i + 1) })} onClick={() => up((dd) => (dd.top[i].done = !x.done))} />
                  <input value={x.text} placeholder={t('task_n', { n: N(i + 1) })} onChange={(e) => up((dd) => (dd.top[i].text = e.target.value))} />
                </div>
              ))}
            </Card>

            <Card title={t('todos')}>
              {day.todos.map((x, i) => (
                <div className={'row' + (x.done ? ' done' : '')} key={x.id}>
                  <Check on={x.done} label={x.text} onClick={() => up((dd) => (dd.todos[i].done = !x.done))} />
                  <input value={x.text} onChange={(e) => up((dd) => (dd.todos[i].text = e.target.value))} />
                  <Del onClick={() => up((dd) => dd.todos.splice(i, 1))} />
                </div>
              ))}
              <AddRow placeholder={t('todo_ph')} label={t('add')} onAdd={(text) => up((dd) => dd.todos.push({ id: uid(), text, done: false }))} />
            </Card>
          </div>

          <div>
            <Card title={t('timed')}>
              {timed.map((x) => (
                <div className="row" key={x.id}>
                  <span className="time-pill">{fmtTime(x.time, lang)}</span>
                  <span className="grow">{x.text}</span>
                  <Del onClick={() => up((dd) => (dd.timed = dd.timed.filter((y) => y.id !== x.id)))} />
                </div>
              ))}
              <div className="row">
                <input type="time" className="w-time" value={time} onChange={(e) => setTime(e.target.value)} aria-label={t('schedule')} />
              </div>
              <AddRow placeholder={t('timed_ph')} label={t('add')} onAdd={(text) => up((dd) => dd.timed.push({ id: uid(), time: time || '10:00', text }))} />
            </Card>

            <Card title={t('water')} hint={t('water_hint')} right={<strong>{t('glasses', { n: N(day.water) })}</strong>}>
              <div className="glasses">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={'glass' + (i < day.water ? ' on' : '')}
                    aria-label={t('glasses', { n: N(i + 1) })}
                    onClick={() => up((dd) => (dd.water = dd.water === i + 1 ? i : i + 1))}
                  />
                ))}
              </div>
            </Card>

            <Card title={t('gratitude')}>
              <textarea rows="2" value={day.gratitude} placeholder={t('gratitude_ph')} onChange={(e) => up((dd) => (dd.gratitude = e.target.value))} />
            </Card>
          </div>
        </div>
      ) : (
        <Sheet title={t('d_title')} sub={fmtDate(date, lang)} file={'daily-plan-' + date}>
          <div className="sh-cols">
            <div>
              <h4 className="sh-h">{t('top3')}</h4>
              {day.top.map((x, i) => (
                <div className="sh-top" key={i}>
                  <b>{N(i + 1)}</b>
                  <span className={x.done ? 'struck' : ''}>{x.text}</span>
                </div>
              ))}

              <h4 className="sh-h">{t('todos')}</h4>
              {Array.from({ length: Math.max(8, day.todos.length) }, (_, i) => day.todos[i]).map((x, i) => (
                <div className="sh-line" key={i}>
                  <i className={'sh-box' + (x?.done ? ' on' : '')}>{x?.done ? '✓' : ''}</i>
                  <span>{x?.text}</span>
                </div>
              ))}

              <h4 className="sh-h">{t('water')}</h4>
              <div className="sh-glasses">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} className={i < day.water ? 'on' : ''} />
                ))}
              </div>

              <h4 className="sh-h">{t('gratitude')}</h4>
              <div className="sh-line tall">
                <span>{day.gratitude}</span>
              </div>
              <div className="sh-line tall" />
            </div>

            <div>
              <h4 className="sh-h">{t('schedule')}</h4>
              {HOURS.map((h) => (
                <div className="sh-hour" key={h}>
                  <em>{fmtTime(pad(h) + ':00', lang)}</em>
                  <span>
                    {timed
                      .filter((x) => Math.floor(toMin(x.time) / 60) === h)
                      .map((x) => `${fmtTime(x.time, lang)}  ${x.text}`)
                      .join(' · ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
