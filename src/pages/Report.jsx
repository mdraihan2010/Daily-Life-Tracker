import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, parse, loc, fmtDate } from '../utils.js';
import { Card, Check, Tabs, PageHead, Bar } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';
import { MONTH_SPEC, ANNUAL_SPEC, CONTACTS, DIST, GROWTH, DAY_STUDY, DAY_CLASS, DAY_ORG, DAY_CHECKS, TABLE_GROUPS, daysIn, newMonthRep, getMonthRep, totals, rowNums, elapsedDays, track } from '../report.js';

// one labelled input; empty value removes the key so "nothing written" stays empty
function Input({ f, value, onChange, i, max }) {
  const label = f.l[i] + (f.u ? ` (${f.u[i]})` : '');
  return (
    <label className="field">
      <span>{label}</span>
      {f.t === 'n' ? (
        <input
          type="number"
          min="0"
          max={max}
          step="any"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Math.min(max ?? Infinity, Math.max(0, Number(e.target.value) || 0)))}
        />
      ) : (
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} />
      )}
    </label>
  );
}

function SpecForm({ spec, values, set, i, mode }) {
  return spec
    .filter((sec) => !sec.only || sec.only === mode)
    .map((sec) => {
      const fields = mode === 'report' ? sec.fields.filter((f) => !f.auto) : sec.fields;
      if (!fields.length) return null;
      return (
        <Card key={sec.id} title={sec.title[i]}>
          <div className="spec-grid">
            {fields.map((f) => (
              <Input key={f.k} f={f} i={i} value={values[f.k]} onChange={(v) => set(f.k, v)} />
            ))}
          </div>
        </Card>
      );
    });
}

const ABOUT = [
  [['কুরআন ও হাদিস অধ্যয়ন', 'Quran and hadith study'], ['প্রতিদিন নিয়মিত কুরআন ও হাদিস পড়া, বোঝা এবং সে অনুযায়ী নিজেকে গড়ার চেষ্টা। কোন সূরা, কত আয়াত, কয়টা হাদিস পড়লে তা লিখে রাখো।', 'Read and understand the Quran and hadith every day and try to live by them. Note the surah, the number of ayat and the number of hadith.']],
  [['সাহিত্য অধ্যয়ন', 'Literature study'], ['ইসলামী সাহিত্য ও অন্যান্য বই কত পৃষ্ঠা পড়লে তার হিসাব। মুখস্থ বুলি নয়, বুঝে পড়া ও নোট করার অভ্যাস।', 'Pages of Islamic and other books read. The aim is understanding and note-taking, not memorised lines.']],
  [['পাঠ্যপুস্তক ও ক্লাস', 'Textbooks and classes'], ['ভালো ছাত্র হওয়া মূল কাজের অংশ। প্রতিদিন কত ঘণ্টা পড়লে আর কয়টা ক্লাসে উপস্থিত ছিলে লেখো।', 'Being a good student is part of the main work. Note hours studied and classes attended each day.']],
  [['জামায়াতে নামাজ', 'Prayer in congregation'], ['প্রতিদিন কয় ওয়াক্ত জামায়াতে পড়লে আর কয় ওয়াক্ত কাজা হলো তার হিসাব।', 'How many prayers were offered in congregation each day and how many were missed.']],
  [['যোগাযোগ ও বিতরণ', 'Contacts and distribution'], ['পরিকল্পনা করে কার কার সাথে যোগাযোগ করলে এবং কী কী উপকরণ বিতরণ করলে তার সংখ্যা।', 'Numbers of people you contacted according to plan, and items you distributed.']],
  [['সাংগঠনিক দায়িত্ব পালন', 'Organisational duties'], ['দাওয়াতি কাজ ও অন্যান্য সাংগঠনিক কাজে কত ঘণ্টা সময় দিলে।', 'Hours given to dawah work and other organisational work.']],
  [['পত্রিকা পাঠ, শরীরচর্চা, আত্মসমালোচনা', 'Newspaper, exercise, self-criticism'], ['প্রতিদিন খবর জানা, শরীর ঠিক রাখা, আর দিনশেষে নিজের কাজের হিসাব নিজে নেওয়া। করলে টিক দাও।', 'Keep up with the news, look after your body, and review your own day at night. Tick each one you did.']],
];

