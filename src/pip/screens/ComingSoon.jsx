// Transitional placeholder for routes built in later phases (quiz P4,
// rewards/paint P5, buddies/parent P6). Kid-safe: mascot + voice + back.
import { Icon } from '../components/Icon.jsx';
import { Mascot } from '../components/Mascot.jsx';

export function ComingSoon({ title, mascot, onBack }) {
  return (
    <div className="screen" data-screen-label={title} style={{ alignItems: 'center', justifyContent: 'center', gap: 'var(--s-4)' }}>
      <Mascot concept={mascot} state="sleep" size={140} />
      <h1>{title} is napping</h1>
      <p>It will wake up very soon!</p>
      <button className="pip-cta" onClick={onBack}><Icon name="back" size={20} /> Back home</button>
    </div>
  );
}
