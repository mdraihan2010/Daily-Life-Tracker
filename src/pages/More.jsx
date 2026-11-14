import { useApp } from '../store.jsx';
import { GROUPS, Icon } from '../App.jsx';
import { PageHead } from '../components/ui.jsx';

// page key -> i18n key of its title / one-line description
export const TITLE = {
  guide: 'gd_title',
  daily: 'd_title',
  routine: 'r_title',
  habits: 'h_title',
  goals: 'g_title',
  weekly: 'w_title',
  calendar: 'c_title',
  project: 'p_title',
  money: 'm_title',
  savings: 'sv_title',
  mood: 'md_title',
  journal: 'j_title',
  books: 'b_title',
  settings: 's_title',
};
const SUB = {
  guide: 'gd_sub',
  daily: 'd_sub',
  routine: 'r_sub',
  habits: 'h_sub',
  goals: 'g_sub',
  weekly: 'w_sub',
  calendar: 'c_sub',
  project: 'p_sub',
  money: 'm_sub',
  savings: 'sv_sub',
  mood: 'md_sub',
  journal: 'j_sub',
  books: 'b_sub',
  settings: 's_backup',
};

const Tool = ({ k, t }) => (
  <a className="tool" href={'#' + k}>
    <Icon name={k} />
    <div>
      <strong>{t(TITLE[k])}</strong>
      <span>{t(SUB[k])}</span>
    </div>
  </a>
);

export default function More() {
  const { t } = useApp();
  return (
    <>
      <PageHead title={t('nav_more')} sub={t('more_sub')} />
      <div className="tools">
        <Tool k="guide" t={t} />
        <Tool k="settings" t={t} />
      </div>
      {GROUPS.filter(([label]) => label).map(([label, keys]) => (
        <section key={label}>
          <h3 className="group-title">{t(label)}</h3>
          <div className="tools">
            {keys.map((k) => (
              <Tool key={k} k={k} t={t} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
