import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, addDays, parse, loc, fmtDate, weekStart } from '../utils.js';
import { Card, Field, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const newDay = () => ({ g: ['', '', ''], best: '' });
const QUESTIONS = ['j_q1', 'j_q2', 'j_q3'];

export default function Journal() {
  const { data, update, t, lang, N } = useApp();
  const ws = data.profile.weekStart ?? 6;
  const [tab, setTab] = useState('track');
  const [start, setStart] = useState(() => weekStart(today(), ws));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const thisWeek = weekStart(today(), ws);
  const get = (d) => data.journal.days[d] || newDay();
  const upDay = (d, fn) => update((x) => fn((x.journal.days[d] ??= newDay())));
  const review = data.journal.weeks[start] || ['', '', ''];
  const dayName = (d) => parse(d).toLocaleDateString(loc(lang), { weekday: 'long' });
  const dayShort = (d) => fmtDate(d, lang, { day: 'numeric', month: 'short' });
  const range = `${fmtDate(days[0], lang, { day: 'numeric', month: 'long' })} – ${fmtDate(days[6], lang, { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <>
      <PageHead title={t('j_title')} sub={t('j_sub')}>
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
        <div className="week-grid">
          {days.map((d) => {
            const e = get(d);
            return (
              <Card key={d} className={d === today() ? 'is-today' : ''} title={dayName(d)} hint={t('j_three')} right={<span className="muted">{dayShort(d)}</span>}>
                {e.g.map((v, k) => (
                  <div className="row" key={k}>
                    <b className="num">{N(k + 1)}</b>
                    <input value={v} aria-label={`${t('j_three')} ${k + 1}`} onChange={(x) => upDay(d, (y) => (y.g[k] = x.target.value))} />
                  </div>
                ))}
                <Field label={t('j_best')}>
                  <input value={e.best} onChange={(x) => upDay(d, (y) => (y.best = x.target.value))} />
                </Field>
              </Card>
            );
          })}
          <Card title={t('j_review')} className="review">
            {QUESTIONS.map((q, k) => (
              <Field label={t(q)} key={q}>
                <textarea rows="2" value={review[k]} onChange={(x) => update((y) => ((y.journal.weeks[start] ??= ['', '', ''])[k] = x.target.value))} />
              </Field>
            ))}
          </Card>
        </div>
      ) : (
        <Sheet title={t('j_title')} sub={range} file={'journal-' + start}>
          <div className="sh-week">
            {days.map((d) => {
              const e = get(d);
              return (
                <div className="sh-day" key={d}>
                  <header>
                    <b>{dayName(d)}</b>
                    <em>{dayShort(d)}</em>
                  </header>
                  <p className="sh-tiny">{t('j_three')}</p>
                  {e.g.map((v, k) => (
                    <div className="sh-line" key={k}>
                      <b className="sh-num">{N(k + 1)}</b>
                      <span>{v}</span>
                    </div>
                  ))}
                  <p className="sh-tiny">{t('j_best')}</p>
                  <div className="sh-line">
                    <span>{e.best}</span>
                  </div>
                </div>
              );
            })}
            <div className="sh-day review">
              <header>
                <b>{t('j_review')}</b>
              </header>
              {QUESTIONS.map((q, k) => (
                <div key={q}>
                  <p className="sh-tiny strong">{t(q)}</p>
                  <div className="sh-line">
                    <span>{review[k]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
