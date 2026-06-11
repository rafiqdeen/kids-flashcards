import { useState, useEffect } from 'react';
import { Mascot } from '../components/Mascot.jsx';
import { Illu } from '../art/Illu.jsx';
import { announce } from '../speech.js';
import { AVATARS } from '../data/categories.js';

const LINES = [
  "Hi! I'm Pip. Tap a friend to be your buddy!",
  'How big are you?',
  'Watch! Tap the card to flip it.',
];

export function Onboarding({ onDone, mascot, speak }) {
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [demoFlipped, setDemoFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { speak(LINES[step]); announce(LINES[step]); }, 350);
    return () => clearTimeout(t);
  }, [step, speak]);

  return (
    <div className="screen onboard" data-screen-label="Onboarding">
      <div className="onboard-mascot"><Mascot concept={mascot} state={step === 2 ? 'point' : 'cheer'} size={150} /></div>

      {step === 0 && (<>
        <h1 className="onboard-h">Pick a buddy!</h1>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button key={a.id} className={`avatar-card ${avatar === a.id ? 'sel' : ''}`}
              onClick={() => { setAvatar(a.id); speak(a.name); announce(a.name); }}
              aria-label={a.name} aria-pressed={avatar === a.id}>
              <Illu name={a.illu} size={84} />
              <span>{a.name}</span>
            </button>
          ))}
        </div>
        <button className="pip-cta" disabled={!avatar} onClick={() => setStep(1)}>Next</button>
      </>)}

      {step === 1 && (<>
        <h1 className="onboard-h">How big are you?</h1>
        <div className="age-grid">
          {[{ k: 'little', l: 'Little', s: 56 }, { k: 'middle', l: 'Bigger', s: 78 }, { k: 'big', l: 'Big kid', s: 100 }].map((t) => (
            <button key={t.k} className="age-card" onClick={() => setStep(2)} aria-label={t.l}>
              <Mascot concept={mascot} state="idle" size={t.s} />
              <span>{t.l}</span>
            </button>
          ))}
        </div>
      </>)}

      {step === 2 && (<>
        <h1 className="onboard-h">Tap the card!</h1>
        <button className={`demo-card ${demoFlipped ? 'flipped' : ''}`}
          onClick={() => { setDemoFlipped(true); speak('A is for Apple.'); announce('A is for Apple.'); }}
          aria-label="Demo card, tap to flip">
          <span className="demo-3d">
            <span className="demo-face f"><span className="card-mega" style={{ color: 'var(--cat-alphabet-1)' }}>A</span></span>
            <span className="demo-face b"><Illu name="apple" size={96} /><b>Apple</b></span>
          </span>
          {!demoFlipped && <span className="tap-ring" aria-hidden="true" />}
        </button>
        <button className="pip-cta" onClick={onDone}>{demoFlipped ? "Let's play!" : 'Skip'}</button>
      </>)}

      <div className="onboard-dots">{[0, 1, 2].map((i) => <span key={i} className={i === step ? 'on' : ''} />)}</div>
      {step < 2 && <button className="onboard-skip" onClick={onDone}>Skip</button>}
    </div>
  );
}
