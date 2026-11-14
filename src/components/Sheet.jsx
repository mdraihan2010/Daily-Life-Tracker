import { useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { today, fmtDate } from '../utils.js';

// A4 page preview with PNG / PDF / Print buttons.
//
// One page:      <Sheet title="..." sub="..." file="name">content</Sheet>
// Several pages: <Sheet ... pages={[{ sub: 'page 1', body: <A /> }, { sub: 'page 2', body: <B /> }]} />
// landscape  -> the page lies on its side (wide tables)
// compact    -> a one-line heading and no footer, to leave the whole page for a table
export default function Sheet({ title, sub, file, children, pages, landscape, compact }) {
  const refs = useRef([]);
  const { data, t, lang } = useApp();
  const [busy, setBusy] = useState(false);
  const p = data.profile;
  const list = pages || [{ sub, body: children }];
  const nodes = () => refs.current.slice(0, list.length);
  // paper size in mm, as [width, height]
  const paper = landscape ? [297, 210] : [210, 297];

  const toPng = async (el) => {
    const { toPng } = await import('html-to-image');
    return toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
  };
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  // One PNG file. Several pages are stacked one under another in the same picture,
  // because browsers often block a second automatic download.
  const png = () =>
    run(async () => {
      const urls = [];
      for (const el of nodes()) urls.push(await toPng(el));
      let url = urls[0];
      if (urls.length > 1) {
        const imgs = await Promise.all(
          urls.map(
            (u) =>
              new Promise((ok, fail) => {
                const im = new Image();
                im.onload = () => ok(im);
                im.onerror = fail;
                im.src = u;
              })
          )
        );
        const gap = 40;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(...imgs.map((im) => im.width));
        canvas.height = imgs.reduce((h, im) => h + im.height, 0) + gap * (imgs.length - 1);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let y = 0;
        for (const im of imgs) {
          ctx.drawImage(im, 0, y);
          y += im.height + gap;
        }
        url = canvas.toDataURL('image/png');
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = file + '.png';
      a.click();
    });

  // one PDF file, one page per sheet
  const pdf = () =>
    run(async () => {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: landscape ? 'landscape' : 'portrait' });
      for (const [k, el] of nodes().entries()) {
        const url = await toPng(el);
        const ratio = el.offsetHeight / el.offsetWidth;
        let w = paper[0];
        let h = w * ratio;
        if (h > paper[1]) {
          h = paper[1];
          w = h / ratio;
        }
        if (k > 0) doc.addPage();
        doc.addImage(url, 'PNG', (paper[0] - w) / 2, 0, w, h);
      }
      doc.save(file + '.pdf');
    });

  // Printing: copy the sheets into their own box at the end of <body>, print only that box, then remove it.
  const print = () => {
    document.getElementById('print-root')?.remove();
    const root = document.createElement('div');
    root.id = 'print-root';
    const style = document.createElement('style');
    style.textContent = `@page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 0; }`;
    root.appendChild(style);
    nodes().forEach((el) => root.appendChild(el.cloneNode(true)));
    document.body.appendChild(root);
    document.body.classList.add('printing');
    const done = () => {
      document.body.classList.remove('printing');
      root.remove();
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };

  return (
    <div className="sheet-wrap">
      <div className="sheet-actions">
        <button type="button" className="btn primary" onClick={png} disabled={busy}>
          {busy ? t('working') : t('png')}
        </button>
        <button type="button" className="btn primary" onClick={pdf} disabled={busy}>
          {t('pdf')}
        </button>
        <button type="button" className="btn" onClick={print}>
          {t('print')}
        </button>
      </div>
      {list.map((page, k) => (
        <div className="sheet-scroll" key={k}>
          <div className={'sheet' + (landscape ? ' land' : '') + (compact ? ' compact' : '')} ref={(el) => (refs.current[k] = el)}>
            <header className="sheet-head">
              <div>
                <h2>{title}</h2>
                {page.sub && <p>{page.sub}</p>}
              </div>
              <div className="sheet-who">
                <strong>{p.name}</strong>
                {p.detail && <span>{p.detail}</span>}
                {p.org && <span>{p.org}</span>}
              </div>
            </header>
            <div className="sheet-body">{page.body}</div>
            {!compact && (
              <footer className="sheet-foot">
                <span>{t('app')}</span>
                <span>{t('made_on', { d: fmtDate(today(), lang, { day: 'numeric', month: 'long', year: 'numeric' }) })}</span>
              </footer>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
