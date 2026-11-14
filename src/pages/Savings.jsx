import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, parse, loc, uid } from '../utils.js';
import { Card, Field, Del, Tabs, PageHead, Bar } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

const numIn = (v) => Math.max(0, Number(v) || 0);
const Num = ({ value, onChange }) => <input type="number" min="0" inputMode="numeric" value={value || ''} onChange={(e) => onChange(numIn(e.target.value))} />;
const COLORS = ['#17865a', '#0b7f8a', '#b06f0a', '#6d4de0', '#2f4bd8', '#b83280'];

export default function Savings() {
  const { data, update, t, lang, N, M } = useApp();
  const [tab, setTab] = useState('track');
  const s = data.savings;
  const up = (fn) => update((d) => fn(d.savings));

  const e = s.emergency;
  const eTarget = e.monthly * e.months;
  const ePct = eTarget > 0 ? Math.min(100, Math.round((e.saved / eTarget) * 100)) : 0;
  const totalSaved = e.saved + s.goals.reduce((a, g) => a + g.saved, 0);
  const debtLeft = s.debts.reduce((a, d) => a + Math.max(0, d.total - d.paid), 0);
  const inst = s.debts.reduce((a, d) => a + (d.total > d.paid ? d.monthly : 0), 0);
  const monthsFor = (d) => (d.monthly > 0 && d.total > d.paid ? Math.ceil((d.total - d.paid) / d.monthly) : null);
  const pctOf = (g) => (g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0);

  const Summary = () => (
    <div className="stats four">
      <div className="stat">
        <span>{t('sv_saved')}</span>
        <strong className="ok">{M(totalSaved)}</strong>
      </div>
      <div className="stat">
        <span>{t('sv_emg')}</span>
        <strong>{N(ePct)}%</strong>
      </div>
      <div className="stat">
        <span>{t('sv_debt_left')}</span>
        <strong className={debtLeft > 0 ? 'bad' : ''}>{M(debtLeft)}</strong>
      </div>
      <div className="stat">
        <span>{t('sv_inst_total')}</span>
        <strong>{M(inst)}</strong>
      </div>
    </div>
  );

  const EmgBar = () => (
    <div className="goal">
      <div className="goal-h">
        <span>{t('sv_emg_target', { n: N(e.months), a: M(eTarget) })}</span>
        <b>{M(e.saved)}</b>
      </div>
      <Bar value={e.saved} max={eTarget} color="#f2a03d" />
      <p className="hint">{t('sv_left', { a: M(Math.max(0, eTarget - e.saved)) })}</p>
    </div>
  );

  const GoalBars = () =>
    s.goals.length === 0 ? (
      <p className="muted">{t('sv_none')}</p>
    ) : (
      s.goals.map((g, i) => (
        <div className="goal" key={g.id}>
          <div className="goal-h">
            <strong>{g.title}</strong>
            <span>
              {M(g.saved)} / {M(g.target)} ({N(pctOf(g))}%)
            </span>
          </div>
          <Bar value={g.saved} max={g.target} color={COLORS[i % COLORS.length]} />
        </div>
      ))
    );

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = parse(today().slice(0, 7) + '-01');
    d.setMonth(d.getMonth() + i);
    return d.toLocaleDateString(loc(lang), { month: 'short', year: '2-digit' });
  });

  return (
    <>
      <PageHead title={t('sv_title')} sub={t('sv_sub')}>
        <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />
      </PageHead>

      {tab === 'track' ? (
        <>
          <Summary />
          <div className="cols">
            <div>
              <Card title={t('sv_emg')} hint={t('sv_emg_hint')}>
                <div className="grid3">
                  <Field label={t('sv_monthly')}>
                    <Num value={e.monthly} onChange={(v) => up((x) => (x.emergency.monthly = v))} />
                  </Field>
                  <Field label={t('sv_months')}>
                    <Num value={e.months} onChange={(v) => up((x) => (x.emergency.months = v))} />
                  </Field>
                  <Field label={t('sv_now')}>
                    <Num value={e.saved} onChange={(v) => up((x) => (x.emergency.saved = v))} />
                  </Field>
                </div>
                <EmgBar />
              </Card>

              <Card title={t('sv_debts')}>
                {s.debts.map((d, i) => (
                  <div className="fin-block" key={d.id}>
                    <div className="row">
                      <input value={d.who} placeholder={t('sv_who')} onChange={(x) => up((y) => (y.debts[i].who = x.target.value))} />
                      <Del onClick={() => up((y) => y.debts.splice(i, 1))} />
                    </div>
                    <div className="grid3">
                      <Field label={t('sv_total')}>
                        <Num value={d.total} onChange={(v) => up((y) => (y.debts[i].total = v))} />
                      </Field>
                      <Field label={t('sv_paid')}>
                        <Num value={d.paid} onChange={(v) => up((y) => (y.debts[i].paid = v))} />
                      </Field>
                      <Field label={t('sv_inst')}>
                        <Num value={d.monthly} onChange={(v) => up((y) => (y.debts[i].monthly = v))} />
                      </Field>
                    </div>
                    <p className="hint">
                      {t('sv_remaining')}: <b className="bad">{M(Math.max(0, d.total - d.paid))}</b>
                      {monthsFor(d) && ` · ${t('sv_finish')}: ${t('sv_n_months', { n: N(monthsFor(d)) })}`}
                    </p>
                  </div>
                ))}
                <button type="button" className="btn dashed" onClick={() => up((y) => y.debts.push({ id: uid(), who: '', total: 0, paid: 0, monthly: 0 }))}>
                  + {t('add')}
                </button>
              </Card>
            </div>

            <Card title={t('sv_goals')}>
              {s.goals.map((g, i) => (
                <div className="fin-block" key={g.id}>
                  <div className="row">
                    <input value={g.title} placeholder={t('sv_for')} onChange={(x) => up((y) => (y.goals[i].title = x.target.value))} />
                    <Del onClick={() => up((y) => y.goals.splice(i, 1))} />
                  </div>
                  <div className="grid2">
                    <Field label={t('sv_target')}>
                      <Num value={g.target} onChange={(v) => up((y) => (y.goals[i].target = v))} />
                    </Field>
                    <Field label={t('sv_have')}>
                      <Num value={g.saved} onChange={(v) => up((y) => (y.goals[i].saved = v))} />
                    </Field>
                  </div>
                  <Bar value={g.saved} max={g.target} color={COLORS[i % COLORS.length]} />
                </div>
              ))}
              <button type="button" className="btn dashed" onClick={() => up((y) => y.goals.push({ id: uid(), title: '', target: 0, saved: 0 }))}>
                + {t('add')}
              </button>
            </Card>
          </div>
        </>
      ) : (
        <Sheet title={t('sv_title')} sub={t('sv_sub')} file="savings-and-debt">
          <Summary />
          <h4 className="sh-h">{t('sv_emg')}</h4>
          <EmgBar />
          <h4 className="sh-h">{t('sv_goals')}</h4>
          <GoalBars />
          <h4 className="sh-h">{t('sv_debts')}</h4>
          <div className="sh-debt head">
            <span>{t('sv_who')}</span>
            <span>{t('sv_total')}</span>
            <span>{t('sv_paid')}</span>
            <span>{t('sv_remaining')}</span>
            <span>{t('sv_inst')}</span>
            <span>{t('sv_finish')}</span>
          </div>
          {s.debts.length === 0 && <p className="muted">{t('sv_none')}</p>}
          {s.debts.map((d) => (
            <div className="sh-debt" key={d.id}>
              <span>{d.who}</span>
              <span>{M(d.total)}</span>
              <span>{M(d.paid)}</span>
              <b>{M(Math.max(0, d.total - d.paid))}</b>
              <span>{M(d.monthly)}</span>
              <span>{monthsFor(d) ? t('sv_n_months', { n: N(monthsFor(d)) }) : '–'}</span>
            </div>
          ))}
          <h4 className="sh-h">{t('sv_log')}</h4>
          <div className="sh-log">
            {months.map((m) => (
              <div key={m}>
                <b>{m}</b>
                <span>৳</span>
              </div>
            ))}
          </div>
          <p className="sh-note">{t('sv_tip')}</p>
        </Sheet>
      )}
    </>
  );
}
