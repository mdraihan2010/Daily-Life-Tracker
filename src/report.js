// Report Book: field lists, monthly totals and plan tracking.
// Every label is [Bangla, English].

const U = {
  day: ['দিন', 'days'],
  ppl: ['জন', 'people'],
  pcs: ['টি', 'pcs'],
  hr: ['ঘণ্টা', 'h'],
  pg: ['পৃষ্ঠা', 'pages'],
  tk: ['টাকা', 'BDT'],
  times: ['বার', 'times'],
  waqt: ['ওয়াক্ত', 'waqt'],
};
const n = (k, bn, en, u, auto) => ({ k, l: [bn, en], t: 'n', u, auto });
const s = (k, bn, en, auto) => ({ k, l: [bn, en], t: 's', auto });
const r1 = (x) => Math.round(x * 10) / 10;
const div = (a, b) => (b ? r1(a / b) : 0);

export const CONTACTS = [
  ['member', 'সদস্য', 'Member'],
  ['sathi', 'সাথী', 'Sathi'],
  ['kormi', 'কর্মী', 'Worker'],
  ['supporter', 'সমর্থক', 'Supporter'],
  ['friend', 'বন্ধু', 'Friend'],
  ['wellwisher', 'শুভাকাঙ্ক্ষী', 'Well-wisher'],
  ['school', 'স্কুল ছাত্র', 'School student'],
  ['bright', 'মেধাবী ছাত্র', 'Bright student'],
  ['teacher', 'শিক্ষক', 'Teacher'],
  ['muharrama', 'মুহাররমা', 'Muharrama'],
  ['vip', 'ভিআইপি', 'VIP'],
];
export const DIST = [
  ['lit', 'ইসলামী সাহিত্য', 'Islamic literature'],
  ['kishor', 'কিশোর পত্রিকা', 'Kishor magazine'],
  ['yw', 'Y.W.', 'Y.W.'],
  ['chhatro', 'ছাত্রসংবাদ', 'Chhatra Sangbad'],
  ['eng', 'ইংরেজি পত্রিকা', 'English magazine'],
  ['intro', 'পরিচিতি', 'Introduction booklet'],
  ['routine', 'ক্লাস রুটিন', 'Class routine'],
  ['sticker', 'স্টিকার/কার্ড', 'Sticker/Card'],
  ['gift', 'উপহার/মেসেজ/ই-মেইল', 'Gift/Message/E-mail'],
];
export const GROWTH = [
  ['member', 'সদস্য', 'Member'],
  ['memberC', 'সদস্যপ্রার্থী', 'Member candidate'],
  ['sathi', 'সাথী', 'Sathi'],
  ['sathiC', 'সাথীপ্রার্থী', 'Sathi candidate'],
  ['kormi', 'কর্মী', 'Worker'],
  ['supporter', 'সমর্থক', 'Supporter'],
  ['friend', 'বন্ধু', 'Friend'],
  ['wellwisher', 'শুভাকাঙ্ক্ষী', 'Well-wisher'],
];

// ---- what is written every day ----
export const DAY_STUDY = [
  s('surah', 'কুরআন: সূরা', 'Quran: surah'),
  n('ayat', 'কুরআন: আয়াত', 'Quran: ayat'),
  n('hadith', 'হাদিস (সংখ্যা)', 'Hadith (count)'),
  n('litI', 'ইসলামী সাহিত্য (পৃষ্ঠা)', 'Islamic literature (pages)'),
  n('litO', 'অন্যান্য সাহিত্য (পৃষ্ঠা)', 'Other literature (pages)'),
  n('text', 'পাঠ্যপুস্তক (ঘণ্টা)', 'Textbook study (hours)'),
];
export const DAY_CLASS = [
  n('cls', 'ক্লাস (সংখ্যা)', 'Classes held'),
  n('att', 'ক্লাসে উপস্থিতি', 'Classes attended'),
  n('jam', 'জামায়াতে নামাজ (ওয়াক্ত)', 'Prayers in congregation'),
  n('kaza', 'কাজা (ওয়াক্ত)', 'Missed prayers (kaza)'),
];
export const DAY_ORG = [
  n('dawah', 'দাওয়াতি কাজ (ঘণ্টা)', 'Dawah work (hours)'),
  n('org', 'অন্যান্য সাংগঠনিক কাজ (ঘণ্টা)', 'Other organisational work (hours)'),
];
export const DAY_CHECKS = [
  ['paper', 'পত্রিকা পাঠ', 'Read newspaper'],
  ['exercise', 'শরীরচর্চা', 'Exercise'],
  ['self', 'আত্মসমালোচনা', 'Self-criticism'],
];

