import { Icon } from './Icon.jsx';

// Forgiving daily ring — fills toward the goal, shows a check when met,
// never shames.
export function DailyGoalRing({ count, goal = 5, size = 52 }) {
  const pct = Math.min(1, count / goal);
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div className="goal-ring" data-testid="daily-goal" role="img"
      aria-label={`Today: ${count} of ${goal} cards learned`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pop-grass)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 400ms var(--ease-spring)' }} />
      </svg>
      <span className="goal-ring-label">{pct >= 1 ? <Icon name="check" size={20} color="var(--pop-grass)" /> : count}</span>
    </div>
  );
}
