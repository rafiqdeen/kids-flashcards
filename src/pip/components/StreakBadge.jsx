import { Icon } from './Icon.jsx';

export function StreakBadge({ n }) {
  return (
    <div className={`streak-badge ${n > 0 ? 'lit' : ''}`} aria-label={`${n} in a row`}>
      <Icon name="flame" size={22} /><b>{n}</b>
    </div>
  );
}