// ---- monthly plan and "monthly report at a glance" share one field list ----
// A field with `auto` is filled from the daily report; the others are typed in.
export const MONTH_SPEC = [
  {
    id: 'quran',
    title: ['কুরআন অধ্যয়ন', 'Quran study'],
    fields: [
      n('q_days', 'মোট দিন', 'Total days', U.day, (T) => T.qDays),
      n('q_avg', 'গড় আয়াত', 'Average ayat', null, (T) => div(T.ayat, T.qDays)),
      s('q_surah', 'সূরার নাম', 'Surah names', (T) => T.surahs.join(', ')),
      n('q_dars', 'দারস প্রস্তুত', 'Dars prepared', U.pcs),
      n('q_mem', 'মুখস্থ: আয়াত', 'Memorised: ayat'),
      s('q_memSurah', 'অর্থসহ সূরা', 'Surah with meaning'),
    ],
  },
  {
    id: 'hadith',
    title: ['হাদিস অধ্যয়ন', 'Hadith study'],
    fields: [
      n('h_days', 'মোট দিন', 'Total days', U.day, (T) => T.hDays),
      n('h_avg', 'গড় হাদিস', 'Average hadith', null, (T) => div(T.hadith, T.hDays)),
      s('h_book', 'গ্রন্থ/বিষয়', 'Book/Topic'),
      n('h_dars', 'দারস প্রস্তুত', 'Dars prepared', U.pcs),
      n('h_mem', 'মুখস্থ', 'Memorised', U.pcs),
      s('h_topic', 'মুখস্থের বিষয়', 'Topic memorised'),
    ],
  },
  {
    id: 'lit',
    title: ['সাহিত্য অধ্যয়ন', 'Literature study'],
    fields: [
      n('l_islami', 'ইসলামী', 'Islamic', U.pg, (T) => T.litI),
      n('l_other', 'অন্যান্য', 'Other', U.pg, (T) => T.litO),
      s('l_books', 'বইয়ের নাম', 'Book names'),
      n('l_notes', 'বই নোট', 'Book notes', U.pcs),
      n('l_disc', 'আলোচনা নোট', 'Discussion notes', U.pcs),
    ],
  },
  {
    id: 'text',
    title: ['পাঠ্যপুস্তক অধ্যয়ন ও ক্লাস', 'Textbook study and classes'],
    fields: [
      n('t_days', 'মোট দিন', 'Total days', U.day, (T) => T.tDays),
      n('t_avg', 'গড় ঘণ্টা', 'Average hours', U.hr, (T) => div(T.text, T.tDays)),
      n('c_total', 'মোট ক্লাস', 'Total classes', null, (T) => T.cls),
      n('c_attend', 'উপস্থিতি', 'Attended', null, (T) => T.att),
    ],
  },
  {
    id: 'namaz',
    only: 'report',
    title: ['নামাজ', 'Prayer'],
    fields: [
      n('nz_jam', 'জামায়াত', 'In congregation', U.waqt, (T) => T.jam),
      n('nz_avg', 'দিনে গড়', 'Daily average', null, (T) => div(T.jam, T.filled)),
      n('nz_kaza', 'কাজা', 'Missed (kaza)', U.waqt, (T) => T.kaza),
    ],
  },
  {
    id: 'contact',
    title: ['যোগাযোগ', 'Contacts'],
    fields: CONTACTS.map(([k, bn, en]) => n('ct_' + k, bn, en, U.ppl, (T) => T.ct[k] || 0)),
  },
  {
    id: 'org',
    title: ['সাংগঠনিক দায়িত্ব পালন', 'Organisational duties'],
    fields: [
      n('o_dawahDays', 'দাওয়াতি কাজ: দিন', 'Dawah work: days', U.day, (T) => T.dawahDays),
      n('o_dawahAvg', 'দাওয়াতি কাজ: গড় ঘণ্টা', 'Dawah work: avg hours', U.hr, (T) => div(T.dawah, T.dawahDays)),
      n('o_otherDays', 'অন্যান্য সাংগঠনিক কাজ: দিন', 'Other work: days', U.day, (T) => T.otherDays),
      n('o_otherAvg', 'অন্যান্য সাংগঠনিক কাজ: গড় ঘণ্টা', 'Other work: avg hours', U.hr, (T) => div(T.org, T.otherDays)),
    ],
  },
  {
    id: 'dist',
    title: ['বিতরণ', 'Distribution'],
    fields: DIST.map(([k, bn, en]) => n('ds_' + k, bn, en, U.pcs, (T) => T.ds[k] || 0)),
  },
  {
    id: 'growth',
    title: ['বৃদ্ধি', 'Growth'],
    fields: GROWTH.flatMap(([k, bn, en]) => [n('gr_' + k, bn + ': সংখ্যা', en + ': count'), s('grn_' + k, bn + ': নাম', en + ': names')]),
  },
  {
    id: 'bm',
    title: ['বায়তুলমাল', 'Baitulmal'],
    fields: [
      s('bm_date', 'পরিশোধের তারিখ', 'Payment date'),
      n('bm_personal', 'ব্যক্তিগত বৃদ্ধি', 'Personal increase', U.tk),
      n('bm_total', 'মোট বৃদ্ধি', 'Total increase', U.tk),
      n('bm_welfare', 'ছাত্রকল্যাণ', 'Student welfare', U.tk),
      n('bm_table', 'টেবিল ব্যাংক', 'Table bank', U.tk),
      n('bm_kolsi', 'কলসি/হাঁড়ি', 'Kolsi/Hari', U.pcs),
    ],
  },
  {
    id: 'misc',
    title: ['বিবিধ', 'Miscellaneous'],
    fields: [
      n('m_self', 'আত্মসমালোচনা', 'Self-criticism', U.day, (T) => T.self),
      n('m_exercise', 'শরীরচর্চা', 'Exercise', U.day, (T) => T.exercise),
      n('m_paper', 'পত্রিকা পাঠ', 'Newspaper reading', U.day, (T) => T.paper),
      n('m_relatives', 'আত্মীয়স্বজন (পুরুষ) যোগাযোগ', 'Contact with relatives (male)', U.ppl),
      n('m_group', 'গ্রুপ দাওয়াতি কাজ', 'Group dawah work', U.times),
      n('m_msg', 'দাওয়াতি মেসেজ প্রেরণ', 'Dawah messages sent', U.pcs),
      n('m_email', 'দাওয়াতি ই-মেইল প্রেরণ', 'Dawah e-mails sent', U.pcs),
      n('m_nonmuslim', 'অমুসলিম বন্ধু যোগাযোগ', 'Contact with non-Muslim friends', U.ppl),
      n('m_friendorg', 'বন্ধু সংগঠনের সাথে যোগাযোগ', 'Contact with friendly organisations', U.ppl),
      n('m_computer', 'দক্ষতা উন্নয়ন: কম্পিউটার শিক্ষা', 'Skills: computer learning', U.day),
      n('m_language', 'দক্ষতা উন্নয়ন: ভাষা শিক্ষা', 'Skills: language learning', U.day),
      s('m_other', 'দক্ষতা উন্নয়ন: অন্যান্য', 'Skills: other'),
      n('m_show', 'নিজ উদ্যোগে দায়িত্বশীলকে রিপোর্ট দেখানো', 'Showed the report to the person in charge', U.times),
      s('m_showDate', 'রিপোর্ট দেখানোর তারিখ', 'Date shown'),
    ],
  },
  {
    id: 'advice',
    title: ['দায়িত্বশীলের পরামর্শ', 'Advice from the person in charge'],
    fields: [s('advice', 'পরামর্শ', 'Advice')],
  },
];

