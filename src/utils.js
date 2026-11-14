export const uid = () => Math.random().toString(36).slice(2, 9);
export const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
};
export const addDays = (s, n) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const loc = (lang) => (lang === 'bn' ? 'bn-BD' : 'en-GB');

// "HH:MM" -> minutes since midnight
export const toMin = (t) => {
  const [h, m] = (t || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
// length of a block in minutes; blocks may cross midnight (22:00 -> 05:00)
export const span = (a, b) => {
  let d = toMin(b) - toMin(a);
  if (d <= 0) d += 1440;
  return d;
};

export const num = (n, lang) =>
  Number(n || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { maximumFractionDigits: 1 });

export const fmtDate = (s, lang, opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) =>
  parse(s).toLocaleDateString(loc(lang), opts);

const BN_PART = (h) =>
  h < 4 ? 'রাত' : h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 18 ? 'বিকেল' : h < 20 ? 'সন্ধ্যা' : 'রাত';

// "17:30" -> "বিকেল ৫:৩০" / "5:30 PM"
export const fmtTime = (t, lang) => {
  const m = toMin(t);
  const h = Math.floor(m / 60) % 24;
  const mm = pad(m % 60);
  const h12 = h % 12 || 12;
  if (lang === 'bn') return `${BN_PART(h)} ${num(h12, 'bn')}:${[...mm].map((c) => num(c, 'bn')).join('')}`;
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
};
