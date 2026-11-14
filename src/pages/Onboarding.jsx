import { useState } from 'react';
import { useApp } from '../store.jsx';
import { PERSONAS, applySample } from '../personas.js';
import { Field } from '../components/ui.jsx';

export default function Onboarding() {
  const { data, update, t, lang } = useApp();
  const p = data.profile;
  const [sample, setSample] = useState(true);
  const set = (k, v) => update((d) => (d.profile[k] = v));
  const ready = p.name.trim() && p.persona;

  const start = () =>
    update((d) => {
      d.profile.name = d.profile.name.trim();
      d.profile.onboarded = true;
      if (sample) applySample(d);
    });

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-top">
          <img src="./icon.svg" alt="" width="52" height="52" />
          <div className="seg">
            <button type="button" className={lang === 'bn' ? 'on' : ''} onClick={() => set('lang', 'bn')}>
              বাংলা
            </button>
            <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => set('lang', 'en')}>
              English
            </button>
          </div>
        </div>
        <h1>{t('ob_title')}</h1>
        <p className="muted">{t('ob_sub')}</p>

        <Field label={t('ob_name')}>
          <input value={p.name} onChange={(e) => set('name', e.target.value)} autoFocus />
        </Field>

        <div className="field">
          <span>{t('ob_who')}</span>
          <div className="persona-grid">
            {PERSONAS.map((x) => (
              <button key={x.id} type="button" className={'persona' + (p.persona === x.id ? ' on' : '')} onClick={() => set('persona', x.id)} aria-pressed={p.persona === x.id}>
                <b aria-hidden="true">{x.icon}</b>
                {x.name[lang === 'bn' ? 0 : 1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid2">
          <Field label={t('ob_detail')}>
            <input value={p.detail} onChange={(e) => set('detail', e.target.value)} />
          </Field>
          <Field label={t('ob_org')}>
            <input value={p.org} onChange={(e) => set('org', e.target.value)} />
          </Field>
        </div>

        <label className="tick-line">
          <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} />
          {t('ob_sample')}
        </label>

        <button type="button" className="btn primary big" disabled={!ready} onClick={start}>
          {t('ob_start')}
        </button>
      </div>
    </div>
  );
}
