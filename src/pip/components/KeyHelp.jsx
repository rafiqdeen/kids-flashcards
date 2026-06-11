// Keyboard map modal — for parents and older kids on laptops.
const ROWS = [
  { keys: ['←', '→'], label: 'Previous / next card' },
  { keys: ['Space'], label: 'Flip the card' },
  { keys: ['Enter'], label: 'Flip the card' },
  { keys: ['Esc'], label: 'Back to home' },
  { keys: ['Tab'], label: 'Move between buttons' },
];

export function KeyHelp({ onClose }) {
  return (
    <div className="modal-scrim" data-testid="key-help" onClick={onClose}>
      <div className="trophy-modal key-help-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard keys</h2>
        <div className="key-rows">
          {ROWS.map((row, i) => (
            <div key={i} className="key-row">
              <span className="key-caps">{row.keys.map((k) => <kbd key={k}>{k}</kbd>)}</span>
              <span className="key-label">{row.label}</span>
            </div>
          ))}
        </div>
        <button className="pip-cta ghost" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}
