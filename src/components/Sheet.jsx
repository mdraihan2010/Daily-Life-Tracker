import { useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { today, fmtDate } from '../utils.js';

// A4 page preview with PNG / PDF / Print buttons.
export default function Sheet({ title, sub, file, children }) {
  const ref = useRef(null);
  const { data, t, lang } = useApp();
  const [busy, setBusy] = useState(false);
  const p = data.profile;

  const toPng = async () => {
    const { toPng } = await import('html-to-image');
    return toPng(ref.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
  };
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };
  const png = () =>
    run(async () => {
      const a = document.createElement('a');
      a.href = await toPng();
      a.download = file + '.png';
      a.click();
    });
  const pdf = () =>
    run(async () => {
      const [{ jsPDF }, url] = await Promise.all([import('jspdf'), toPng()]);
      const el = ref.current;
      const ratio = el.offsetHeight / el.offsetWidth;
      let w = 210;
      let h = 210 * ratio;
      if (h > 297) {
        w = 297 / ratio;
        h = 297;
      }
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.addImage(url, 'PNG', (210 - w) / 2, 0, w, h);
      doc.save(file + '.pdf');
    });

  return (
    <div className="sheet-wrap">
      <div className="sheet-actions">
        <button type="button" className="btn primary" onClick={png} disabled={busy}>
          {busy ? t('working') : t('png')}
        </button>
        <button type="button" className="btn primary" onClick={pdf} disabled={busy}>
          {t('pdf')}
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          {t('print')}
        </button>
      </div>
      <div className="sheet-scroll">
        <div className="sheet" ref={ref}>
          <header className="sheet-head">
            <div>
              <h2>{title}</h2>
              {sub && <p>{sub}</p>}
            </div>
            <div className="sheet-who">
              <strong>{p.name}</strong>
              {p.detail && <span>{p.detail}</span>}
              {p.org && <span>{p.org}</span>}
            </div>
          </header>
          <div className="sheet-body">{children}</div>
          <footer className="sheet-foot">
            <span>{t('app')}</span>
            <span>{t('made_on', { d: fmtDate(today(), lang, { day: 'numeric', month: 'long', year: 'numeric' }) })}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
