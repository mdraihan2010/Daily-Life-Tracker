import { useApp } from '../store.jsx';
import { GROUPS, Icon } from '../App.jsx';
import { PageHead } from '../components/ui.jsx';

const SUB = {
  daily: 'd_sub',
  routine: 'r_sub',
  habits: 'h_sub',
  money: 'm_sub',
  goals: 'g_sub',
  weekly: 'w_sub',
  calendar: 'c_sub',
  project: 'p_sub',
};
const TITLE = { daily: 'd_title', routine: 'r_title', habits: 'h_title', money: 'm_title', goals: 'g_title', weekly: 'w_title', calendar: 'c_title', project: 'p_title', settings: 's_title' };

export default function More() {
  const { t } = useApp();
  return (
    <>
      <PageHead title={t('nav_more')} sub={t('more_sub')} />
      {GROUPS.filter(([label]) => label).map(([label, keys]) => (
        <section key={label}>
          <h3 className="group-title">{t(label)}</h3>
          <div className="tools">
            {keys.map((k) => (
              <a className="tool" href={'#' + k} key={k}>
                <Icon name={k} />
                <div>
                  <strong>{t(TITLE[k])}</strong>
                  <span>{t(SUB[k])}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
      <div className="tools">
        <a className="tool" href="#settings">
          <Icon name="settings" />
          <div>
            <strong>{t('s_title')}</strong>
            <span>{t('s_backup')}</span>
          </div>
        </a>
      </div>
    </>
  );
}
