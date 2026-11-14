import { useEffect, useState } from 'react';
import { useApp } from './store.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Daily from './pages/Daily.jsx';
import Weekly from './pages/Weekly.jsx';
import Calendar from './pages/Calendar.jsx';
import Project from './pages/Project.jsx';
import Goals from './pages/Goals.jsx';
import Routine from './pages/Routine.jsx';
import Habits from './pages/Habits.jsx';
import Money from './pages/Money.jsx';
import Savings from './pages/Savings.jsx';
import Mood from './pages/Mood.jsx';
import Journal from './pages/Journal.jsx';
import Books from './pages/Books.jsx';
import Guide from './pages/Guide.jsx';
import Report from './pages/Report.jsx';
import More from './pages/More.jsx';
import Settings from './pages/Settings.jsx';

const PAGES = {
  home: Home,
  daily: Daily,
  routine: Routine,
  habits: Habits,
  money: Money,
  goals: Goals,
  weekly: Weekly,
  calendar: Calendar,
  project: Project,
  savings: Savings,
  mood: Mood,
  journal: Journal,
  books: Books,
  guide: Guide,
  report: Report,
  more: More,
  settings: Settings,
};

// Sidebar (desktop) shows every group. Bottom bar (mobile) shows only MOBILE.
export const GROUPS = [
  [null, ['home', 'guide']],
  ['grp_daily', ['daily', 'routine', 'habits']],
  ['grp_plan', ['goals', 'weekly', 'calendar', 'project']],
  ['grp_money', ['money', 'savings']],
  ['grp_life', ['mood', 'journal', 'books', 'report']],
  [null, ['more', 'settings']],
];
const MOBILE = ['home', 'daily', 'habits', 'money', 'more'];

export const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  daily: 'M4 4h16v16H4zM8 12l3 3 5-6',
  routine: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  habits: 'M4 6h3v3H4zM10.5 6h3v3h-3zM17 6h3v3h-3zM4 12.5h3v3H4zM10.5 12.5h3v3h-3zM17 12.5h3v3h-3z',
  money: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  goals: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  weekly: 'M4 5h16v14H4zM9.3 5v14M14.6 5v14',
  calendar: 'M4 6h16v14H4zM4 10.5h16M8 3v5M16 3v5',
  project: 'M6 21V4h12l-2.5 4 2.5 4H6',
  savings: 'M12 4a8 3 0 1 0 0 6 8 3 0 0 0 0-6zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  mood: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4 4 0 0 0 7 0M9 9.5v.5M15 9.5v.5',
  journal: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h3',
  books: 'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',
  report: 'M5 3h11l3 3v15H5zM8 9h8M8 13h8M8 17h5',
  guide: 'M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3zM9.5 19h5M10.5 21.5h3',
  more: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
};

export const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

function SavedToast() {
  const { savedAt, t } = useApp();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(id);
  }, [savedAt]);
  return (
    <div className={'toast' + (show ? ' show' : '')} role="status" aria-live="polite">
      ✓ {t('saved')}
    </div>
  );
}

function useHash() {
  const read = () => location.hash.replace('#', '') || 'home';
  const [h, setH] = useState(read);
  useEffect(() => {
    const f = () => {
      setH(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return h;
}

export default function App() {
  const { data, t, lang } = useApp();
  const hash = useHash();
  const page = PAGES[hash] ? hash : 'home';
  const Page = PAGES[page];

  useEffect(() => {
    document.documentElement.dataset.theme = data.profile.theme;
    document.documentElement.lang = lang;
  }, [data.profile.theme, lang]);

  if (!data.profile.onboarded) return <Onboarding />;

  // on mobile, "All tools" stays highlighted while a tool that is not in the bottom bar is open
  const mobileOn = MOBILE.includes(page) ? page : 'more';

  return (
    <div className="shell">
      <nav className="nav" aria-label="Main">
        <a className="brand" href="#home">
          <img src="./icon.svg" alt="" width="34" height="34" />
          <span>{t('app')}</span>
        </a>
        {GROUPS.map(([label, keys], gi) => (
          <div className="nav-group" key={gi}>
            {label && <p className="nav-label">{t(label)}</p>}
            {keys.filter((k) => k !== 'report' || data.profile.reportBook).map((k) => (
              <a
                key={k}
                href={'#' + k}
                className={'nav-item' + (k === page ? ' on' : '') + (k === mobileOn ? ' m-on' : '') + (MOBILE.includes(k) ? '' : ' desk-only') + (k === 'more' ? ' mob-only' : '')}
                aria-current={k === page ? 'page' : undefined}
              >
                <Icon name={k} />
                <span>{t('nav_' + k)}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
      <main className="main">
        <div className="page-in" key={page}>
          <Page />
        </div>
      </main>
      <SavedToast />
    </div>
  );
}