export default function Report() {
  const { data, update, t, lang, N } = useApp();
  const i = lang === 'bn' ? 0 : 1;
  const L = (bn, en) => (i ? en : bn);
  const [tab, setTab] = useState('daily');
  const [view, setView] = useState('track');
  const [pv, setPv] = useState('track');
  const [ym, setYm] = useState(today().slice(0, 7));
  const [day, setDay] = useState(Number(today().slice(8)));
  const [year, setYear] = useState(new Date().getFullYear());

  if (!data.profile.reportBook)
    return (
      <>
        <PageHead title={t('rp_title')} sub={t('rp_sub')} />
        <Card>
          <p className="muted">{t('s_report_hint')}</p>
          <button type="button" className="btn primary" style={{ marginTop: 12 }} onClick={() => update((d) => (d.profile.reportBook = true))}>
            {t('rp_enable')}
          </button>
        </Card>
      </>
    );

  const count = daysIn(ym);
  const m = getMonthRep(data, ym);
  const sel = Math.min(day, count);
  const d = m.days[sel] || {};
  const T = totals(m.days, count);
  const elapsed = elapsedDays(ym, count, today());
  const rows = track(m.plan, T, count, elapsed);
  const behind = rows.filter((r) => r.behind);
  const monthName = fmtDate(ym + '-01', lang, { month: 'long', year: 'numeric' });
  const isToday = (n) => ym === today().slice(0, 7) && n === Number(today().slice(8));
  const future = (n) => `${ym}-${String(n).padStart(2, '0')}` > today();
  const annual = data.report.annual[year] || {};

  const upMonth = (fn) => update((x) => fn((x.report.months[ym] ??= newMonthRep())));
  const put = (obj, k, val) => (val === undefined || val === false ? delete obj[k] : (obj[k] = val));
  const setDayVal = (k, val) => upMonth((mm) => put((mm.days[sel] ??= {}), k, val));
  const move = (n) => {
    const x = parse(ym + '-01');
    x.setMonth(x.getMonth() + n);
    setYm(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  };
  const asField = ([k, bn, en], pre) => ({ k: pre + k, l: [bn, en], t: 'n' });
  const show = (x) => (x ? N(x) : '');

  const dayGrid = (fields, max5) => (
    <div className="spec-grid">
      {fields.map((f) => (
        <Input key={f.k} f={f} i={i} value={d[f.k]} max={max5 && (f.k === 'jam' || f.k === 'kaza') ? 5 : undefined} onChange={(val) => setDayVal(f.k, val)} />
      ))}
    </div>
  );

  // totals row of the printed table
  const sums = Array(26).fill(0);
  for (let n = 1; n <= count; n++) rowNums(m.days[n]).forEach((x, k) => (sums[k] += x));

  const value = (f) => (f.auto ? f.auto(T) : m.extra[f.k]);
  const writeTabs = <Tabs value={pv} onChange={setPv} items={[['track', L('লেখো', 'Write')], ['sheet', t('sheet')]]} />;
  // printable version of a plan: every section of the spec with the values typed in
  const planSheet = (spec, values) => (
    <div className="gl">
      {spec
        .filter((sec) => !sec.only && sec.id !== 'advice')
        .map((sec) => (
          <section key={sec.id} className={'gl-sec pl-' + sec.id + (sec.fields.length > 6 ? ' gl-wide gl-many' : '')}>
            <h4>{sec.title[i]}</h4>
            <div className="gl-grid">{sec.fields.map((f) => pair(f, values))}</div>
          </section>
        ))}
      <section className="gl-sec gl-wide">
        <h4>{L('নামাজ', 'Prayer')}</h4>
        <p>{L('প্রতি ওয়াক্ত নামাজ জামায়াতে আদায়ের চেষ্টা করব, সাথে কিছু নফল ইবাদত, ইনশাআল্লাহ।', 'I will try to offer every prayer in congregation, along with some voluntary worship, in sha Allah.')}</p>
      </section>
      <div className="gl-sign gl-wide">
        <span>{L('দায়িত্বশীলের স্বাক্ষর', 'Signature of the person in charge')}</span>
        <span>{L('পরিকল্পনা গ্রহণকারীর স্বাক্ষর ও তারিখ', 'Signature of the planner and date')}</span>
      </div>
    </div>
  );
  const pair = (f, from) => {
    const val = from ? from[f.k] : value(f);
    const text = val === undefined || val === '' || val === 0 ? '' : f.t === 'n' ? N(val) : val;
    return (
      <div className="gl-pair" key={f.k}>
        <span>{f.l[i]}</span>
        <b>
          {text}
          {text && f.u ? ' ' + f.u[i] : ''}
        </b>
      </div>
    );
  };

  return (
    <>
      <PageHead title={t('rp_title')} sub={t('rp_sub')} />
      <div className="tabs-scroll">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            ['daily', L('দৈনিক রিপোর্ট', 'Daily report')],
            ['plan', L('মাসিক পরিকল্পনা', 'Monthly plan')],
            ['glance', L('একনজরে মাসিক রিপোর্ট', 'Month at a glance')],
            ['annual', L('বার্ষিক পরিকল্পনা', 'Yearly plan')],
            ['about', L('পরিচিতি', 'About')],
          ]}
        />
      </div>

      {['daily', 'plan', 'glance'].includes(tab) && (
        <div className="datebar">
          <button type="button" className="btn" onClick={() => move(-1)} aria-label="Previous month">
            ‹
          </button>
          <strong>{monthName}</strong>
          <button type="button" className="btn" onClick={() => move(1)} aria-label="Next month">
            ›
          </button>
          <span className="muted">{L(`এই মাসে ${N(count)} দিন`, `${count} days in this month`)}</span>
        </div>
      )}

      {tab === 'daily' && (
        <>
          {/* plan vs actual */}
          <Card
            title={L('পরিকল্পনা বনাম কাজ', 'Plan vs actual')}
            hint={elapsed > 0 ? L(`${N(elapsed)} দিন পার হয়েছে, সে অনুযায়ী হিসাব`, `Based on the ${elapsed} days that have passed`) : L('মাস শুরু হলে হিসাব দেখাবে', 'Tracking starts once the month begins')}
          >
            {behind.length > 0 && (
              <div className="warn" role="alert">
                <strong>{L(`সতর্কতা: ${N(behind.length)}টা বিষয়ে তুমি পরিকল্পনার চেয়ে পিছিয়ে আছ`, `Warning: you are behind your plan on ${behind.length} item(s)`)}</strong>
                <ul>
                  {behind.map((r) => (
                    <li key={r.label[1]}>
                      {r.label[i]}: {L(`এ পর্যন্ত হওয়ার কথা ${N(r.expected)}, হয়েছে ${N(r.actual)}। বাকি দিনগুলোতে দিনে গড়ে ${N(r.perDay)} করতে হবে।`, `expected ${r.expected} by now, done ${r.actual}. You need about ${r.perDay} per day for the rest of the month.`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {T.kaza > 0 && <p className="warn slim">{L(`এই মাসে ${N(T.kaza)} ওয়াক্ত নামাজ কাজা হয়েছে।`, `${T.kaza} prayer(s) were missed this month.`)}</p>}
            {Object.keys(m.plan).length === 0 && (
              <p className="muted" style={{ marginBottom: 10 }}>
                {L('এই মাসের পরিকল্পনা এখনো লেখা হয়নি। "মাসিক পরিকল্পনা" ট্যাবে লিখলে প্রতিটা বিষয়ের অগ্রগতি এখানে দেখাবে।', 'No plan for this month yet. Write one in the "Monthly plan" tab to see progress for every item here.')}
              </p>
            )}
            <div className="track">
              {rows.map((r) => (
                <div className={'track-row' + (r.behind ? ' behind' : '')} key={r.label[1]}>
                  <span>{r.label[i]}</span>
                  <Bar value={r.actual} max={r.target} color={r.behind ? 'var(--bad)' : 'var(--ok)'} />
                  <b>
                    {N(r.actual)} / {N(r.target)}
                  </b>
                  <em>{r.done ? L('পূরণ', 'Done') : r.behind ? L('পিছিয়ে', 'Behind') : L('ঠিক আছে', 'On track')}</em>
                </div>
              ))}
            </div>
          </Card>

          <Tabs value={view} onChange={setView} items={[['track', L('আজকের রিপোর্ট লেখো', 'Write the report')], ['sheet', L('পুরো মাসের টেবিল', 'Whole-month table')]]} />

          {view === 'track' ? (
            <>
              <div className="daychips" role="group" aria-label={L('তারিখ', 'Date')}>
                {Array.from({ length: count }, (_, k) => k + 1).map((n) => (
                  <button
                    type="button"
                    key={n}
                    disabled={future(n)}
                    aria-pressed={n === sel}
                    className={(n === sel ? 'on ' : '') + (isToday(n) ? 'is-now ' : '') + (m.days[n] && Object.keys(m.days[n]).length ? 'has' : '')}
                    onClick={() => setDay(n)}
                  >
                    {N(n)}
                  </button>
                ))}
              </div>
              <h3 className="group-title">{fmtDate(`${ym}-${String(sel).padStart(2, '0')}`, lang)}</h3>

              <div className="cols">
                <div>
                  <Card title={L('অধ্যয়ন', 'Study')}>{dayGrid(DAY_STUDY)}</Card>
                  <Card title={L('ক্লাস ও নামাজ', 'Classes and prayer')}>{dayGrid(DAY_CLASS, true)}</Card>
                  <Card title={L('সাংগঠনিক দায়িত্ব পালন', 'Organisational duties')}>{dayGrid(DAY_ORG)}</Card>
                  <Card title={L('আজ করেছি', 'Done today')}>
                    <ul className="list">
                      {DAY_CHECKS.map(([k, bn, en]) => (
                        <li key={k} className={d[k] ? 'done' : ''}>
                          <Check on={!!d[k]} label={L(bn, en)} onClick={() => setDayVal(k, !d[k])} />
                          <span>{L(bn, en)}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                <div>
                  <Card title={L('যোগাযোগ (জন)', 'Contacts (people)')}>{dayGrid(CONTACTS.map((c) => asField(c, 'ct_')))}</Card>
                  <Card title={L('বিতরণ (টি)', 'Distribution (pcs)')}>{dayGrid(DIST.map((c) => asField(c, 'ds_')))}</Card>
                </div>
              </div>
            </>
          ) : (
            <Sheet title={L('দৈনিক রিপোর্ট', 'Daily report')} sub={monthName} file={'report-daily-' + ym}>
              <table className="rp-table">
                <colgroup>
                  <col style={{ width: 28 }} />
                  <col style={{ width: 84 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th rowSpan="2" className="rp-date">
                      {L('তারিখ', 'Date')}
                    </th>
                    {TABLE_GROUPS.map(([g, cols], k) =>
                      cols.length === 1 ? (
                        <th key={k} rowSpan="2" className="rp-sub">
                          <span>{g[i]}</span>
                        </th>
                      ) : (
                        <th key={k} colSpan={cols.length} className="rp-group">
                          {g[i]}
                        </th>
                      )
                    )}
                  </tr>
                  <tr>
                    {TABLE_GROUPS.flatMap(([, cols], k) =>
                      cols.length === 1
                        ? []
                        : cols.map((c, j) => (
                            <th key={k + '-' + j} className={'rp-sub' + (k === 0 && j === 0 ? ' rp-surah' : '')}>
                              <span>{c[i]}</span>
                            </th>
                          ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: count }, (_, k) => k + 1).map((n) => {
                    const x = m.days[n] || {};
                    const nums = rowNums(x);
                    return (
                      <tr key={n}>
                        <th>{N(n)}</th>
                        <td className="rp-surah">{x.surah}</td>
                        {nums.map((val, k) => (
                          <td key={k}>{k >= 23 ? (val ? '✓' : '') : show(val)}</td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="rp-total">
                    <th>{L('মোট', 'Total')}</th>
                    <td />
                    {sums.map((val, k) => (
                      <td key={k}>{show(Math.round(val * 10) / 10)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Sheet>
          )}
        </>
      )}

      {tab === 'plan' && (
        <>
          <p className="notice">{L('মাসের শুরুতে লক্ষ্য লেখো। দৈনিক রিপোর্টের সাথে মিলিয়ে অ্যাপ প্রতিদিন দেখাবে তুমি এগিয়ে আছ নাকি পিছিয়ে।', 'Write your targets at the start of the month. The app compares them with the daily report and shows whether you are ahead or behind.')}</p>
          {writeTabs}
          {pv === 'track' ? (
            <div className="spec-cols" style={{ marginTop: 16 }}>
              <SpecForm spec={MONTH_SPEC} values={m.plan} i={i} mode="plan" set={(k, val) => upMonth((mm) => put(mm.plan, k, val))} />
            </div>
          ) : (
            <Sheet title={L('মাসিক পরিকল্পনা', 'Monthly plan')} sub={monthName} file={'report-plan-' + ym}>
              {planSheet(MONTH_SPEC, m.plan)}
            </Sheet>
          )}
        </>
      )}

      {tab === 'glance' && (
        <>
          <p className="notice">{L('দৈনিক রিপোর্ট থেকে যা হিসাব করা যায় সব নিজে থেকে বসে গেছে। নিচের ঘরগুলো শুধু নিজে লিখতে হয় (যেমন বৃদ্ধি, বায়তুলমাল)।', 'Everything that can be worked out from the daily report is filled in automatically. Only the boxes below are typed by hand (growth, baitulmal and so on).')}</p>
          <details className="card">
            <summary>{L('নিজে লেখার ঘরগুলো', 'Boxes to fill in by hand')}</summary>
            <div className="spec-cols" style={{ marginTop: 14 }}>
              <SpecForm spec={MONTH_SPEC} values={m.extra} i={i} mode="report" set={(k, val) => upMonth((mm) => put(mm.extra, k, val))} />
            </div>
          </details>

          <Sheet title={L('একনজরে মাসিক রিপোর্ট', 'Monthly report at a glance')} sub={monthName} file={'report-month-' + ym}>
            <div className="gl">
              {['quran', 'hadith', 'lit', 'text', 'namaz', 'org', 'contact', 'dist', 'bm', 'misc'].map((id) => MONTH_SPEC.find((x) => x.id === id)).map((sec) => (
                <section key={sec.id} className={'gl-sec gl-' + sec.id}>
                  <h4>{sec.title[i]}</h4>
                  <div className="gl-grid">{sec.fields.map((f) => pair(f))}</div>
                </section>
              ))}
              <section className="gl-sec gl-wide">
                <h4>{L('বৃদ্ধি', 'Growth')}</h4>
                <div className="gl-growth">
                  {GROWTH.map(([k, bn, en]) => (
                    <div key={k}>
                      <span>{L(bn, en)}</span>
                      <b>{show(m.extra['gr_' + k])}</b>
                      <em>{m.extra['grn_' + k]}</em>
                    </div>
                  ))}
                </div>
              </section>
              <section className="gl-sec gl-wide gl-advice">
                <h4>{L('দায়িত্বশীলের পরামর্শ ও স্বাক্ষর', 'Advice and signature of the person in charge')}</h4>
                <p>{m.extra.advice}</p>
                <span>{L('স্বাক্ষর ও তারিখ', 'Signature and date')}</span>
              </section>
            </div>
          </Sheet>
        </>
      )}

      {tab === 'annual' && (
        <>
          <Card>
            <label className="field" style={{ maxWidth: 200, marginBottom: 0 }}>
              <span>{L('সাল', 'Year')}</span>
              <input type="number" min="2000" max="2100" value={year} onChange={(e) => Number(e.target.value) > 999 && setYear(Number(e.target.value))} />
            </label>
          </Card>
          {writeTabs}
          {pv === 'track' ? (
            <div className="spec-cols" style={{ marginTop: 16 }}>
              <SpecForm spec={ANNUAL_SPEC} values={annual} i={i} mode="plan" set={(k, val) => update((x) => put((x.report.annual[year] ??= {}), k, val))} />
            </div>
          ) : (
            <Sheet title={L('বার্ষিক পরিকল্পনা', 'Yearly plan')} sub={L(`সাল: ${N(year).replace(/[,،]/g, '')}`, `Year: ${year}`)} file={'report-yearly-plan-' + year}>
              {planSheet(ANNUAL_SPEC, annual)}
            </Sheet>
          )}
        </>
      )}

      {tab === 'about' && (
        <div className="guide">
          <Card title={L('ব্যক্তিগত রিপোর্ট কেন', 'Why keep a personal report')}>
            <p>{L('প্রতিদিন নিজের কাজের হিসাব লিখে রাখলে ভুলগুলো চোখে পড়ে আর ধীরে ধীরে জীবন গোছানো হয়। রিপোর্ট হলো আয়নার মতো: নিজেকে দেখার আর শুধরে নেওয়ার উপায়।', 'Writing down what you did each day makes mistakes visible and slowly brings order to life. A report is like a mirror: a way to see yourself and improve.')}</p>
            <p className="muted" style={{ marginTop: 10 }}>
              {L('ভাবার্থ: "প্রত্যেকে যেন ভেবে দেখে আগামীকালের জন্য সে কী পাঠিয়েছে।" (সূরা আল-হাশর: ১৮)', 'Meaning: "Let every soul consider what it has sent ahead for tomorrow." (Surah Al-Hashr: 18)')}
            </p>
            <p className="muted">{L('ভাবার্থ: "তোমার আমলনামা পড়ো; আজ নিজের হিসাব নেওয়ার জন্য তুমি নিজেই যথেষ্ট।" (সূরা বনি ইসরাইল: ১৪)', 'Meaning: "Read your record; today you yourself are enough to take your own account." (Surah Bani Israil: 14)')}</p>
            <p className="hint" style={{ marginTop: 10 }}>
              {L('এই পাতার লেখাগুলো সংক্ষিপ্ত সারাংশ। পূর্ণ ব্যাখ্যার জন্য ছাপা রিপোর্ট বই দেখো।', 'The text on this page is a short summary. See the printed report book for the full explanation.')}
            </p>
          </Card>
          <Card title={L('রিপোর্টের অংশগুলো', 'Parts of the report')}>
            <ol className="about-list">
              {ABOUT.map(([title, text]) => (
                <li key={title[1]}>
                  <strong>{title[i]}:</strong> {text[i]}
                </li>
              ))}
            </ol>
          </Card>
          <Card title={L('কীভাবে ব্যবহার করবে', 'How to use it')}>
            <ol className="about-list">
              <li>{L('মাসের শুরুতে "মাসিক পরিকল্পনা" লেখো।', 'At the start of the month, write the "Monthly plan".')}</li>
              <li>{L('প্রতিদিন রাতে "দৈনিক রিপোর্ট"-এ সেই দিনের ঘরগুলো পূরণ করো।', 'Each night, fill in that day in the "Daily report".')}</li>
              <li>{L('পিছিয়ে পড়লে উপরে লাল সতর্কতা দেখাবে, সাথে বাকি দিনে দিনে কতটা করতে হবে।', 'If you fall behind, a red warning appears with how much you need per day for the rest of the month.')}</li>
              <li>{L('মাস শেষে "মোট" সারি আর "একনজরে মাসিক রিপোর্ট" নিজে থেকেই তৈরি থাকবে; PDF নামিয়ে বা প্রিন্ট করে নাও।', 'At the end of the month the "Total" row and the "Month at a glance" page are ready; download the PDF or print it.')}</li>
            </ol>
          </Card>
        </div>
      )}
    </>
  );
}
