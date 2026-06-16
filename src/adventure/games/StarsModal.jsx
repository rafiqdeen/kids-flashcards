// StarsModal.jsx — shared end-of-game stars modal (was window.AdvStarsModal).
// Play again / All activities. Ported from adventure-activities.jsx.
export function StarsModal({ stars, title, sub, onAgain, onBack, I, Star }) {
  return (
    <div className="complete-scrim" data-testid="activity-complete">
      <div className="complete-card">
        <div className="bigstars">
          {[1, 2, 3].map((k) => <span key={k} className={`bstar ${k <= stars ? '' : 'empty'}`} style={{ '--i': k - 1 }}><Star s={k === 2 ? 68 : 52} on={k <= stars} /></span>)}
        </div>
        <h2>{title}</h2><p>{sub}</p>
        <div className="complete-actions">
          <button className="gbtn blue" onClick={onAgain}>Play again</button>
          <button className="gbtn gold" data-testid="activity-back" onClick={onBack}>All activities</button>
        </div>
      </div>
    </div>
  );
}
