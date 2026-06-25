// Complete.jsx — shared end-of-level modal (stars 0-3, title, subtitle,
// Next/Retry). Ported from adventure-app.jsx.
import { useRef } from 'react';
import { Star } from '../art/icons.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

export function Complete({ stars, title, sub, onNext, onRetry, nextLabel, retryLabel }) {
  const cardRef = useRef(null);
  // BACK is intentionally swallowed (no onClose): the child must choose Next or Retry.
  useFocusTrap(cardRef, {});
  return (
    <div className="complete-scrim" data-testid="level-complete">
      <div className="complete-card" ref={cardRef} role="dialog" aria-modal="true" aria-label={title}>
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
          {onRetry && <button className="gbtn blue" data-nav data-testid="complete-retry" onClick={onRetry}>{retryLabel || 'Try again'}</button>}
          <button className="gbtn gold" data-nav data-nav-default="" data-testid="complete-next" onClick={onNext}>{nextLabel || 'Continue'}</button>
        </div>
      </div>
    </div>
  );
}
