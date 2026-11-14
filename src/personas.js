import { uid, today } from './utils.js';
import { ensureDay, ensureMonth } from './store.jsx';

// Who uses the app. Each persona points to a sample "group".
export const PERSONAS = [
  { id: 'primary', icon: '🎒', name: ['প্রাথমিক (১ম–৫ম শ্রেণি)', 'Primary (Class 1–5)'], group: 'kid' },
  { id: 'secondary', icon: '📘', name: ['মাধ্যমিক (৬ষ্ঠ–১০ম শ্রেণি)', 'Secondary (Class 6–10)'], group: 'student' },
  { id: 'college', icon: '📗', name: ['উচ্চমাধ্যমিক (একাদশ–দ্বাদশ)', 'Higher Secondary (Class 11–12)'], group: 'student' },
  { id: 'university', icon: '🎓', name: ['বিশ্ববিদ্যালয় (অনার্স/মাস্টার্স/পিএইচডি)', 'University (BSc / MSc / PhD)'], group: 'student' },
  { id: 'job', icon: '💼', name: ['চাকরিজীবী (সরকারি/বেসরকারি)', 'Job holder (Govt / Private)'], group: 'worker' },
  { id: 'business', icon: '🏪', name: ['ব্যবসায়ী / ফ্রিল্যান্সার', 'Business / Freelancer'], group: 'general' },
  { id: 'farmer', icon: '🌾', name: ['কৃষক', 'Farmer'], group: 'farmer' },
  { id: 'home', icon: '🏠', name: ['গৃহিণী / গৃহকর্মী', 'Homemaker'], group: 'general' },
  { id: 'other', icon: '🙂', name: ['অন্যান্য', 'Other'], group: 'general' },
];

