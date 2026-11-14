import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, addDays, fmtDate, daysBetween, uid } from '../utils.js';
import { Card, Field, Check, Del, Tabs, PageHead, Bar } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';

export default function Project() {
  const { data, update, t, lang, N } = useApp();
  const [tab, setTab] = useState('track');
  const [sel, setSel] = useState(data.projects[0]?.id);
  const [sure, setSure] = useState(false);
  const p = data.projects.find((x) => x.id === sel) || data.projects[0];
  const up = (fn) => update((d) => fn(d.projects.find((x) => x.id === p.id)));

  const create = () => {
    const id = uid();
    update((d) => d.projects.push({ id, name: '', goal: '', start: today(), deadline: addDays(today(), 30), steps: [], notes: '' }));
    setSel(id);
    setTab('track');
  };

  const head = (
    <PageHead title={t('p_title')} sub={t('p_sub')}>
      {p && <Tabs value={tab} onChange={setTab} items={[['track', t('track')], ['sheet', t('sheet')]]} />}
    </PageHead>
  );

  if (!p)
    return (
      <>
        {head}
        <Card>
          <p className="muted">{t('p_empty')}</p>
          <button type="button" className="btn primary" style={{ marginTop: 12 }} onClick={create}>
            + {t('p_new')}
          </button>
        </Card>
      </>
    );

  const left = daysBetween(today(), p.deadline);
  const done = p.steps.filter((s) => s.done).length;
  const pct = p.steps.length ? Math.round((done / p.steps.length) * 100) : 0;
  const total = Math.max(1, daysBetween(p.start, p.deadline));
  const pos = (d) => Math.max(0, Math.min(100, (daysBetween(p.start, d) / total) * 100));
  const short = (d) => fmtDate(d, lang, { day: 'numeric', month: 'short' });
  const name = p.name || t('p_untitled');

  const Overview = () => (
    <>
      <div className="count-row">
        <div className={'count' + (left < 0 ? ' over' : '')}>
          <strong>{left < 0 ? '!' : N(left)}</strong>
          <span>{left < 0 ? t('p_over') : t('p_left')}</span>
        </div>
        <div className="count-info">
          <span className="hint">{t('p_goal')}</span>
          <strong>{p.goal}</strong>
          <div className="goal-h">
            <span>{t('p_done', { a: N(done), b: N(p.steps.length) })}</span>
            <b>{N(pct)}%</b>
          </div>
          <Bar value={done} max={p.steps.length} color="var(--ok)" />
        </div>
      </div>
      <div className="tl-wrap">
        <div className="tl">
          <i style={{ width: pos(today()) + '%' }} />
          {p.steps
            .filter((s) => s.due)
            .map((s) => (
              <b key={s.id} className={s.done ? 'on' : ''} style={{ left: pos(s.due) + '%' }} title={s.text} />
            ))}
          <em style={{ left: pos(today()) + '%' }}>{t('today')}</em>
        </div>
        <div className="tl-ends">
          <span>{short(p.start)}</span>
          <span>{short(p.deadline)}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {head}

      <div className="chips plan-chips">
        {data.projects.map((x) => (
          <button type="button" key={x.id} className={'chip' + (x.id === p.id ? ' on' : '')} onClick={() => setSel(x.id)} aria-pressed={x.id === p.id}>
            {x.name || t('p_untitled')}
          </button>
        ))}
        <button type="button" className="chip" onClick={create}>
          + {t('p_new')}
        </button>
      </div>

      {tab === 'track' ? (
        <div className="cols">
          <div>
            <Card title={t('p_about')}>
              <Field label={t('p_name')}>
                <input value={p.name} placeholder={t('p_name_ph')} onChange={(e) => up((x) => (x.name = e.target.value))} />
              </Field>
              <Field label={t('p_goal')}>
                <input value={p.goal} onChange={(e) => up((x) => (x.goal = e.target.value))} />
              </Field>
              <div className="grid2">
                <Field label={t('p_start')}>
                  <input type="date" value={p.start} onChange={(e) => e.target.value && up((x) => (x.start = e.target.value))} />
                </Field>
                <Field label={t('p_deadline')}>
                  <input type="date" value={p.deadline} onChange={(e) => e.target.value && up((x) => (x.deadline = e.target.value))} />
                </Field>
              </div>
            </Card>

            <Card title={t('p_notes')}>
              <textarea rows="3" value={p.notes} onChange={(e) => up((x) => (x.notes = e.target.value))} />
            </Card>

            <button
              type="button"
              className="btn danger"
              onBlur={() => setSure(false)}
              onClick={() => {
                if (!sure) return setSure(true);
                update((d) => (d.projects = d.projects.filter((x) => x.id !== p.id)));
                setSure(false);
                setSel(undefined);
              }}
            >
              {sure ? t('s_reset_sure') : t('p_del')}
            </button>
          </div>

          <div>
            <Card>
              <Overview />
            </Card>
            <Card title={t('p_steps')}>
              {p.steps.map((s, i) => (
                <div className={'step-row' + (s.done ? ' done' : '')} key={s.id}>
                  <Check on={s.done} label={s.text} onClick={() => up((x) => (x.steps[i].done = !s.done))} />
                  <input value={s.text} placeholder={t('p_step_ph')} onChange={(e) => up((x) => (x.steps[i].text = e.target.value))} />
                  <Del onClick={() => up((x) => x.steps.splice(i, 1))} />
                  <input type="date" value={s.due} min={p.start} max={p.deadline} onChange={(e) => up((x) => (x.steps[i].due = e.target.value))} aria-label={t('p_due')} />
                </div>
              ))}
              <button type="button" className="btn dashed" onClick={() => up((x) => x.steps.push({ id: uid(), text: '', due: '', done: false }))}>
                + {t('add')}
              </button>
            </Card>
          </div>
        </div>
      ) : (
        <Sheet title={name} sub={`${fmtDate(p.start, lang, { day: 'numeric', month: 'long' })} – ${fmtDate(p.deadline, lang, { day: 'numeric', month: 'long', year: 'numeric' })}`} file="project-plan">
          <Overview />
          <h4 className="sh-h">{t('p_steps')}</h4>
          <div className="sh-step head">
            <span>#</span>
            <span />
            <span>{t('p_step')}</span>
            <span>{t('p_due')}</span>
          </div>
          {Array.from({ length: Math.max(10, p.steps.length) }, (_, i) => p.steps[i]).map((s, i) => (
            <div className="sh-step" key={i}>
              <span>{N(i + 1)}</span>
              <i className={'sh-box' + (s?.done ? ' on' : '')}>{s?.done ? '✓' : ''}</i>
              <span>{s?.text}</span>
              <span>{s?.due ? short(s.due) : ''}</span>
            </div>
          ))}
          <h4 className="sh-h">{t('p_notes')}</h4>
          <p className="sh-pre">{p.notes}</p>
          <div className="sh-line tall" />
          <p className="sh-note">{t('p_tip')}</p>
        </Sheet>
      )}
    </>
  );
}
