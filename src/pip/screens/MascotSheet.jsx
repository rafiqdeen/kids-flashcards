import { Icon } from '../components/Icon.jsx';
import { Mascot } from '../components/Mascot.jsx';
import { MASCOT_CONCEPTS, MASCOT_STATES } from '../data/mascots.js';

const BUDDY_LABELS = { pip: 'Pip (bird)', fox: 'Fox', owl: 'Owl', bear: 'Bear', bunny: 'Bunny', monster: 'Monster' };

export function MascotSheet({ concept, onPick, onBack }) {
  return (
    <div className="screen mascot-sheet" data-screen-label="Mascot sheet">
      <header className="deck-bar">
        <button className="round-btn" aria-label="Back home" data-testid="mascot-back" onClick={onBack}><Icon name="back" size={26} /></button>
        <div className="deck-title"><b>Buddies</b></div>
        <span style={{ width: 48 }} />
      </header>
      <h1 className="onboard-h">Meet the buddies</h1>
      <div className="concept-row">
        {MASCOT_CONCEPTS.map((c) => (
          <button key={c} className={`concept-pick ${concept === c ? 'sel' : ''}`} onClick={() => onPick(c)}>
            <Mascot concept={c} state="cheer" size={76} />
            <span>{BUDDY_LABELS[c]}</span>
          </button>
        ))}
      </div>
      <h2 className="shelf-title">{concept} — all moods</h2>
      <div className="state-row">
        {MASCOT_STATES.map((s) => (
          <div key={s} className="state-cell"><Mascot concept={concept} state={s} size={92} /><small>{s}</small></div>
        ))}
      </div>
    </div>
  );
}
