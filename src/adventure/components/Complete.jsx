// Complete.jsx — shared end-of-level modal (stars 0-3, title, subtitle,
// Next/Retry). Ported from adventure-app.jsx.
import { Star } from '../art/icons.jsx';

export function Complete({ stars, title, sub, onNext, onRetry, nextLabel, retryLabel }) {
  return (
    <div className="complete-scrim" data-testid="level-complete">
      <div className="complete-card">
        <div className="bigstars">
          {[1, 2, 3].map((k) => (
            <span key={k} className={`bstar ${k <= stars ? '' : 'empty'}`} style={{ '--i': k - 1 }}>
              <Star s={k === 2 ? 72 : 56} on={k <= stars} />
            </span>
          ))}
        </div>
        <h2>{title}</h2>
        <p>{sub}</p>
        <div className="complete-actions">
          {onRetry && <button className="gbtn blue" data-testid="complete-retry" onClick={onRetry}>{retryLabel || 'Try again'}</button>}
          <button className="gbtn gold" data-testid="complete-next" onClick={onNext}>{nextLabel || 'Continue'}</button>
        </div>
      </div>
    </div>
  );
}
