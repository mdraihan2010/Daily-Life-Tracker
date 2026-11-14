import { useState } from 'react';
import { useApp, getMonth, ensureMonth } from '../store.jsx';
import { MONEY_CATS } from '../i18n.js';
import { today, fmtDate, uid } from '../utils.js';
import { Card, Field, Del, Tabs, PageHead, Ring, Bar, NumInput } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const sum = (a) => a.reduce((s, x) => s + (Number(x.amount) || 0), 0);

export default function Money() {
  const { data, update, t, lang, N, M } = useApp();
  const [tab, setTab] = useState('track');
  const [ym, setYm] = useState(today().slice(0, 7));
  const m = getMonth(data, ym);
  const up = (fn) => update((d) => fn(ensureMonth(d, ym)));

  const inc = sum(m.income);
  const out = sum(m.expense);
  const left = inc - out;
  const pct = m.budget > 0 ? Math.round((out / m.budget) * 100) : 0;
  const monthName = fmtDate(ym + '-01', lang, { month: 'long', year: 'numeric' });

  const byCat = {};
  m.expense.forEach((x) => (byCat[x.cat] = (byCat[x.cat] || 0) + (Number(x.amount) || 0)));
  const cats = Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const arcs = cats.map(([k, v]) => {
    const a = { from: acc / out, to: (acc + v) / out, color: MONEY_CATS[k] };
    acc += v;
    return a;
  });

  const Summary = () => (
    <div className="stats four">
      <div className="stat">
        <span>{t('m_in')}</span>
        <strong>{M(inc)}</strong>
      </div>
      <div className="stat">
        <span>{t('m_out')}</span>
        <strong>{M(out)}</strong>
      </div>
      <div className="stat">
        <span>{t('m_left')}</span>
        <strong className={left < 0 ? 'bad' : 'ok'}>{M(left)}</strong>
      </div>
      <div className="stat">
        <span>{t('m_used')}</span>
        <strong className={pct > 100 ? 'bad' : ''}>{m.budget > 0 ? N(pct) + '%' : '–'}</strong>
      </div>
    </div>
  );

  const Chart = ({ size = 200 }) =>
    cats.length === 0 ? (
      <p className="muted">{t('m_none')}</p>
    ) : (
      <div className="donut-row">
        <Ring arcs={arcs} size={size} width={32}>
          <text x={size / 2} y={size / 2 - 6} textAnchor="middle" className="ring-small">
            {t('m_out')}
          </text>
          <text x={size / 2} y={size / 2 + 18} textAnchor="middle" className="ring-big">
            {M(out)}
          </text>
        </Ring>
        <ul className="legend">
          {cats.map(([k, v]) => (
            <li key={k}>
              <i style={{ background: MONEY_CATS[k] }} />
              <span>{t('mc_' + k)}</span>
              <b>{M(v)}</b>
              <small>{N(Math.round((v / out) * 100))}%</small>
            </li>
          ))}
        </ul>
      </div>
    );

  const GoalBar = () =>
    m.goal > 0 && (
      <div className="goal">
        <div className="goal-h">
          <span>
            {t('m_goal_bar')}: {M(m.goal)}
          </span>
          <b>{N(Math.max(0, Math.min(100, Math.round((left / m.goal) * 100))))}%</b>
        </div>
        <Bar value={Math.max(0, left)} max={m.goal} color="var(--ok)" />
      </div>
    );

  return (
    <>
      <PageHead title={t('m_title')} sub={t('m_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <>
          <Summary />
          <div className="cols">
            <div>
              <Card title={monthName}>
                <Field label={t('m_month')}>
                  <input type="month" value={ym} onChange={(e) => /^\d{4}-\d{2}$/.test(e.target.value) && setYm(e.target.value)} />
                </Field>
                <div className="grid2">
                  <Field label={t('m_budget')}>
                    <NumInput value={m.budget || undefined} onChange={(v) => up((mm) => (mm.budget = v || 0))} />
                  </Field>
                  <Field label={t('m_goal')}>
                    <NumInput value={m.goal || undefined} onChange={(v) => up((mm) => (mm.goal = v || 0))} />
                  </Field>
                </div>
                <GoalBar />
              </Card>

              <Card title={t('m_income')} hint={t('m_income_hint')}>
                {m.income.map((x, i) => (
                  <div className="row" key={x.id}>
                    <input className="grow" value={x.title} placeholder={t('m_what')} onChange={(e) => up((mm) => (mm.income[i].title = e.target.value))} />
                    <NumInput className="w-amt" value={x.amount || undefined} placeholder={t('m_amount')} onChange={(v) => up((mm) => (mm.income[i].amount = v || 0))} />
                    <Del onClick={() => up((mm) => mm.income.splice(i, 1))} />
                  </div>
                ))}
                <button type="button" className="btn dashed" onClick={() => up((mm) => mm.income.push({ id: uid(), title: '', amount: 0 }))}>
                  + {t('add')}
                </button>
              </Card>
            </div>

            <div>
              <Card title={t('m_expense')}>
                {m.expense.map((x, i) => (
                  <div className="row wrap" key={x.id}>
                    <input className="grow" value={x.title} placeholder={t('m_what')} onChange={(e) => up((mm) => (mm.expense[i].title = e.target.value))} />
                    <select value={x.cat} onChange={(e) => up((mm) => (mm.expense[i].cat = e.target.value))}>
                      {Object.keys(MONEY_CATS).map((k) => (
                        <option key={k} value={k}>
                          {t('mc_' + k)}
                        </option>
                      ))}
                    </select>
                    <NumInput className="w-amt" value={x.amount || undefined} placeholder={t('m_amount')} onChange={(v) => up((mm) => (mm.expense[i].amount = v || 0))} />
                    <Del onClick={() => up((mm) => mm.expense.splice(i, 1))} />
                  </div>
                ))}
                <button type="button" className="btn dashed" onClick={() => up((mm) => mm.expense.push({ id: uid(), title: '', cat: 'food', amount: 0 }))}>
                  + {t('add')}
                </button>
              </Card>

              <Card title={t('m_bycat')}>
                <Chart />
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Sheet title={t('m_title')} sub={monthName} file={'money-' + ym}>
          <Summary />
          <h4 className="sh-h">{t('m_bycat')}</h4>
          <Chart size={190} />
          <div className="sh-cols even">
            <div>
              <h4 className="sh-h">{t('m_income')}</h4>
              {m.income.map((x) => (
                <div className="sh-pair" key={x.id}>
                  <span>{x.title}</span>
                  <b>{M(x.amount)}</b>
                </div>
              ))}
              <div className="sh-pair total">
                <span>{t('h_total')}</span>
                <b>{M(inc)}</b>
              </div>
            </div>
            <div>
              <h4 className="sh-h">{t('m_expense')}</h4>
              {m.expense.map((x) => (
                <div className="sh-pair" key={x.id}>
                  <span>{x.title}</span>
                  <b>{M(x.amount)}</b>
                </div>
              ))}
              <div className="sh-pair total">
                <span>{t('h_total')}</span>
                <b>{M(out)}</b>
              </div>
            </div>
          </div>
          <GoalBar />
          <p className="sh-note">{t('m_tip')}</p>
        </Sheet>
      )}
    </>
  );
}
