import { useState } from 'react';
import { useApp } from '../store.jsx';
import { EVENT_TYPES } from '../i18n.js';
import { today, addDays, parse, loc, fmtDate, uid } from '../utils.js';
import { Card, Field, Del, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

function MonthGrid({ ym, ws, events, lang, N }) {
  const first = parse(ym + '-01');
  const offset = (first.getDay() - ws + 7) % 7;
  const gridStart = addDays(ym + '-01', -offset);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => addDays(gridStart, i));
  return (
    <div className="cal">
      {cells.slice(0, 7).map((d) => (
        <div className="cal-h" key={d}>
          {parse(d).toLocaleDateString(loc(lang), { weekday: 'short' })}
        </div>
      ))}
      {cells.map((d) => (
        <div key={d} className={'cal-c' + (d.slice(0, 7) !== ym ? ' out' : '') + (d === today() ? ' is-now' : '')}>
          <b>{N(parse(d).getDate())}</b>
          {events
            .filter((e) => e.date === d)
            .map((e) => (
              <span key={e.id} style={{ background: EVENT_TYPES[e.type] }} title={e.title}>
                {e.title}
              </span>
            ))}
        </div>
      ))}
    </div>
  );
}

const Legend = ({ t }) => (
  <div className="cal-legend">
    {Object.entries(EVENT_TYPES).map(([k, c]) => (
      <span key={k}>
        <i style={{ background: c }} />
        {t('ev_' + k)}
      </span>
    ))}
  </div>
);

export default function Calendar() {
  const { data, update, t, lang, N } = useApp();
  const ws = data.profile.weekStart ?? 6;
  const [tab, setTab] = useState('track');
  const [ym, setYm] = useState(today().slice(0, 7));
  const [draft, setDraft] = useState({ date: today(), title: '', type: 'exam' });
  const monthName = fmtDate(ym + '-01', lang, { month: 'long', year: 'numeric' });
  const list = data.events.filter((e) => e.date.slice(0, 7) === ym).sort((a, b) => a.date.localeCompare(b.date));
  const note = data.monthNotes[ym] || '';
  const edit = (id, k, v) => update((d) => (d.events.find((e) => e.id === id)[k] = v));

  const move = (n) => {
    const d = parse(ym + '-01');
    d.setMonth(d.getMonth() + n);
    setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const add = () => {
    if (!draft.title.trim() || !draft.date) return;
    update((d) => d.events.push({ id: uid(), ...draft, title: draft.title.trim() }));
    setYm(draft.date.slice(0, 7));
    setDraft({ ...draft, title: '' });
  };

  return (
    <>
      <PageHead title={t('c_title')} sub={t('c_sub')}>
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
        {ym !== today().slice(0, 7) && (
          <button type="button" className="btn" onClick={() => setYm(today().slice(0, 7))}>
            {t('today')}
          </button>
        )}
      </div>

      {tab === 'track' ? (
        <>
          <Card>
            <MonthGrid ym={ym} ws={ws} events={data.events} lang={lang} N={N} />
            <Legend t={t} />
          </Card>

          <div className="cols">
            <div>
              <Card title={t('c_add')}>
                <div className="grid2">
                  <Field label={t('c_date')}>
                    <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                  </Field>
                  <Field label={t('c_what')}>
                    <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
                  </Field>
                </div>
                <div className="row wrap">
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} aria-label={t('c_type')}>
                    {Object.keys(EVENT_TYPES).map((k) => (
                      <option key={k} value={k}>
                        {t('ev_' + k)}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn primary" onClick={add}>
                    + {t('add')}
                  </button>
                </div>
              </Card>

              <Card title={t('c_weekstart')}>
                <select value={ws} onChange={(e) => update((d) => (d.profile.weekStart = Number(e.target.value)))} aria-label={t('c_weekstart')}>
                  {[6, 0, 1].map((n) => (
                    <option key={n} value={n}>
                      {new Date(2023, 0, 1 + n).toLocaleDateString(loc(lang), { weekday: 'long' })}
                    </option>
                  ))}
                </select>
              </Card>
            </div>

            <div>
              <Card title={t('c_list')}>
                {list.length === 0 && <p className="muted">{t('c_none')}</p>}
                {list.map((e) => (
                  <div className="event-row" key={e.id}>
                    <i style={{ background: EVENT_TYPES[e.type] }} />
                    <input type="date" value={e.date} onChange={(x) => x.target.value && edit(e.id, 'date', x.target.value)} aria-label={t('c_date')} />
                    <Del onClick={() => update((d) => (d.events = d.events.filter((y) => y.id !== e.id)))} />
                    <input value={e.title} onChange={(x) => edit(e.id, 'title', x.target.value)} aria-label={t('c_what')} />
                    <select value={e.type} onChange={(x) => edit(e.id, 'type', x.target.value)}>
                      {Object.keys(EVENT_TYPES).map((k) => (
                        <option key={k} value={k}>
                          {t('ev_' + k)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </Card>

              <Card title={t('c_note')}>
                <textarea rows="3" value={note} onChange={(e) => update((d) => (d.monthNotes[ym] = e.target.value))} />
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Sheet title={t('c_title')} sub={monthName} file={'calendar-' + ym}>
          <MonthGrid ym={ym} ws={ws} events={data.events} lang={lang} N={N} />
          <Legend t={t} />
          <h4 className="sh-h">{t('c_note')}</h4>
          <p className="sh-pre">{note}</p>
          <div className="sh-line tall" />
          <div className="sh-line tall" />
          <div className="sh-line tall" />
        </Sheet>
      )}
    </>
  );
}