// ---- yearly plan ----
export const ANNUAL_SPEC = [
  {
    id: 'who',
    title: ['পরিচয়', 'Details'],
    fields: [s('branch', 'শাখা', 'Branch'), s('duty', 'দায়িত্ব', 'Responsibility'), s('cls', 'শ্রেণি', 'Class'), s('yr', 'বর্ষ', 'Year'), s('dept', 'বিভাগ', 'Department'), s('inst', 'শিক্ষাপ্রতিষ্ঠান', 'Institution')],
  },
  {
    id: 'quran',
    title: ['কুরআন অধ্যয়ন', 'Quran study'],
    fields: [
      n('q_surahs', 'মোট সূরা', 'Total surahs'),
      n('q_avg', 'প্রতিদিন গড়ে আয়াত', 'Average ayat per day'),
      s('q_tafsir', 'তাফসির গ্রন্থ', 'Tafsir book'),
      s('q_names', 'সূরার নাম', 'Surah names'),
      n('q_dars', 'দারস প্রস্তুত: সংখ্যা', 'Dars to prepare: count'),
      s('q_darsTopic', 'দারসের বিষয় ও আয়াতসমূহ', 'Dars topics and ayat'),
      n('q_mem', 'মুখস্থ: বিষয়ভিত্তিক আয়াত (সংখ্যা)', 'Memorise: topic-based ayat (count)'),
      s('q_memSurah', 'মুখস্থ: অর্থসহ সূরা', 'Memorise: surah with meaning'),
    ],
  },
  {
    id: 'hadith',
    title: ['হাদিস অধ্যয়ন', 'Hadith study'],
    fields: [
      n('h_total', 'মোট হাদিস', 'Total hadith'),
      n('h_avg', 'প্রতিদিন গড়ে', 'Average per day'),
      s('h_book', 'হাদিস গ্রন্থ ও বিষয়ের নাম', 'Hadith book and topics'),
      n('h_dars', 'দারস প্রস্তুত: সংখ্যা', 'Dars to prepare: count'),
      s('h_darsTopic', 'দারসের বিষয় ও হাদিসসমূহ', 'Dars topics and hadith'),
      n('h_mem', 'মুখস্থ: বিষয়ভিত্তিক হাদিস (সংখ্যা)', 'Memorise: topic-based hadith (count)'),
      s('h_memTopic', 'মুখস্থের বিষয়', 'Topics to memorise'),
    ],
  },
  {
    id: 'lit',
    title: ['সাহিত্য অধ্যয়ন', 'Literature study'],
    fields: [
      n('l_books', 'বই সংখ্যা', 'Number of books'),
      n('l_avg', 'প্রতিদিন গড়ে', 'Average per day', U.pg),
      s('l_names', 'বইয়ের নাম', 'Book names'),
      n('l_notes', 'বই নোট', 'Book notes', U.pcs),
      s('l_noteNames', 'নোটের বইয়ের নাম', 'Books to take notes on'),
      n('l_disc', 'আলোচনা নোট', 'Discussion notes', U.pcs),
    ],
  },
  {
    id: 'text',
    title: ['পাঠ্যপুস্তক, ক্লাস ও নামাজ', 'Textbooks, classes and prayer'],
    fields: [n('t_avg', 'পাঠ্যপুস্তক অধ্যয়ন: প্রতিদিন গড়ে', 'Textbook study: average per day', U.hr), n('c_avg', 'ক্লাসে উপস্থিতি: প্রতিদিন', 'Class attendance: per day', U.pcs), s('nz_note', 'নামাজ ও নফল ইবাদতের লক্ষ্য', 'Prayer and voluntary worship goal')],
  },
  {
    id: 'contact',
    title: ['যোগাযোগ', 'Contacts'],
    fields: [n('ct_total', 'মোট', 'Total', U.ppl), n('ct_avg', 'প্রতি মাসে গড়ে', 'Average per month', U.ppl), ...CONTACTS.map(([k, bn, en]) => n('ct_' + k, bn, en, U.ppl))],
  },
  {
    id: 'dist',
    title: ['বিতরণ', 'Distribution'],
    fields: [
      ...[['lit', 'ইসলামি সাহিত্য', 'Islamic literature'], ['kishor', 'কিশোর পত্রিকা', 'Kishor magazine'], ['yw', 'Y.W.', 'Y.W.'], ['chhatro', 'ছাত্রসংবাদ', 'Chhatra Sangbad'], ['eng', 'ইংরেজি পত্রিকা', 'English magazine'], ['intro', 'পরিচিতি', 'Introduction booklet'], ['routine', 'ক্লাস রুটিন', 'Class routine'], ['gift', 'উপহার', 'Gift'], ['sticker', 'স্টিকার/কার্ড', 'Sticker/Card'], ['audio', 'অডিও/সি.ডি.', 'Audio/CD'], ['newyear', 'নববর্ষ', 'New year items'], ['other', 'অন্যান্য', 'Other']].map(([k, bn, en]) => n('ds_' + k, bn, en, U.pcs)),
    ],
  },
  {
    id: 'subs',
    title: ['গ্রাহক বৃদ্ধি করা হবে', 'Subscribers to add'],
    fields: [n('sb_chhatro', 'ছাত্রসংবাদ', 'Chhatra Sangbad'), n('sb_kishor', 'কিশোর পত্রিকা', 'Kishor magazine'), n('sb_eng', 'ইংরেজি পত্রিকা', 'English magazine'), n('sb_yw', 'Y.W.', 'Y.W.'), s('sb_other', 'অন্যান্য', 'Other')],
  },
  {
    id: 'growth',
    title: ['বৃদ্ধি', 'Growth'],
    fields: GROWTH.flatMap(([k, bn, en]) => [n('gr_' + k, bn + ': সংখ্যা', en + ': count'), s('grn_' + k, bn + ': নাম', en + ': names')]),
  },
  {
    id: 'org',
    title: ['সাংগঠনিক দায়িত্ব পালন', 'Organisational duties'],
    fields: [n('o_otherDays', 'অন্যান্য সাংগঠনিক কাজ: প্রতি মাসে', 'Other work: per month', U.day), n('o_otherAvg', 'অন্যান্য সাংগঠনিক কাজ: গড় ঘণ্টা', 'Other work: avg hours', U.hr), n('o_dawahDays', 'দাওয়াতি কাজ: প্রতি মাসে', 'Dawah work: per month', U.day), n('o_dawahAvg', 'দাওয়াতি কাজ: গড় ঘণ্টা', 'Dawah work: avg hours', U.hr)],
  },
  {
    id: 'dawah',
    title: ['অন্যান্য দাওয়াতি কার্যক্রম', 'Other dawah activities'],
    fields: [
      n('d_group', 'গ্রুপ দাওয়াতি কাজে অংশগ্রহণ', 'Group dawah participation', U.times),
      n('d_muharrama', 'মুহাররমা যোগাযোগ', 'Muharrama contact', U.ppl),
      n('d_nonmuslim', 'অমুসলিম যোগাযোগ', 'Non-Muslim contact', U.ppl),
      n('d_readPpl', 'বই পড়ানো হবে (জনকে)', 'People to give books to read', U.ppl),
      n('d_readBooks', 'বই পড়ানো হবে (টি)', 'Books to be read', U.pcs),
      n('d_vip', 'ভিআইপি যোগাযোগ', 'VIP contact', U.ppl),
      n('d_friendorg', 'বন্ধু সংগঠনের সাথে যোগাযোগ', 'Contact with friendly organisations', U.ppl),
      n('d_mobile', 'মোবাইল/মেসেজ/ই-মেইলে দাওয়াতি কাজ', 'Dawah by phone/message/e-mail', U.times),
      n('d_support', 'বৃহত্তর সংগঠনের সমর্থক তৈরির চেষ্টা', 'Supporters for the wider organisation', U.ppl),
    ],
  },
  {
    id: 'bm',
    title: ['বায়তুলমাল বৃদ্ধি', 'Baitulmal increase'],
    fields: [s('bm_date', 'পরিশোধের তারিখ', 'Payment date'), n('bm_personal', 'ব্যক্তিগত বৃদ্ধি', 'Personal increase', U.tk), n('bm_total', 'মোট বৃদ্ধি', 'Total increase', U.tk), n('bm_welfare', 'ছাত্রকল্যাণ', 'Student welfare', U.tk), n('bm_table', 'টেবিল ব্যাংক', 'Table bank', U.tk), n('bm_kolsi', 'কলসি/হাঁড়ি', 'Kolsi/Hari', U.pcs)],
  },
  {
    id: 'skill',
    title: ['দক্ষতা উন্নয়ন কার্যক্রম', 'Skill development'],
    fields: [s('sk_computer', 'কম্পিউটার শিক্ষা', 'Computer learning'), s('sk_language', 'ভাষা শিক্ষা', 'Language learning'), s('sk_other', 'অন্যান্য', 'Other')],
  },
];

