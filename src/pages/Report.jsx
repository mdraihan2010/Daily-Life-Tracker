import { useState } from 'react';
import { useApp } from '../store.jsx';
import { today, parse, loc, fmtDate } from '../utils.js';
import { Card, Check, Tabs, PageHead, Bar, NumInput } from '../components/ui.jsx';
import Sheet from '../components/Sheet.jsx';
import { MONTH_SPEC, ANNUAL_SPEC, CONTACTS, DIST, GROWTH, DAY_STUDY, DAY_CLASS, DAY_ORG, DAY_CHECKS, WAQTS, prayerState, TABLE_GROUPS, daysIn, newMonthRep, getMonthRep, totals, rowNums, elapsedDays, track } from '../report.js';

// one labelled input; empty value removes the key so "nothing written" stays empty
function Input({ f, value, onChange, i, max, stepper }) {
  const label = f.l[i] + (f.u ? ` (${f.u[i]})` : '');
  const clamp = (x) => Math.min(max ?? Infinity, Math.max(0, x));
  const bump = (dir) => {
    const next = clamp(Math.round(((Number(value) || 0) + dir * (f.st || 1)) * 10) / 10);
    onChange(next === 0 ? undefined : next);
  };
  const number = (
    <NumInput value={value} max={max} onChange={onChange} />
  );
  return (
    <label className={'field' + (value !== undefined ? ' filled' : '')}>
      <span>{label}</span>
      {f.t !== 'n' ? (
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} />
      ) : stepper ? (
        <div className="stepper">
          <button type="button" onClick={() => bump(-1)} disabled={!value} aria-label={'− ' + label}>
            −
          </button>
          {number}
          <button type="button" onClick={() => bump(1)} aria-label={'+ ' + label}>
            +
          </button>
        </div>
      ) : (
        number
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
  [
    ['কুরআন অধ্যয়ন', 'Quran study'],
    ['ইসলামকে জানার প্রথম উৎস কুরআন, তাই এর সাথে প্রতিদিনের সম্পর্ক রাখাই এই ঘরের উদ্দেশ্য। শুধু তিলাওয়াত নয়, অর্থ ও ব্যাখ্যা বুঝে পড়ার চেষ্টা করো, আর যা পড়লে তা নিজের আচরণে আনার কথা ভাবো।', 'The Quran is the first source for knowing Islam, so this box is about keeping a daily link with it. Try to read with meaning and explanation, not recitation alone, and think about bringing what you read into your own conduct.'],
    ['প্রতিদিন কোন সূরা আর কত আয়াত পড়লে লেখো। মাসিক পরিকল্পনায় "মোট দিন" আর "গড় আয়াত" দিলে অ্যাপ মাসের লক্ষ্য হিসাব করে নেয়। একটা নির্দিষ্ট সময়ে পুরো কুরআন একবার শেষ করার লক্ষ্য রাখতে পারো।', 'Each day write the surah and the number of ayat. If you give "total days" and "average ayat" in the monthly plan, the app works out the month\'s target. You can aim to finish the whole Quran within a set period.'],
  ],
  [
    ['হাদিস অধ্যয়ন', 'Hadith study'],
    ['হাদিস কুরআনের ব্যাখ্যা, তাই কুরআনের পাশাপাশি নিয়মিত হাদিস পড়াও দরকার। পড়া হাদিসের সাথে নিজের জীবন মিলিয়ে দেখো: কোনটা মানছ, কোনটা এখনো বাকি।', 'Hadith explains the Quran, so regular hadith reading belongs beside it. Compare what you read with your own life: what you already follow and what is still missing.'],
    ['প্রতিদিন কয়টা হাদিস পড়লে সেই সংখ্যা লেখো। কোন গ্রন্থ বা বিষয় থেকে পড়ছ, দারস প্রস্তুত আর মুখস্থের হিসাব মাস শেষে "একনজরে" ট্যাবে লিখবে।', 'Write the number of hadith read each day. The book or topic, dars prepared and memorisation are written at the end of the month in the "Month at a glance" tab.'],
  ],
  [
    ['সাহিত্য অধ্যয়ন', 'Literature study'],
    ['নিজের আদর্শকে ভালোভাবে জানতে এবং সমকালীন অন্যান্য চিন্তাধারা সম্পর্কে ধারণা রাখতে নিয়মিত বই পড়া দরকার। মুখস্থ করা কথা নয়, বুঝে পড়া আর নিজে চিন্তা করতে শেখাই এখানে আসল।', 'Regular reading is needed to know your own ideals well and to understand other ideas of the time. The point is understanding and learning to think for yourself, not repeating memorised lines.'],
    ['ইসলামী সাহিত্য আর অন্যান্য বই আলাদা ঘরে, কত পৃষ্ঠা পড়লে লেখো। বই শেষ হলে নোট করো; বইয়ের নাম, বই নোট আর আলোচনা নোটের সংখ্যা মাস শেষে লিখবে।', 'Write pages read in separate boxes for Islamic literature and other books. Take notes when you finish a book; book names and the number of book notes and discussion notes go in at the end of the month.'],
  ],
  [
    ['পাঠ্যপুস্তক অধ্যয়ন ও ক্লাসে উপস্থিতি', 'Textbook study and class attendance'],
    ['ছাত্র হিসেবে ভালো ফল করা তোমার মূল দায়িত্বের অংশ; অন্য কাজের অজুহাতে পড়াশোনার ক্ষতি করা চলবে না। পড়াশোনা আর অন্য দায়িত্বের মধ্যে ভারসাম্য রাখাই লক্ষ্য।', 'Doing well as a student is part of your main responsibility; other work is no excuse for neglecting studies. The goal is balance between study and your other duties.'],
    ['প্রতিদিন কত ঘণ্টা পাঠ্যবই পড়লে, সেদিন কয়টা ক্লাস ছিল আর কয়টায় উপস্থিত ছিলে লেখো। আধা ঘণ্টা হলে ০.৫ লেখা যায়।', 'Each day write hours of textbook study, how many classes were held and how many you attended. Half an hour can be written as 0.5.'],
  ],
  [
    ['জামায়াতে নামাজ', 'Prayer in congregation'],
    ['নামাজ আল্লাহর সাথে সম্পর্কের সবচেয়ে বড় মাধ্যম, আর জামায়াতে পড়লে জীবনে শৃঙ্খলা ও সময়ানুবর্তিতা আসে। তাই পাঁচ ওয়াক্তই জামায়াতে পড়ার চেষ্টা থাকবে।', 'Prayer is the strongest link with Allah, and praying in congregation brings discipline and punctuality into life. So the aim is all five prayers in congregation.'],
    ['প্রতিদিন কয় ওয়াক্ত জামায়াতে পড়লে (০ থেকে ৫) আর কয় ওয়াক্ত কাজা হলো লেখো। এর লক্ষ্য সবসময় দিনে ৫ ওয়াক্ত ধরা, আলাদা করে পরিকল্পনায় লিখতে হয় না। কাজা হলে অ্যাপ আলাদা করে দেখায়।', 'Each day write how many prayers were in congregation (0 to 5) and how many were missed. The target is always 5 a day, so it does not need to be written in the plan. Missed prayers are shown separately.'],
  ],
  [
    ['যোগাযোগ', 'Contacts'],
    ['যোগাযোগ মানে উদ্দেশ্যহীন দেখা-সাক্ষাৎ নয়; আন্তরিকভাবে কথা বলা, একে অপরের খোঁজ নেওয়া, সমস্যা বোঝা আর ভালো কাজে উৎসাহ দেওয়া। দুই-চার মিনিটের আলাপের চেয়ে অল্প কয়েকজনকে ঠিক করে নিয়মিত সময় দেওয়া বেশি কাজের।', 'Contact does not mean aimless meetings; it means sincere conversation, asking after one another, understanding problems and encouraging good work. Giving regular time to a few chosen people is worth more than many two-minute chats.'],
    ['কোন ধরনের কতজনের সাথে যোগাযোগ করলে সেই সংখ্যা লেখো (সদস্য, সাথী, কর্মী, সমর্থক, বন্ধু ইত্যাদি)। মাসের শুরুতে পরিকল্পনায় কার সাথে কতবার যোগাযোগ করবে ঠিক করে রাখো।', 'Write how many people of each kind you contacted (member, sathi, worker, supporter, friend and so on). At the start of the month decide in the plan whom you will contact and how often.'],
  ],
  [
    ['বিতরণ', 'Distribution'],
    ['বই ও অন্যান্য উপকরণ মানুষের ভুল ধারণা দূর করার সহজ উপায়। কাউকে বই দেওয়ার আগে তার পড়ার আগ্রহ তৈরি করো, আর পরে খোঁজ নাও সে পড়েছে ও বুঝেছে কি না।', 'Books and other materials are a simple way to remove misunderstandings. Before giving someone a book, build their interest in reading it, and afterwards check whether they read and understood it.'],
    ['কোন উপকরণ কয়টা বিতরণ করলে লেখো: সাহিত্য, পত্রিকা, পরিচিতি, ক্লাস রুটিন, স্টিকার/কার্ড, উপহার ইত্যাদি। ছাপা টেবিলে এগুলো চার কলামে যোগ হয়ে দেখায়।', 'Write how many of each item you distributed: literature, magazines, introduction booklets, class routines, stickers/cards, gifts and so on. In the printed table they are added into four columns.'],
  ],
  [
    ['সাংগঠনিক দায়িত্ব পালন', 'Organisational duties'],
    ['নিজের ও অন্যের জীবন গঠনের কাজের পাশাপাশি যে দায়িত্ব তোমাকে দেওয়া হয়েছে সেটা ঠিকমতো পালন করাও রিপোর্টের অংশ: সভা, পরিকল্পনা, কাজের তদারকি, অনুষ্ঠানে অংশ নেওয়া, দাওয়াতি কাজ ইত্যাদি।', 'Besides working on your own life and that of others, carrying out the responsibilities given to you is part of the report: meetings, planning, supervising work, joining programmes, dawah work and so on.'],
    ['দাওয়াতি কাজে আর অন্যান্য সাংগঠনিক কাজে কত ঘণ্টা সময় দিলে আলাদা ঘরে লেখো। মাস শেষে অ্যাপ মোট দিন ও গড় ঘণ্টা বের করে দেয়।', 'Write hours given to dawah work and to other organisational work in separate boxes. At the end of the month the app works out total days and average hours.'],
  ],
  [
    ['পত্রিকা পাঠ', 'Newspaper reading'],
    ['দেশ ও দুনিয়ায় কী ঘটছে তা জানা একজন সচেতন ছাত্র ও নাগরিকের কাজ। শুধু পড়া নয়, ঘটনাগুলো নিয়ে নিজের মতামত তৈরি করতে শেখো।', 'Knowing what is happening in the country and the world is the work of an aware student and citizen. Do more than read: learn to form your own view of events.'],
    ['যেদিন পত্রিকা বা সাময়িকী পড়লে সেদিন টিক দাও।', 'Tick the days you read a newspaper or periodical.'],
  ],
  [
    ['শরীরচর্চা', 'Exercise'],
    ['সুস্বাস্থ্য আল্লাহর একটা নিয়ামত, আর শরীর ভালো থাকলে মন ও কাজ দুটোই ভালো থাকে। প্রতিদিন একটা নির্দিষ্ট সময়ে অল্প হলেও ব্যায়াম বা হাঁটার অভ্যাস করো।', 'Good health is a blessing from Allah, and a healthy body keeps both mind and work in good shape. Make a habit of some exercise or walking at a fixed time every day.'],
    ['যেদিন শরীরচর্চা করলে সেদিন টিক দাও।', 'Tick the days you exercised.'],
  ],
  [
    ['আত্মসমালোচনা', 'Self-criticism'],
    ['আত্মসমালোচনা মানে দিনশেষে নিজের সারাদিনের কাজের হিসাব নিজেই নেওয়া: কী ভালো হলো, কোথায় ভুল হলো, কাল কী শুধরাব। এটা করার সময় মনে রাখো, একদিন আল্লাহর সামনে এই হিসাবই দিতে হবে। এর জন্য একটা নির্দিষ্ট সময় ঠিক করে নেওয়া ভালো, যেমন এশার পর বা ঘুমানোর আগে।', 'Self-criticism means taking account of your own day at its end: what went well, where you went wrong, what you will correct tomorrow. While doing it, remember that one day this same account must be given before Allah. A fixed time helps, for example after Isha or before sleep.'],
    ['যেদিন আত্মসমালোচনা করলে সেদিন টিক দাও। এই অ্যাপে দৈনিক রিপোর্ট লেখার সময়টাই এর জন্য ভালো সুযোগ।', 'Tick the days you did it. The moment you write the daily report in this app is a good time for it.'],
  ],
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
  const [sureClear, setSureClear] = useState(false);

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

  const dayGrid = (fields) => (
    <div className="spec-grid step-grid">
      {fields.map((f) => (
        <Input key={f.k} f={f} i={i} stepper value={d[f.k]} onChange={(val) => setDayVal(f.k, val)} />
      ))}
    </div>
  );
  // small green tick in a card header once that part of the day has something written
  const has = (keys) => keys.some((k) => d[k] !== undefined);
  const badge = (keys) => (has(keys) ? <span className="badge-ok">✓ {L('লেখা হয়েছে', 'Written')}</span> : <span className="badge-no">{L('ফাঁকা', 'Empty')}</span>);
  const parts = [
    DAY_STUDY.map((f) => f.k),
    DAY_CLASS.map((f) => f.k),
    ['nz', 'jam', 'kaza'],
    DAY_ORG.map((f) => f.k),
    DAY_CHECKS.map(([k]) => k),
    CONTACTS.map(([k]) => 'ct_' + k),
    DIST.map(([k]) => 'ds_' + k),
  ];
  const partsDone = parts.filter(has).length;
  const nz = prayerState(d);
  const setPrayer = (id, val) =>
    upMonth((mm) => {
      const x = (mm.days[sel] ??= {});
      const cur = { ...prayerState(x) };
      if (cur[id] === val) delete cur[id];
      else cur[id] = val;
      const cnt = (c) => Object.values(cur).filter((v) => v === c).length;
      put(x, 'nz', Object.keys(cur).length ? cur : undefined);
      put(x, 'jam', cnt('j') || undefined);
      put(x, 'kaza', cnt('k') || undefined);
    });
  const prev = m.days[sel - 1];
  const dayEmpty = Object.keys(d).length === 0;
  const isFriday = parse(`${ym}-${String(sel).padStart(2, '0')}`).getDay() === 5;

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
              <div className="daybar">
                <div>
                  <h3>{fmtDate(`${ym}-${String(sel).padStart(2, '0')}`, lang)}</h3>
                  <p className="hint">{L(`৭টা অংশের মধ্যে ${N(partsDone)}টায় লেখা হয়েছে`, `${partsDone} of 7 parts written`)}</p>
                  <Bar value={partsDone} max={7} color="var(--ok)" />
                </div>
                <div className="daybar-actions">
                  {dayEmpty && prev && Object.keys(prev).length > 0 && (
                    <button type="button" className="btn" onClick={() => upMonth((mm) => (mm.days[sel] = structuredClone(mm.days[sel - 1])))}>
                      {L('গতকালের মতো বসাও', "Copy yesterday's entry")}
                    </button>
                  )}
                  {!dayEmpty && (
                    <button
                      type="button"
                      className="btn danger"
                      onBlur={() => setSureClear(false)}
                      onClick={() => {
                        if (!sureClear) return setSureClear(true);
                        upMonth((mm) => delete mm.days[sel]);
                        setSureClear(false);
                      }}
                    >
                      {sureClear ? t('s_reset_sure') : L('এই দিনের লেখা মুছো', "Clear this day's entry")}
                    </button>
                  )}
                </div>
              </div>

              <div className="cols">
                <div>
                  <Card title={L('অধ্যয়ন', 'Study')} right={badge(parts[0])}>
                    {dayGrid(DAY_STUDY)}
                  </Card>
                  <Card title={L('ক্লাস', 'Classes')} right={badge(parts[1])}>
                    {dayGrid(DAY_CLASS)}
                  </Card>
                  <Card title={L('নামাজ', 'Prayer')} hint={L('প্রতিটা ওয়াক্তে চাপ দিয়ে বেছে নাও: জামায়াতে পড়েছ নাকি কাজা হয়েছে।', 'Tap each prayer: offered in congregation, or missed.')} right={badge(parts[2])}>
                    <div className="waqts">
                      {WAQTS.map(([id, bn, en]) => (
                        <div className={'waqt' + (nz[id] ? ' ' + nz[id] : '')} key={id}>
                          <b>{id === 'zuhr' && isFriday ? L('জুমা', 'Jumu\'ah') : L(bn, en)}</b>
                          <button type="button" className="j" aria-pressed={nz[id] === 'j'} onClick={() => setPrayer(id, 'j')}>
                            {L('জামায়াত', 'Jamaat')}
                          </button>
                          <button type="button" className="k" aria-pressed={nz[id] === 'k'} onClick={() => setPrayer(id, 'k')}>
                            {L('কাজা', 'Kaza')}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="waqt-sum">
                      {L('জামায়াত', 'In congregation')}: <b className="ok">{N(d.jam || 0)}</b> / {N(5)} · {L('কাজা', 'Missed')}: <b className={d.kaza ? 'bad' : ''}>{N(d.kaza || 0)}</b>
                    </p>
                  </Card>
                  <Card title={L('সাংগঠনিক দায়িত্ব পালন', 'Organisational duties')} right={badge(parts[3])}>
                    {dayGrid(DAY_ORG)}
                  </Card>
                  <Card title={L('আজ করেছি', 'Done today')} right={badge(parts[4])}>
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
                  <Card title={L('যোগাযোগ (জন)', 'Contacts (people)')} right={badge(parts[5])}>
                    {dayGrid(CONTACTS.map((c) => asField(c, 'ct_')))}
                  </Card>
                  <Card title={L('বিতরণ (টি)', 'Distribution (pcs)')} right={badge(parts[6])}>
                    {dayGrid(DIST.map((c) => asField(c, 'ds_')))}
                  </Card>
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
              <NumInput value={year} max={2100} onChange={(v) => v > 999 && setYear(Math.round(v))} />
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
            <p>{L('জীবনকে গুছিয়ে, পরিকল্পনা করে আর নিয়ম মেনে চালাতে চাইলে সবচেয়ে সহজ ও বাস্তব উপায় হলো প্রতিদিন নিজের কাজের হিসাব লিখে রাখা এবং সেটা পর্যালোচনা করা। লিখে রাখলে ভুলগুলো চোখে পড়ে, আর চোখে পড়লে শুধরে নেওয়া যায়।', 'If you want to live in an organised, planned and disciplined way, the simplest and most practical method is to write down what you do each day and review it. Once written, mistakes become visible, and what is visible can be corrected.')}</p>
            <p style={{ marginTop: 8 }}>{L('হযরত ওমর (রা.)-এর একটি প্রসিদ্ধ উপদেশের ভাবার্থ: হিসাব দিতে হওয়ার আগে নিজেই নিজের হিসাব নিয়ে নাও।', 'The meaning of a well-known saying of Umar (may Allah be pleased with him): take account of yourself before you are called to account.')}</p>
            <p style={{ marginTop: 8 }}>{L('রিপোর্ট রাখার লাভ কয়েক দিকে: দ্বীনি জ্ঞান ও সাধারণ জ্ঞান দুটোই বাড়ে, ইবাদত ও চরিত্র উন্নত করার তাগিদ আসে, পড়াশোনায় ভালো করা সহজ হয়, আর শরীর ও মনের যত্ন নেওয়া হয়। রিপোর্ট আয়নার মতো: এতে নিজের ঘাটতি দেখা যায়। আসল উদ্দেশ্য ঘর পূরণ করা নয়, নিজেকে একজন ভালো মানুষ ও আদর্শ কর্মী হিসেবে গড়ে তোলা।', 'Keeping a report helps in several ways: religious and general knowledge both grow, you feel pushed to improve worship and character, doing well in studies becomes easier, and body and mind are cared for. A report is like a mirror: it shows what you lack. The real aim is not filling boxes but building yourself into a good person and a model worker.')}</p>
            <p className="muted" style={{ marginTop: 10 }}>
              {L('ভাবার্থ: "প্রত্যেকে যেন ভেবে দেখে আগামীকালের জন্য সে কী পাঠিয়েছে।" (সূরা আল-হাশর: ১৮)', 'Meaning: "Let every soul consider what it has sent ahead for tomorrow." (Surah Al-Hashr: 18)')}
            </p>
            <p className="muted">{L('ভাবার্থ: "তোমার আমলনামা পড়ো; আজ নিজের হিসাব নেওয়ার জন্য তুমি নিজেই যথেষ্ট।" (সূরা বনি ইসরাইল: ১৪)', 'Meaning: "Read your record; today you yourself are enough to take your own account." (Surah Bani Israil: 14)')}</p>
            <p className="hint" style={{ marginTop: 10 }}>
              {L('এই পাতার লেখা ছাপা রিপোর্ট বইয়ের হুবহু কপি নয়, নিজের ভাষায় লেখা ব্যাখ্যা। মূল লেখার জন্য ছাপা বইটা দেখো।', 'The text on this page is not a copy of the printed report book but an explanation in our own words. See the printed book for the original text.')}
            </p>
          </Card>
          <h3 className="group-title">{L('রিপোর্টের অংশগুলো', 'Parts of the report')}</h3>
          {ABOUT.map(([title, why, how], k) => (
            <Card key={title[1]} title={`${N(k + 1)}. ${title[i]}`}>
              <p>{why[i]}</p>
              <p className="about-how">
                <strong>{L('অ্যাপে যা লিখবে:', 'What to write in the app:')}</strong> {how[i]}
              </p>
            </Card>
          ))}
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
