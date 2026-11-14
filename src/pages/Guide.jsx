import { useApp } from '../store.jsx';
import { GUIDE } from '../guide.js';
import { PageHead } from '../components/ui.jsx';
import { TITLE } from './More.jsx';

export default function Guide() {
  const { t, lang } = useApp();
  const i = lang === 'bn' ? 0 : 1;
  return (
    <>
      <PageHead title={t('gd_title')} sub={t('gd_sub')} />
      <div className="guide">
        {GUIDE.map((s) => (
          <section className="card guide-card" key={s.tool} style={{ borderLeftColor: s.color }}>
            <h3>{s.title[i]}</h3>
            <p className="muted">{s.lead[i]}</p>
            <ol>
              {s.tips.map(([title, text]) => (
                <li key={title[1]}>
                  <strong>{title[i]}:</strong> {text[i]}
                </li>
              ))}
            </ol>
            <a className="btn" href={'#' + s.tool}>
              {t('gd_open', { n: t(TITLE[s.tool]) })}
            </a>
          </section>
        ))}
      </div>
    </>
  );
}
