// Primitives verification lab — mounted only with ?pip-lab in the URL.
// Drives every Phase 2 primitive through all its states for the verification
// protocol (not shipped in nav; harmless in production builds).
import { useState } from 'react';
import { Icon } from './components/Icon.jsx';
import { Mascot } from './components/Mascot.jsx';
import { MASCOT_CONCEPTS, MASCOT_STATES } from './data/mascots.js';
import { Illu } from './art/Illu.jsx';
import { FlashCard } from './components/FlashCard.jsx';
import { CategoryTile } from './components/CategoryTile.jsx';
import { QuizOption } from './components/QuizOption.jsx';
import { ProgressTrack } from './components/ProgressTrack.jsx';
import { StreakBadge } from './components/StreakBadge.jsx';
import { Confetti } from './components/Confetti.jsx';
import { SpeakButton } from './components/SpeakButton.jsx';
import { CaptionBar } from './components/CaptionBar.jsx';
import { announce, useSpeech } from './speech.js';
import { CATEGORIES } from './data/categories.js';

const DEMO_CARD = {
  id: 'a',
  front: { kind: 'mega', text: 'A' },
  word: 'Apple',
  badge: { label: 'A is for Apple', icon: 'tag' },
  illu: 'apple',
  phrase: 'A is for Apple.',
};

export function Lab() {
  const { speak, speaking } = useSpeech(false);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const say = (t) => { speak(t); announce(t); };

  return (
    <div className="screen" data-screen-label="Lab" style={{ gap: 24 }}>
      <h1>Pip primitives lab</h1>

      <h2>Mascot — 6 × 5</h2>
      <div data-testid="lab-mascots" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {MASCOT_CONCEPTS.map((c) => (
          <div key={c} style={{ display: 'flex', gap: 4 }}>
            {MASCOT_STATES.map((s) => <Mascot key={s} concept={c} state={s} size={64} />)}
          </div>
        ))}
      </div>

      <h2>FlashCard</h2>
      <FlashCard
        card={DEMO_CARD} catColor="alphabet" flipped={flipped} mastered={mastered}
        onFlip={() => { setFlipped((f) => !f); if (!flipped) say(DEMO_CARD.phrase); }}
        onSpeak={() => say(DEMO_CARD.phrase)} speaking={speaking}
      />
      <button data-testid="lab-master" className="pip-cta sm" onClick={() => { setMastered(true); setConfetti(true); }}>
        Master it
      </button>

      <h2>CategoryTile states</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 170px)', gap: 16 }}>
        <CategoryTile cat={CATEGORIES[2]} progress={0} onSelect={(c) => say(c.name)} />
        <CategoryTile cat={CATEGORIES[3]} progress={0.4} onSelect={(c) => say(c.name)} />
        <CategoryTile cat={CATEGORIES[6]} done onSelect={(c) => say(c.name)} />
      </div>

      <h2>QuizOption states</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 200px)', gap: 16 }}>
        {['idle', 'correct', 'wrong', 'reveal'].map((s, i) => (
          <QuizOption key={s} index={i} state={s}
            option={{ label: s, render: <Illu name="apple" size={64} /> }}
            onPick={() => say(s)} />
        ))}
      </div>

      <h2>Track · streak · speak</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <ProgressTrack steps={3} active={2} />
        <StreakBadge n={0} />
        <StreakBadge n={4} />
        <SpeakButton onSpeak={() => say('Hello! I can talk.')} speaking={speaking} />
        <SpeakButton onSpeak={() => {}} disabled />
      </div>

      <Confetti show={confetti} onDone={() => setConfetti(false)} />
      <CaptionBar />
    </div>
  );
}
