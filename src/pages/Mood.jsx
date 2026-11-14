import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, addDays, parse, loc, fmtDate } from '../utils.js';
import { Card, Field, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

export const MOODS = { 1: '#17865a', 2: '#7a9a1f', 3: '#f2a03d', 4: '#0b7f8a', 5: '#3b3f8f' };

export default function Mood() {
  const { data, update, t, lang, N } = useApp();
  const [tab, setTab] = useState('track');
  const [ym, setYm] = useState(today().slice(0, 7));
  const target = data.mood.target;
  const first = parse(ym + '-01');
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: count }, (_, i) => addDays(ym + '-01', i));
  const monthName = fmtDate(ym + '-01', lang, { month: 'long', year: 'numeric' });
  const get = (d) => data.mood.days[d] || {};
  const set = (d, k, v) =>
    update((x) => {
      const e = (x.mood.days[d] ??= {});
      if (v === '' || v === undefined) delete e[k];
      else e[k] = v;
    });

  const slept = days.map((d) => get(d).sleep).filter((v) => v > 0);
  const avg = slept.length ? Math.round((slept.reduce((a, b) => a + b, 0) / slept.length) * 10) / 10 : 0;
  const tally = {};
  days.forEach((d) => get(d).mood && (tally[get(d).mood] = (tally[get(d).mood] || 0) + 1));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
  const label = (d) => `${N(parse(d).getDate())} ${parse(d).toLocaleDateString(loc(lang), { weekday: 'short' })}`;

  const move = (n) => {
    const d = parse(ym + '-01');
    d.setMonth(d.getMonth() + n);
    setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const Legend = () => (
    <div className="cal-legend">
      {Object.entries(MOODS).map(([k, c]) => (
        <span key={k}>
          <i style={{ background: c, borderRadius: '50%' }} />
          {t('md_' + k)}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <PageHead title={t('md_title')} sub={t('md_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      <div className="datebar">
        <button type="button" className="btn" onClick={() => move(-1)} aria-label="Previous month">
          ‹
        </button>
        <strong>{monthName}</strong>
        <button type="button" className="btn" onClick={() => move(1)} aria-label="Next month">
          ›
        </button>
      </div>

      {tab === 'track' ? (
        <>
          <div className="stats">
            <div className="stat">
              <span>{t('md_avg')}</span>
              <strong className={avg && avg < target - 1 ? 'bad' : ''}>
                {N(avg)} {t('hours_short')}
              </strong>
              <small>{t('md_days', { n: N(slept.length) })}</small>
            </div>
            <div className="stat">
              <span>{t('md_most')}</span>
              <strong>{top ? t('md_' + top) : '–'}</strong>
            </div>
            <div className="stat">
              <Field label={t('md_target')}>
                <input type="number" min="1" max="14" step="0.5" value={target || ''} onChange={(e) => update((x) => (x.mood.target = Number(e.target.value) || 0))} />
              </Field>
            </div>
          </div>

          <Card hint={t('md_hint')} title={monthName}>
            <Legend />
            <div className="mood-list">
              {days.map((d) => {
                const e = get(d);
                const future = d > today();
                return (
                  <div className={'mood-row' + (d === today() ? ' is-today' : '')} key={d}>
                    <b>{label(d)}</b>
                    <div className="mood-dots" role="group" aria-label={t('md_mood')}>
                      {Object.entries(MOODS).map(([k, c]) => (
                        <button
                          type="button"
                          key={k}
                          disabled={future}
                          aria-pressed={e.mood === Number(k)}
                          aria-label={t('md_' + k)}
                          title={t('md_' + k)}
                          style={{ borderColor: c, background: e.mood === Number(k) ? c : 'transparent' }}
                          onClick={() => set(d, 'mood', e.mood === Number(k) ? '' : Number(k))}
                        />
                      ))}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      inputMode="decimal"
                      disabled={future}
                      value={e.sleep ?? ''}
                      placeholder={t('md_sleep')}
                      aria-label={t('md_sleep')}
                      onChange={(x) => set(d, 'sleep', x.target.value === '' ? '' : Math.min(24, Math.max(0, Number(x.target.value))))}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        <Sheet title={t('md_title')} sub={monthName} file={'mood-sleep-' + ym}>
          <div className="sh-moodtop">
            <Legend />
            <div>
              <b>{t('md_goal_line', { n: N(target) })}</b>
              <span>
                {t('md_avg')}: {N(avg)} {t('hours_short')} ({t('md_days', { n: N(slept.length) })})
              </span>
            </div>
          </div>
          <div className="sh-mood head">
            <span>{t('md_date')}</span>
            <span>{t('md_mood')}</span>
            <span>{t('md_sleep')}</span>
            <span>{t('md_note')}</span>
          </div>
          {days.map((d) => {
            const e = get(d);
            return (
              <div className="sh-mood" key={d}>
                <b>{label(d)}</b>
                <span className="dots">
                  {Object.entries(MOODS).map(([k, c]) => (
                    <i key={k} style={{ borderColor: c, background: e.mood === Number(k) ? c : 'transparent' }} />
                  ))}
                </span>
                <span className={e.sleep && e.sleep < target - 1 ? 'bad' : ''}>{e.sleep ? N(e.sleep) : ''}</span>
                <span />
              </div>
            );
          })}
        </Sheet>
      )}
    </>
  );
}
