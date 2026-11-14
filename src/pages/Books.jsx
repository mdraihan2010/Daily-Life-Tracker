import { useState } from 'react';
import { useApp } from '../store.jsx';
import { uid } from '../utils.js';
import { Card, Field, Del, Tabs, PageHead, Bar, NumInput } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const newYear = () => ({ target: 12, list: [], skills: [] });
const STATUS = { done: '#17865a', reading: '#b06f0a', todo: '#5f6b80' };
const SKILL_COLORS = ['#2f4bd8', '#0b7f8a', '#6d4de0', '#b83280', '#17865a'];

export default function Books() {
  const { data, update, t, N } = useApp();
  const [tab, setTab] = useState('track');
  const [year, setYear] = useState(new Date().getFullYear());
  const b = data.books[year] || newYear();
  const up = (fn) => update((d) => fn((d.books[year] ??= newYear())));
  const n = (s) => b.list.filter((x) => x.status === s).length;
  const yearText = N(year).replace(/[,،]/g, '');

  const Summary = () => (
    <>
      <div className="stats four">
        <div className="stat">
          <span>{t('b_goal')}</span>
          <strong>{N(b.target)}</strong>
        </div>
        <div className="stat">
          <span>{t('b_done')}</span>
          <strong className="ok">{N(n('done'))}</strong>
        </div>
        <div className="stat">
          <span>{t('b_reading')}</span>
          <strong>{N(n('reading'))}</strong>
        </div>
        <div className="stat">
          <span>{t('b_todo')}</span>
          <strong>{N(n('todo'))}</strong>
        </div>
      </div>
      <div className="goal">
        <div className="goal-h">
          <span>{t('b_goal')}</span>
          <b>{t('b_of', { a: N(n('done')), b: N(b.target) })}</b>
        </div>
        <Bar value={n('done')} max={b.target} color="var(--ok)" />
      </div>
    </>
  );

  const SkillBars = () =>
    b.skills.map((s, i) => (
      <div className="goal" key={s.id}>
        <div className="goal-h">
          <span>
            <strong>{s.name}</strong>
            {s.source && ` · ${s.source}`}
          </span>
          <b>{N(s.pct)}%</b>
        </div>
        <Bar value={s.pct} max={100} color={SKILL_COLORS[i % SKILL_COLORS.length]} />
      </div>
    ));

  return (
    <>
      <PageHead title={t('b_title')} sub={t('b_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <>
          <Card>
            <div className="grid2">
              <Field label={t('g_year')}>
                <NumInput value={year} max={2100} onChange={(v) => v > 999 && setYear(Math.round(v))} />
              </Field>
              <Field label={t('b_target')}>
                <NumInput value={b.target || undefined} onChange={(v) => up((x) => (x.target = v || 0))} />
              </Field>
            </div>
            <Summary />
          </Card>

          <div className="cols">
            <Card title={t('b_books')}>
              {b.list.map((x, i) => (
                <div className="book-row" key={x.id}>
                  <i style={{ background: STATUS[x.status] }} />
                  <input value={x.title} placeholder={t('b_name')} onChange={(e) => up((y) => (y.list[i].title = e.target.value))} />
                  <Del onClick={() => up((y) => y.list.splice(i, 1))} />
                  <input value={x.author} placeholder={t('b_author')} onChange={(e) => up((y) => (y.list[i].author = e.target.value))} />
                  <div className="book-meta">
                    <select value={x.status} aria-label={t('b_status')} onChange={(e) => up((y) => (y.list[i].status = e.target.value))}>
                      {Object.keys(STATUS).map((k) => (
                        <option key={k} value={k}>
                          {t('b_' + k)}
                        </option>
                      ))}
                    </select>
                    <select value={x.rating} aria-label={t('b_rating')} onChange={(e) => up((y) => (y.list[i].rating = Number(e.target.value)))}>
                      {[0, 1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {r ? '★'.repeat(r) : t('b_rating')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button type="button" className="btn dashed" onClick={() => up((y) => y.list.push({ id: uid(), title: '', author: '', status: 'todo', rating: 0 }))}>
                + {t('add')}
              </button>
            </Card>

            <Card title={t('b_skills')}>
              {b.skills.map((s, i) => (
                <div className="fin-block" key={s.id}>
                  <div className="row">
                    <input value={s.name} placeholder={t('b_skill')} onChange={(e) => up((y) => (y.skills[i].name = e.target.value))} />
                    <Del onClick={() => up((y) => y.skills.splice(i, 1))} />
                  </div>
                  <div className="grid2">
                    <Field label={t('b_source')}>
                      <input value={s.source} onChange={(e) => up((y) => (y.skills[i].source = e.target.value))} />
                    </Field>
                    <Field label={t('b_pct')}>
                      <NumInput value={s.pct || undefined} max={100} onChange={(v) => up((y) => (y.skills[i].pct = v || 0))} />
                    </Field>
                  </div>
                  <Bar value={s.pct} max={100} color={SKILL_COLORS[i % SKILL_COLORS.length]} />
                </div>
              ))}
              <button type="button" className="btn dashed" onClick={() => up((y) => y.skills.push({ id: uid(), name: '', source: '', pct: 0 }))}>
                + {t('add')}
              </button>
            </Card>
          </div>
        </>
      ) : (
        <Sheet title={t('b_title')} sub={t('b_sheet_sub', { y: yearText })} file={'books-' + year}>
          <Summary />
          <h4 className="sh-h">{t('b_shelf')}</h4>
          <div className="sh-book head">
            <span>#</span>
            <span>{t('b_name')}</span>
            <span>{t('b_author')}</span>
            <span>{t('b_status')}</span>
            <span>{t('b_rating')}</span>
          </div>
          {b.list.map((x, i) => (
            <div className="sh-book" key={x.id}>
              <span>{N(i + 1)}</span>
              <b>{x.title}</b>
              <span>{x.author}</span>
              <span>
                <em style={{ background: STATUS[x.status] }}>{t('b_' + x.status)}</em>
              </span>
              <span className="stars">{'★'.repeat(x.rating)}</span>
            </div>
          ))}
          <div className="sh-cols even" style={{ marginTop: 18 }}>
            <div>
              <h4 className="sh-h">{t('b_learning')}</h4>
              <SkillBars />
            </div>
            <div>
              <h4 className="sh-h">{t('b_next')}</h4>
              {[0, 1, 2, 3, 4].map((k) => (
                <div className="sh-line tall" key={k} />
              ))}
            </div>
          </div>
          <p className="sh-note">{t('b_tip')}</p>
        </Sheet>
      )}
    </>
  );
}