// routine rows: [start, end, [bn, en], category]
const SAMPLES = {
  kid: {
    routine: [
      ['06:30', '07:00', ['ঘুম থেকে ওঠা ও দাঁত মাজা', 'Wake up and brush teeth'], 'other'],
      ['07:00', '07:30', ['সকালের নাস্তা', 'Breakfast'], 'meal'],
      ['07:30', '12:00', ['স্কুল', 'School'], 'work'],
      ['12:00', '13:30', ['দুপুরের খাবার ও বিশ্রাম', 'Lunch and rest'], 'meal'],
      ['13:30', '15:00', ['বাড়ির কাজ', 'Homework'], 'study'],
      ['15:00', '17:00', ['খেলাধুলা', 'Play'], 'exercise'],
      ['17:00', '19:00', ['পড়া', 'Reading'], 'study'],
      ['19:00', '20:00', ['পরিবারের সাথে সময়', 'Family time'], 'family'],
      ['20:00', '21:00', ['রাতের খাবার', 'Dinner'], 'meal'],
      ['21:00', '06:30', ['ঘুম', 'Sleep'], 'sleep'],
    ],
    habits: [
      ['সকালে ও রাতে দাঁত মাজা', 'Brush teeth morning and night'],
      ['বাড়ির কাজ শেষ করা', 'Finish homework'],
      ['১০ মিনিট গল্পের বই পড়া', 'Read a story book for 10 minutes'],
      ['বাইরে খেলা', 'Play outside'],
      ['রাত ৯টায় ঘুম', 'Sleep by 9 PM'],
    ],
    income: [[['টিফিনের টাকা', 'Tiffin money'], 600]],
    expense: [
      [['টিফিন', 'Tiffin'], 'food', 300],
      [['খাতা-পেনসিল', 'Notebook and pencils'], 'education', 100],
    ],
    budget: 500,
    top: [
      ['বাড়ির কাজ শেষ করা', 'Finish homework'],
      ['একটা গল্প পড়া', 'Read one story'],
      ['ব্যাগ গুছিয়ে রাখা', 'Pack the school bag'],
    ],
  },
  student: {
    routine: [
      ['05:30', '06:00', ['ঘুম থেকে ওঠা ও প্রার্থনা', 'Wake up and prayer'], 'prayer'],
      ['06:00', '07:30', ['সবচেয়ে কঠিন বিষয় পড়া', 'Study the hardest subject'], 'study'],
      ['07:30', '08:00', ['নাস্তা', 'Breakfast'], 'meal'],
      ['08:00', '14:00', ['ক্লাস', 'Classes'], 'work'],
      ['14:00', '15:00', ['দুপুরের খাবার ও বিশ্রাম', 'Lunch and rest'], 'meal'],
      ['15:00', '17:00', ['কোচিং / প্রাইভেট / ল্যাব', 'Coaching / tuition / lab'], 'work'],
      ['17:00', '18:00', ['খেলাধুলা বা হাঁটা', 'Sports or a walk'], 'exercise'],
      ['18:00', '21:00', ['পড়া ও অনুশীলন', 'Study and practice'], 'study'],
      ['21:00', '22:00', ['রাতের খাবার ও পরিবার', 'Dinner and family'], 'family'],
      ['22:00', '05:30', ['ঘুম', 'Sleep'], 'sleep'],
    ],
    habits: [
      ['ভোরে ঘুম থেকে ওঠা', 'Wake up early'],
      ['৩ ঘণ্টা মন দিয়ে পড়া', '3 hours of focused study'],
      ['আজকের কাজ আজই শেষ', "Finish today's work today"],
      ['৩০ মিনিট ব্যায়াম/হাঁটা', '30 minutes of exercise or walking'],
      ['২০ মিনিট বই পড়া', 'Read a book for 20 minutes'],
      ['১০টা নতুন ইংরেজি শব্দ', '10 new English words'],
      ['রাত ১১টার আগে ঘুম', 'Sleep before 11 PM'],
    ],
    income: [
      [['পরিবার থেকে হাতখরচ', 'Allowance from family'], 5000],
      [['টিউশনি', 'Tuition'], 3000],
    ],
    expense: [
      [['ক্যান্টিন ও নাস্তা', 'Canteen and snacks'], 'food', 1800],
      [['রিকশা/বাস ভাড়া', 'Rickshaw/bus fare'], 'transport', 1200],
      [['বই ও খাতা', 'Books and notebooks'], 'education', 900],
      [['মোবাইল ডেটা', 'Mobile data'], 'mobile', 400],
    ],
    budget: 6000,
    top: [
      ['সবচেয়ে কঠিন পড়াটা সকালেই শেষ', 'Finish the hardest study in the morning'],
      ['৩০ মিনিট ব্যায়াম', '30 minutes of exercise'],
      ['কালকের ক্লাসের প্রস্তুতি', "Prepare for tomorrow's class"],
    ],
  },
  worker: {
    routine: [
      ['06:00', '06:30', ['ঘুম থেকে ওঠা ও প্রার্থনা', 'Wake up and prayer'], 'prayer'],
      ['06:30', '07:00', ['হাঁটা', 'Walk'], 'exercise'],
      ['07:00', '08:00', ['নাস্তা ও প্রস্তুতি', 'Breakfast and getting ready'], 'meal'],
      ['08:00', '09:00', ['অফিসে যাওয়া', 'Commute to office'], 'other'],
      ['09:00', '17:00', ['অফিস', 'Office'], 'work'],
      ['17:00', '18:00', ['বাসায় ফেরা', 'Commute home'], 'other'],
      ['18:00', '20:00', ['পরিবারের সাথে সময়', 'Family time'], 'family'],
      ['20:00', '21:00', ['নতুন কিছু শেখা', 'Learn something new'], 'study'],
      ['21:00', '22:00', ['রাতের খাবার', 'Dinner'], 'meal'],
      ['22:00', '06:00', ['ঘুম', 'Sleep'], 'sleep'],
    ],
    habits: [
      ['৩০ মিনিট হাঁটা', 'Walk for 30 minutes'],
      ['দিনের সেরা ৩ কাজ শেষ', "Finish the day's top 3 tasks"],
      ['৮ গ্লাস পানি', '8 glasses of water'],
      ['খরচ লিখে রাখা', 'Write down spending'],
      ['পরিবারের সাথে সময়', 'Time with family'],
      ['২০ মিনিট শেখা', '20 minutes of learning'],
    ],
    income: [[['বেতন', 'Salary'], 35000]],
    expense: [
      [['বাসা ভাড়া', 'House rent'], 'bills', 12000],
      [['বাজার', 'Groceries'], 'food', 9000],
      [['যাতায়াত', 'Commute'], 'transport', 2500],
      [['বিদ্যুৎ ও গ্যাস বিল', 'Electricity and gas bills'], 'bills', 1800],
    ],
    budget: 28000,
    top: [
      ['সবচেয়ে গুরুত্বপূর্ণ কাজটা সকালেই শেষ', 'Finish the most important task in the morning'],
      ['৩০ মিনিট হাঁটা', 'Walk for 30 minutes'],
      ['পরিবারকে সময় দেওয়া', 'Spend time with family'],
    ],
  },
  farmer: {
    routine: [
      ['05:00', '05:30', ['ঘুম থেকে ওঠা ও প্রার্থনা', 'Wake up and prayer'], 'prayer'],
      ['05:30', '06:30', ['গরু-ছাগলের যত্ন', 'Care for cattle'], 'work'],
      ['06:30', '07:00', ['নাস্তা', 'Breakfast'], 'meal'],
      ['07:00', '12:00', ['মাঠের কাজ', 'Field work'], 'work'],
      ['12:00', '14:00', ['দুপুরের খাবার ও বিশ্রাম', 'Lunch and rest'], 'meal'],
      ['14:00', '17:00', ['মাঠ / হাট-বাজার', 'Field / market'], 'work'],
      ['17:00', '19:00', ['পরিবারের সাথে সময়', 'Family time'], 'family'],
      ['19:00', '20:00', ['হিসাব লেখা ও কালকের পরিকল্পনা', "Write accounts and plan tomorrow"], 'study'],
      ['20:00', '21:00', ['রাতের খাবার', 'Dinner'], 'meal'],
      ['21:00', '05:00', ['ঘুম', 'Sleep'], 'sleep'],
    ],
    habits: [
      ['ভোরে মাঠ ঘুরে দেখা', 'Check the field early'],
      ['গবাদি পশুর যত্ন', 'Care for livestock'],
      ['খরচ ও বিক্রি লিখে রাখা', 'Write down costs and sales'],
      ['আবহাওয়ার খবর দেখা', 'Check the weather'],
      ['পরিবারের সাথে সময়', 'Time with family'],
    ],
    income: [
      [['ধান বিক্রি', 'Rice sales'], 18000],
      [['দুধ বিক্রি', 'Milk sales'], 6000],
    ],
    expense: [
      [['সার ও বীজ', 'Fertilizer and seed'], 'farm', 5000],
      [['শ্রমিকের মজুরি', 'Labour wages'], 'farm', 4000],
      [['সেচ', 'Irrigation'], 'farm', 1500],
      [['বাজার', 'Groceries'], 'food', 6000],
    ],
    budget: 18000,
    top: [
      ['জমিতে সেচ দেওয়া', 'Irrigate the field'],
      ['আজকের খরচ লিখে রাখা', "Write down today's costs"],
      ['বাজারদর জেনে নেওয়া', 'Check market prices'],
    ],
  },
  general: {
    routine: [
      ['06:00', '06:30', ['ঘুম থেকে ওঠা ও প্রার্থনা', 'Wake up and prayer'], 'prayer'],
      ['06:30', '07:00', ['হাঁটা', 'Walk'], 'exercise'],
      ['07:00', '08:00', ['নাস্তা', 'Breakfast'], 'meal'],
      ['08:00', '13:00', ['মূল কাজ', 'Main work'], 'work'],
      ['13:00', '14:30', ['দুপুরের খাবার ও বিশ্রাম', 'Lunch and rest'], 'meal'],
      ['14:30', '17:30', ['বাকি কাজ', 'Remaining work'], 'work'],
      ['17:30', '20:00', ['পরিবারের সাথে সময়', 'Family time'], 'family'],
      ['20:00', '21:00', ['নতুন কিছু শেখা', 'Learn something new'], 'study'],
      ['21:00', '22:00', ['রাতের খাবার', 'Dinner'], 'meal'],
      ['22:00', '06:00', ['ঘুম', 'Sleep'], 'sleep'],
    ],
    habits: [
      ['৩০ মিনিট হাঁটা', 'Walk for 30 minutes'],
      ['দিনের সেরা ৩ কাজ শেষ', "Finish the day's top 3 tasks"],
      ['৮ গ্লাস পানি', '8 glasses of water'],
      ['খরচ লিখে রাখা', 'Write down spending'],
      ['২০ মিনিট বই পড়া', 'Read a book for 20 minutes'],
    ],
    income: [[['মাসের আয়', 'Monthly income'], 20000]],
    expense: [
      [['বাজার', 'Groceries'], 'food', 8000],
      [['বিদ্যুৎ ও গ্যাস বিল', 'Electricity and gas bills'], 'bills', 1800],
      [['মোবাইল/ইন্টারনেট', 'Mobile/Internet'], 'mobile', 600],
    ],
    budget: 15000,
    top: [
      ['সবচেয়ে গুরুত্বপূর্ণ কাজটা সকালেই শেষ', 'Finish the most important task in the morning'],
      ['৩০ মিনিট হাঁটা', 'Walk for 30 minutes'],
      ['আজকের খরচ লিখে রাখা', "Write down today's spending"],
    ],
  },
};