// ---- numbers ----
export const daysIn = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate(); // 28/29/30/31, leap years included
};
export const newMonthRep = () => ({ plan: {}, days: {}, extra: {} });
export const getMonthRep = (data, ym) => data.report.months[ym] || newMonthRep();
const v = (d, k) => Number(d[k]) || 0;

export function totals(days, count) {
  const T = { ayat: 0, hadith: 0, litI: 0, litO: 0, text: 0, cls: 0, att: 0, jam: 0, kaza: 0, dawah: 0, org: 0, qDays: 0, hDays: 0, tDays: 0, dawahDays: 0, otherDays: 0, paper: 0, exercise: 0, self: 0, filled: 0, ct: {}, ds: {}, ctTotal: 0, dsTotal: 0, surahs: [] };
  for (let i = 1; i <= count; i++) {
    const d = days[i];
    if (!d || !Object.keys(d).length) continue;
    T.filled++;
    for (const k of ['ayat', 'hadith', 'litI', 'litO', 'text', 'cls', 'att', 'jam', 'kaza', 'dawah', 'org']) T[k] += v(d, k);
    if (v(d, 'ayat') > 0) T.qDays++;
    if (v(d, 'hadith') > 0) T.hDays++;
    if (v(d, 'text') > 0) T.tDays++;
    if (v(d, 'dawah') > 0) T.dawahDays++;
    if (v(d, 'org') > 0) T.otherDays++;
    for (const [k] of DAY_CHECKS) if (d[k]) T[k]++;
    for (const [k] of CONTACTS) {
      T.ct[k] = (T.ct[k] || 0) + v(d, 'ct_' + k);
      T.ctTotal += v(d, 'ct_' + k);
    }
    for (const [k] of DIST) {
      T.ds[k] = (T.ds[k] || 0) + v(d, 'ds_' + k);
      T.dsTotal += v(d, 'ds_' + k);
    }
    const name = (d.surah || '').trim();
    if (name && !T.surahs.includes(name)) T.surahs.push(name);
  }
  for (const k of ['text', 'dawah', 'org']) T[k] = r1(T[k]);
  return T;
}

