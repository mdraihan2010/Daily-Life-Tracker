import { useState } from 'react';
import { useApp } from '../store.jsx';
import { GOAL_AREAS } from '../i18n.js';
import { loc, uid } from '../utils.js';
import { Card, Field, Check, Del, Tabs, PageHead } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const newYear = () => ({ word: '', list: [], months: {} });
const newGoal = () => ({ id: uid(), title: '', area: 'study', by: '', why: '', steps: [0, 1, 2].map(() => ({ text: '', done: false })) });

export default function Goals() {
  const { data, update, t, lang, N } = useApp();
  const [tab, setTab] = useState('track');
  const [year, setYear] = useState(new Date().getFullYear());
  const g = data.goals[year] || newYear();
  const up = (fn) => update((d) => fn((d.goals[year] ??= newYear())));
  const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(loc(lang), { month: 'long' }));
  const yearText = N(year).replace(/[,،]/g, '');

  return (
    <>
      <PageHead title={t('g_title')} sub={t('g_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <>
          <Card>
            <div className="grid2">
              <Field label={t('g_year')}>
                <input type="number" min="2000" max="2100" value={year} onChange={(e) => Number(e.target.value) > 999 && setYear(Number(e.target.value))} />
              </Field>
              <Field label={t('g_word')}>
                <input value={g.word} placeholder={t('g_word_ph')} onChange={(e) => up((x) => (x.word = e.target.value))} />
              </Field>
            </div>
          </Card>

          <h3 className="group-title">{t('g_goals')}</h3>
          <p className="hint" style={{ marginBottom: 12 }}>
            {t('g_hint')}
          </p>
          <div className="cols">
            {g.list.map((goal, i) => (
              <Card key={goal.id} className="goal-card" title={t('g_goal', { n: N(i + 1) })} right={<Del onClick={() => up((x) => x.list.splice(i, 1))} />}>
                <i className="goal-stripe" style={{ background: GOAL_AREAS[goal.area] }} />
                <Field label={t('g_what')}>
                  <input value={goal.title} onChange={(e) => up((x) => (x.list[i].title = e.target.value))} />
                </Field>
                <div className="grid2">
                  <Field label={t('g_area')}>
                    <select value={goal.area} onChange={(e) => up((x) => (x.list[i].area = e.target.value))}>
                      {Object.keys(GOAL_AREAS).map((k) => (
                        <option key={k} value={k}>
                          {t('ga_' + k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('g_by')}>
                    <input value={goal.by} onChange={(e) => up((x) => (x.list[i].by = e.target.value))} />
                  </Field>
                </div>
                <Field label={t('g_why')}>
                  <input value={goal.why} onChange={(e) => up((x) => (x.list[i].why = e.target.value))} />
                </Field>
                {goal.steps.map((s, k) => (
                  <div className={'row' + (s.done ? ' done' : '')} key={k}>
                    <Check on={s.done} label={t('g_step', { n: N(k + 1) })} onClick={() => up((x) => (x.list[i].steps[k].done = !s.done))} />
                    <input value={s.text} placeholder={t('g_step', { n: N(k + 1) })} onChange={(e) => up((x) => (x.list[i].steps[k].text = e.target.value))} />
                  </div>
                ))}
              </Card>
            ))}
          </div>
          {g.list.length < 6 && (
            <button type="button" className="btn dashed" style={{ marginBottom: 16 }} onClick={() => up((x) => x.list.push(newGoal()))}>
              + {t('g_add')}
            </button>
          )}

          <Card title={t('g_months')} hint={t('g_months_hint')}>
            <div className="months">
              {months.map((m, i) => (
                <Field label={m} key={i}>
                  <input value={g.months[i + 1] || ''} onChange={(e) => up((x) => (x.months[i + 1] = e.target.value))} />
                </Field>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Sheet title={t('g_title')} sub={t('g_sheet_sub', { y: yearText })} file={'goals-' + year}>
          <div className="sh-banner">
            <span>{t('g_word')}</span>
            <strong>{g.word}</strong>
          </div>
          <h4 className="sh-h">{t('g_goals')}</h4>
          <div className="sh-goals">
            {g.list.map((goal) => (
              <div className="sh-goal" key={goal.id} style={{ borderTopColor: GOAL_AREAS[goal.area] }}>
                <em style={{ background: GOAL_AREAS[goal.area] }}>{t('ga_' + goal.area)}</em>
                <strong>{goal.title}</strong>
                <p>{[goal.why, goal.by && t('g_deadline', { d: goal.by })].filter(Boolean).join(' · ')}</p>
                {goal.steps.map((s, k) => (
                  <div className="sh-line" key={k}>
                    <i className={'sh-box' + (s.done ? ' on' : '')}>{s.done ? '✓' : ''}</i>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <h4 className="sh-h">{t('g_months')}</h4>
          <div className="sh-months">
            {months.map((m, i) => (
              <div key={i}>
                <b>{m}</b>
                <span>{g.months[i + 1]}</span>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