const groupOf = (persona) => (PERSONAS.find((p) => p.id === persona) || PERSONAS.at(-1)).group;

export const habitIdeas = (persona, lang) => SAMPLES[groupOf(persona)].habits.map((h) => h[lang === 'bn' ? 0 : 1]);

// Fills ONLY the empty parts of the data, so nothing the user typed is lost.
export function applySample(d) {
  const i = d.profile.lang === 'bn' ? 0 : 1;
  const s = SAMPLES[groupOf(d.profile.persona)];

  if (!d.routine.length)
    d.routine = s.routine.map(([start, end, title, cat]) => ({ id: uid(), start, end, title: title[i], cat }));

  if (!d.habits.list.length) d.habits.list = s.habits.map((h) => ({ id: uid(), name: h[i] }));

  const m = ensureMonth(d, today().slice(0, 7));
  if (!m.income.length && !m.expense.length) {
    m.income = s.income.map(([title, amount]) => ({ id: uid(), title: title[i], amount }));
    m.expense = s.expense.map(([title, cat, amount]) => ({ id: uid(), title: title[i], cat, amount }));
    if (!m.budget) m.budget = s.budget;
  }

  const day = ensureDay(d, today());
  if (day.top.every((x) => !x.text)) day.top = s.top.map((x) => ({ text: x[i], done: false }));
}