// Columns of the printed daily table (same grouping as the paper book)
export const TABLE_GROUPS = [
  [['কুরআন অধ্যয়ন', 'Quran'], [['সূরা', 'Surah'], ['আয়াত', 'Ayat']]],
  [['হাদিস অধ্যয়ন (সংখ্যা)', 'Hadith (count)'], [['সংখ্যা', 'Count']]],
  [['সাহিত্য অধ্যয়ন', 'Literature'], [['ইসলামী', 'Islamic'], ['অন্যান্য', 'Other']]],
  [['পাঠ্যপুস্তক (ঘণ্টা)', 'Textbook (hours)'], [['ঘণ্টা', 'Hours']]],
  [['ক্লাস', 'Class'], [['সংখ্যা', 'Held'], ['উপস্থিতি', 'Attended']]],
  [['নামাজ', 'Prayer'], [['জামায়াত', 'Jamaat'], ['কাজা', 'Kaza']]],
  [['যোগাযোগ', 'Contacts'], [['সদস্য', 'Member'], ['সাথী', 'Sathi'], ['কর্মী', 'Worker'], ['সমর্থক', 'Supporter']]],
  [['যোগাযোগ', 'Contacts'], [['বন্ধু', 'Friend'], ['মেধাবী ছাত্র', 'Bright student'], ['শুভাকাঙ্ক্ষী', 'Well-wisher'], ['মুহাররমা', 'Muharrama']]],
  [['বিতরণ', 'Distribution'], [['সাহিত্য', 'Literature'], ['ম্যাগাজিন', 'Magazine'], ['স্টিকার/কার্ড', 'Sticker/Card'], ['উপহার', 'Gift']]],
  [['সাংগঠনিক দায়িত্ব (ঘণ্টা)', 'Org. duties (hours)'], [['দাওয়াতি কাজ', 'Dawah work'], ['অন্যান্য কাজ', 'Other work']]],
  [['পত্রিকা পাঠ', 'Newspaper'], [['✓', '✓']]],
  [['শরীরচর্চা', 'Exercise'], [['✓', '✓']]],
  [['আত্মসমালোচনা', 'Self-criticism'], [['✓', '✓']]],
];
// 26 numbers for one day, in the same order as the table columns after "Surah"
export const rowNums = (d = {}) => [
  v(d, 'ayat'), v(d, 'hadith'), v(d, 'litI'), v(d, 'litO'), v(d, 'text'), v(d, 'cls'), v(d, 'att'), v(d, 'jam'), v(d, 'kaza'),
  v(d, 'ct_member'), v(d, 'ct_sathi'), v(d, 'ct_kormi'), v(d, 'ct_supporter'),
  v(d, 'ct_friend'), v(d, 'ct_bright'), v(d, 'ct_wellwisher'), v(d, 'ct_muharrama'),
  v(d, 'ds_lit') + v(d, 'ds_intro'),
  v(d, 'ds_kishor') + v(d, 'ds_yw') + v(d, 'ds_chhatro') + v(d, 'ds_eng'),
  v(d, 'ds_sticker') + v(d, 'ds_routine'),
  v(d, 'ds_gift'),
  v(d, 'dawah'), v(d, 'org'),
  d.paper ? 1 : 0, d.exercise ? 1 : 0, d.self ? 1 : 0,
];

