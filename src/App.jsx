import { useEffect, useState } from 'react';
import { useApp } from './store.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Daily from './pages/Daily.jsx';
import Routine from './pages/Routine.jsx';
import Habits from './pages/Habits.jsx';
import Money from './pages/Money.jsx';
import Settings from './pages/Settings.jsx';

const PAGES = { home: Home, daily: Daily, routine: Routine, habits: Habits, money: Money, settings: Settings };

const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  daily: 'M4 4h16v16H4zM8 12l3 3 5-6',
  routine: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  habits: 'M4 6h3v3H4zM10.5 6h3v3h-3zM17 6h3v3h-3zM4 12.5h3v3H4zM10.5 12.5h3v3h-3zM17 12.5h3v3h-3z',
  money: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
};

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

  return (
    <div className="shell">
      <nav className="nav" aria-label="Main">
        <a className="brand" href="#home">
          <img src="./icon.svg" alt="" width="34" height="34" />
          <span>{t('app')}</span>
        </a>
        {Object.keys(PAGES).map((k) => (
          <a key={k} href={'#' + k} className={'nav-item' + (k === page ? ' on' : '')} aria-current={k === page ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[k]} />
            </svg>
            <span>{t('nav_' + k)}</span>
          </a>
        ))}
      </nav>
      <main className="main">
        <Page />
      </main>
    </div>
  );
}
