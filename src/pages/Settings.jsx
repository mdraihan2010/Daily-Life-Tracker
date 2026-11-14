import { useEffect, useRef, useState } from 'react';
import { useApp, blank, TOOLS, toolOn, setTool } from '../store.jsx';
import { Icon } from '../App.jsx';
import { TITLE } from './More.jsx';
import { PERSONAS, applySample } from '../personas.js';
import { today } from '../utils.js';
import { Card, Field, PageHead } from '../components/ui.jsx';

export default function Settings() {
  const { data, update, replace, t, lang } = useApp();
  const p = data.profile;
  const set = (k, v) => update((d) => (d.profile[k] = v));
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [sure, setSure] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);

  // Chrome/Edge fire this event when the app can be installed
  useEffect(() => {
    const f = (e) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener('beforeinstallprompt', f);
    return () => window.removeEventListener('beforeinstallprompt', f);
  }, []);

  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-life-tracker-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restore = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (d.v !== 1 || !d.profile || !d.planner || !d.habits || !d.money) throw new Error('bad');
      replace({ ...blank(), ...d });
      setMsg(t('s_restored'));
    } catch {
      setMsg(t('s_bad'));
    }
  };

  return (
    <>
      <PageHead title={t('s_title')} />
      <div className="cols">
        <div>
          <Card title={t('s_profile')}>
            <Field label={t('ob_name')}>
              <input value={p.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label={t('ob_who')}>
              <select value={p.persona} onChange={(e) => set('persona', e.target.value)}>
                {PERSONAS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name[lang === 'bn' ? 0 : 1]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('ob_detail')}>
              <input value={p.detail} onChange={(e) => set('detail', e.target.value)} />
            </Field>
            <Field label={t('ob_org')}>
              <input value={p.org} onChange={(e) => set('org', e.target.value)} />
            </Field>
          </Card>

          <Card title={t('s_look')}>
            <div className="grid2">
              <div className="field">
                <span>{t('s_lang')}</span>
                <div className="seg">
                  <button type="button" className={lang === 'bn' ? 'on' : ''} onClick={() => set('lang', 'bn')}>
                    বাংলা
                  </button>
                  <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => set('lang', 'en')}>
                    English
                  </button>
                </div>
              </div>
              <div className="field">
                <span>{t('s_theme')}</span>
                <div className="seg">
                  <button type="button" className={p.theme === 'light' ? 'on' : ''} onClick={() => set('theme', 'light')}>
                    {t('light')}
                  </button>
                  <button type="button" className={p.theme === 'dark' ? 'on' : ''} onClick={() => set('theme', 'dark')}>
                    {t('dark')}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title={t('s_tools')}
            hint={t('s_tools_hint')}
            right={
              <button type="button" className="btn" onClick={() => update((d) => TOOLS.forEach((k) => setTool(d, k, true)))}>
                {t('s_all_on')}
              </button>
            }
          >
            <ul className="tool-switches">
              {TOOLS.map((k) => {
                const isOn = toolOn(p, k);
                return (
                  <li key={k} className={isOn ? '' : 'off'}>
                    <Icon name={k} />
                    <span>{t(TITLE[k])}</span>
                    <button type="button" role="switch" aria-checked={isOn} aria-label={t(TITLE[k])} className={'switch' + (isOn ? ' on' : '')} onClick={() => update((d) => setTool(d, k, !isOn))}>
                      <i />
                    </button>
                    <em>{isOn ? t('on') : t('off')}</em>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title={t('s_install')} hint={t('s_install_hint')}>
            {installEvt && (
              <button
                type="button"
                className="btn primary"
                onClick={async () => {
                  installEvt.prompt();
                  await installEvt.userChoice;
                  setInstallEvt(null);
                }}
              >
                {t('s_install_btn')}
              </button>
            )}
          </Card>
        </div>

        <div>
          <Card title={t('s_sample')} hint={t('s_sample_hint')}>
            <button type="button" className="btn" onClick={() => update(applySample)}>
              {t('s_sample_btn')}
            </button>
          </Card>

          <Card title={t('s_backup')} hint={t('s_backup_hint')}>
            <div className="row wrap">
              <button type="button" className="btn primary" onClick={download}>
                {t('s_down')}
              </button>
              <button type="button" className="btn" onClick={() => fileRef.current.click()}>
                {t('s_restore')}
              </button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
            </div>
            {msg && <p className="notice" role="status">{msg}</p>}
          </Card>

          <Card title={t('s_reset')} hint={t('s_reset_hint')}>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (!sure) return setSure(true);
                replace({ ...blank(), profile: { ...blank().profile, lang, theme: p.theme } });
              }}
              onBlur={() => setSure(false)}
            >
              {sure ? t('s_reset_sure') : t('s_reset_btn')}
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}