// ---- plan vs actual ----
// elapsed = days of the month that are already over (for the current month: up to yesterday)
export function elapsedDays(ym, count, todayIso) {
  const cur = todayIso.slice(0, 7);
  if (ym < cur) return count;
  if (ym > cur) return 0;
  return Number(todayIso.slice(8)) - 1;
}

export function track(plan, T, count, elapsed) {
  const p = (k) => Number(plan[k]) || 0;
  const sum = (list, pre) => list.reduce((a, [k]) => a + p(pre + k), 0);
  const rows = [
    [['কুরআন: আয়াত', 'Quran: ayat'], p('q_days') * p('q_avg'), T.ayat],
    [['কুরআন: অধ্যয়নের দিন', 'Quran: study days'], p('q_days'), T.qDays],
    [['হাদিস', 'Hadith'], p('h_days') * p('h_avg'), T.hadith],
    [['ইসলামী সাহিত্য (পৃষ্ঠা)', 'Islamic literature (pages)'], p('l_islami'), T.litI],
    [['অন্যান্য সাহিত্য (পৃষ্ঠা)', 'Other literature (pages)'], p('l_other'), T.litO],
    [['পাঠ্যপুস্তক (ঘণ্টা)', 'Textbook study (hours)'], p('t_days') * p('t_avg'), T.text],
    [['ক্লাসে উপস্থিতি', 'Class attendance'], p('c_attend'), T.att],
    [['জামায়াতে নামাজ (ওয়াক্ত)', 'Prayers in congregation'], 5 * count, T.jam],
    [['যোগাযোগ (জন)', 'Contacts (people)'], sum(CONTACTS, 'ct_'), T.ctTotal],
    [['বিতরণ (টি)', 'Distribution (pcs)'], sum(DIST, 'ds_'), T.dsTotal],
    [['দাওয়াতি কাজ (ঘণ্টা)', 'Dawah work (hours)'], p('o_dawahDays') * p('o_dawahAvg'), T.dawah],
    [['অন্যান্য সাংগঠনিক কাজ (ঘণ্টা)', 'Other organisational work (hours)'], p('o_otherDays') * p('o_otherAvg'), T.org],
    [['আত্মসমালোচনা (দিন)', 'Self-criticism (days)'], p('m_self'), T.self],
    [['শরীরচর্চা (দিন)', 'Exercise (days)'], p('m_exercise'), T.exercise],
    [['পত্রিকা পাঠ (দিন)', 'Newspaper reading (days)'], p('m_paper'), T.paper],
  ];
  const left = Math.max(1, count - elapsed);
  return rows
    .filter(([, target]) => target > 0)
    .map(([label, target, actual]) => {
      const expected = (target * elapsed) / count;
      return {
        label,
        target: r1(target),
        actual: r1(actual),
        expected: r1(expected),
        behind: expected > 0 && actual < expected * 0.9,
        done: actual >= target,
        perDay: r1(Math.max(0, target - actual) / left),
      };
    });
}

// One call for the Home page
export function reportStatus(data, todayIso) {
  const ym = todayIso.slice(0, 7);
  const count = daysIn(ym);
  const m = getMonthRep(data, ym);
  const T = totals(m.days, count);
  const rows = track(m.plan, T, count, elapsedDays(ym, count, todayIso));
  const d = m.days[Number(todayIso.slice(8))];
  return { behind: rows.filter((r) => r.behind).length, todayDone: !!d && Object.keys(d).length > 0, hasPlan: Object.keys(m.plan).length > 0 };
}
