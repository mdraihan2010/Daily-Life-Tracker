import { useState } from 'react';
import { useApp } from '../store.jsx';

// `tone` is the colour of the heading band (any CSS colour). Without it the app's main colour is used.
export const Card = ({ title, hint, right, children, className = '', tone }) => (
  <section className={'card ' + (title ? 'has-head ' : '') + className} style={tone ? { '--tone': tone } : undefined}>
    {title && (
      <header className="card-h">
        <div>
          <h3>{title}</h3>
          {hint && <p className="hint">{hint}</p>}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);

export const Field = ({ label, children }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);

export const Check = ({ on, onClick, label, disabled }) => (
  <button type="button" className={'check' + (on ? ' on' : '')} onClick={onClick} aria-pressed={!!on} aria-label={label} disabled={disabled}>
    {on ? '✓' : ''}
  </button>
);

export const Del = ({ onClick }) => (
  <button type="button" className="del" onClick={onClick} aria-label="Delete">
    ×
  </button>
);

export function AddRow({ placeholder, onAdd, label }) {
  const [v, setV] = useState('');
  const go = () => {
    if (!v.trim()) return;
    onAdd(v.trim());
    setV('');
  };
  return (
    <div className="row add-row">
      <input value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
      <button type="button" className="btn" onClick={go}>
        + {label}
      </button>
    </div>
  );
}

export const Tabs = ({ value, onChange, items }) => (
  <div className="tabs" role="tablist">
    {items.map(([k, l]) => (
      <button key={k} type="button" role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>
        {l}
      </button>
    ))}
  </div>
);

export const PageHead = ({ title, sub, children }) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p className="muted">{sub}</p>}
    </div>
    {children}
  </div>
);

export const Bar = ({ value, max, color }) => (
  <div className="bar">
    <i style={{ width: Math.min(100, max > 0 ? (value / max) * 100 : 0) + '%', background: color }} />
  </div>
);

// Ring chart. Each arc: { from, to, color } as fractions of a full turn (0 = top, clockwise).
export function Ring({ arcs, size = 220, width = 34, children }) {
  const r = (size - width) / 2;
  const c = size / 2;
  const pt = (f) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="ring" role="img">
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={width} />
      {arcs.map((a, i) => {
        const to = Math.min(a.to, a.from + 0.9999);
        const [x1, y1] = pt(a.from);
        const [x2, y2] = pt(to);
        return <path key={i} d={`M${x1} ${y1}A${r} ${r} 0 ${to - a.from > 0.5 ? 1 : 0} 1 ${x2} ${y2}`} fill="none" stroke={a.color} strokeWidth={width} />;
      })}
      {children}
    </svg>
  );
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const toAscii = (s) => s.replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));
const toBn = (s) => s.replace(/[0-9]/g, (d) => BN_DIGITS[d]);

// Number box that accepts BOTH Bangla (০-৯) and English (0-9) digits.
// A normal <input type="number"> rejects Bangla digits, so this is a text box that converts them.
// value: number or undefined. onChange gets a number, or undefined when the box is emptied.
export function NumInput({ value, onChange, max, className, placeholder, ...rest }) {
  const { lang } = useApp();
  const [typing, setTyping] = useState(null); // what is being typed, e.g. "3." before the decimals
  const shown = typing ?? (value === undefined || value === null || value === '' || Number.isNaN(value) ? '' : String(value));
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={className}
      placeholder={placeholder}
      value={lang === 'bn' ? toBn(shown) : shown}
      onChange={(e) => {
        let raw = toAscii(e.target.value).replace(/[^0-9.]/g, '');
        const dot = raw.indexOf('.');
        if (dot !== -1) raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, '');
        setTyping(raw);
        if (raw === '' || raw === '.') return onChange(undefined);
        onChange(Math.min(max ?? Infinity, Number(raw)));
      }}
      onBlur={() => setTyping(null)}
    />
  );
}
