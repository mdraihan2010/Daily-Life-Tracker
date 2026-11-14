import { useState } from 'react';
import { useApp } from '../store.jsx';
import { ROUTINE_CATS } from '../i18n.js';
import { toMin, span, fmtTime, uid } from '../utils.js';
import { Card, Del, Tabs, PageHead, Ring, Bar } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

function Clock({ blocks, t, N, size = 240 }) {
  const arcs = blocks.map((b) => {
    const from = toMin(b.start) / 1440;
    return { from, to: from + span(b.start, b.end) / 1440, color: ROUTINE_CATS[b.cat] || ROUTINE_CATS.other };
  });
  const c = size / 2;
  return (
    <Ring arcs={arcs} size={size} width={38}>
      <text x={c} y={c - 2} textAnchor="middle" className="ring-big">
        {t('r_24')}
      </text>
      <text x={c} y={66} textAnchor="middle" className="ring-small">{N(0)}</text>
      <text x={size - 60} y={c + 4} textAnchor="middle" className="ring-small">{N(6)}</text>
      <text x={c} y={size - 58} textAnchor="middle" className="ring-small">{N(12)}</text>
      <text x={60} y={c + 4} textAnchor="middle" className="ring-small">{N(18)}</text>
    </Ring>
  );
}

export default function Routine() {
  const { data, update, t, lang, N } = useApp();
  const [tab, setTab] = useState('track');
  const blocks = data.routine;
  const sorted = [...blocks].sort((a, b) => toMin(a.start) - toMin(b.start));
  const set = (id, k, v) => update((d) => (d.routine.find((b) => b.id === id)[k] = v));

  const totals = {};
  blocks.forEach((b) => (totals[b.cat] = (totals[b.cat] || 0) + span(b.start, b.end)));
  const cats = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const planned = cats.reduce((s, [, m]) => s + m, 0) / 60;
  const maxCat = cats[0]?.[1] || 1;

  const addBlock = () =>
    update((d) => {
      const last = [...d.routine].sort((a, b) => toMin(a.start) - toMin(b.start)).at(-1);
      const start = last ? last.end : '06:00';
      const end = String((Math.floor(toMin(start) / 60) + 1) % 24).padStart(2, '0') + ':' + start.slice(3);
      d.routine.push({ id: uid(), start, end, title: '', cat: 'other' });
    });

  const CatBars = () => (
    <div className="catbars">
      {cats.map(([k, m]) => (
        <div className="catbar" key={k}>
          <span>{t('rc_' + k)}</span>
          <Bar value={m} max={maxCat} color={ROUTINE_CATS[k]} />
          <b>
            {N(Math.round((m / 60) * 10) / 10)} {t('hours_short')}
          </b>
        </div>
      ))}
      <p className="hint">{t('r_total', { h: N(Math.round(planned * 10) / 10) })}</p>
    </div>
  );

  return (
    <>
      <PageHead title={t('r_title')} sub={t('r_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <div className="cols">
          <Card title={t('r_blocks')} hint={t('r_hint')}>
            {sorted.map((b) => (
              <div className="block-row" key={b.id}>
                <i style={{ background: ROUTINE_CATS[b.cat] }} />
                <input type="time" value={b.start} onChange={(e) => set(b.id, 'start', e.target.value)} aria-label="Start" />
                <input type="time" value={b.end} onChange={(e) => set(b.id, 'end', e.target.value)} aria-label="End" />
                <input className="grow" value={b.title} placeholder={t('r_what')} onChange={(e) => set(b.id, 'title', e.target.value)} />
                <select value={b.cat} onChange={(e) => set(b.id, 'cat', e.target.value)}>
                  {Object.keys(ROUTINE_CATS).map((k) => (
                    <option key={k} value={k}>
                      {t('rc_' + k)}
                    </option>
                  ))}
                </select>
                <Del onClick={() => update((d) => (d.routine = d.routine.filter((x) => x.id !== b.id)))} />
              </div>
            ))}
            <button type="button" className="btn dashed" onClick={addBlock}>
              + {t('r_add')}
            </button>
          </Card>

          <div>
            <Card>
              <div className="center">
                <Clock blocks={blocks} t={t} N={N} />
              </div>
            </Card>
            <Card title={t('r_bycat')}>
              <CatBars />
            </Card>
          </div>
        </div>
      ) : (
        <Sheet title={t('r_title')} sub={t('r_sub')} file="daily-routine">
          <div className="sh-cols">
            <div>
              <div className="center">
                <Clock blocks={blocks} t={t} N={N} size={260} />
              </div>
              <h4 className="sh-h">{t('r_bycat')}</h4>
              <CatBars />
            </div>
            <div>
              <h4 className="sh-h">{t('schedule')}</h4>
              {sorted.map((b) => (
                <div className="sh-block" key={b.id}>
                  <i style={{ background: ROUTINE_CATS[b.cat] }} />
                  <em>
                    {fmtTime(b.start, lang)} – {fmtTime(b.end, lang)}
                  </em>
                  <span>{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
