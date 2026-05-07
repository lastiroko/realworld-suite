import type { ViewKey } from '../../App';

interface NavItem {
  key: ViewKey;
  label: string;
  hint: string;
  icon: string;
  disabled?: boolean;
}

const NAV_PRIMARY: NavItem[] = [
  { key: 'dsar', label: 'Requests', hint: 'DSAR queue', icon: '📨' },
  { key: 'incidents', label: 'Incidents', hint: 'Coming soon', icon: '⚠️', disabled: true },
  { key: 'audit', label: 'Audit', hint: 'Recent activity', icon: '🛡️' },
];

interface Props {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
}

export function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar__brand">
        <span className="sidebar__glyph" aria-hidden="true">AQ</span>
        <div className="sidebar__brandText">
          <strong>Acureq</strong>
          <span>Privacy Ops</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Sections">
        <p className="sidebar__group">Workspace</p>
        <ul>
          {NAV_PRIMARY.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`sidebar__link${active === item.key ? ' is-active' : ''}`}
                onClick={() => !item.disabled && onSelect(item.key)}
                disabled={item.disabled}
                aria-current={active === item.key ? 'page' : undefined}
              >
                <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar__linkText">
                  <span>{item.label}</span>
                  <small>{item.hint}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__avatar" aria-hidden="true">PO</div>
        <div className="sidebar__user">
          <strong>Privacy Desk</strong>
          <span>Operator</span>
        </div>
      </div>
    </aside>
  );
}
