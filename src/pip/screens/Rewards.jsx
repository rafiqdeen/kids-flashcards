import { useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import { Illu } from '../art/Illu.jsx';
import { announce } from '../speech.js';
import { STICKERS } from '../data/stickers.js';

export function Rewards({ onBack, earned, onOpenChest, gallery = [], onPaint, speak }) {
  const [chestState, setChestState] = useState('closed'); // closed | opening | reveal
  const [reward, setReward] = useState(null);

  const open = () => {
    if (chestState !== 'closed') return;
    setChestState('opening');
    speak('Surprise!');
    setTimeout(() => {
      const pick = STICKERS[Math.floor(Math.random() * STICKERS.length)];
      setReward(pick);
      setChestState('reveal');
      onOpenChest(pick);
      announce('You got a sticker!');
    }, 900);
  };

  return (
    <div className="screen rewards" data-screen-label="Rewards">
      <header className="deck-bar">
        <button className="round-btn" aria-label="Back home" onClick={onBack}><Icon name="back" size={26} /></button>
        <div className="deck-title"><b>My Treasures</b></div>
        <span style={{ width: 48 }} />
      </header>

      <div className="chest-zone">
        <button className={`chest ${chestState}`} onClick={open} aria-label="Open surprise chest" data-testid="reward-chest">
          <span className="chest-lid"><Icon name="gift" size={70} color="#fff" /></span>
          {chestState === 'reveal' && reward && (
            <span className="chest-reward"><Illu name={reward} size={88} /></span>
          )}
          {chestState !== 'reveal' && <span className="chest-label">Tap to open!</span>}
        </button>
        {chestState === 'reveal' && <button className="pip-cta" onClick={() => { setChestState('closed'); setReward(null); }}>Yay! Keep going</button>}
      </div>

      <h2 className="shelf-title">My art</h2>
      {gallery.length > 0 ? (
        <div className="art-gallery" data-testid="art-gallery">
          {gallery.map((a) => (
            <div key={a.id} className="art-frame">
              <img src={a.data} alt={`My ${a.label} painting`} />
              <small>{a.label}</small>
            </div>
          ))}
        </div>
      ) : (
        <button className="art-empty" onClick={onPaint}>
          <Icon name="palette" size={26} />
          <span>Paint a picture and it will live here!</span>
        </button>
      )}

      <h2 className="shelf-title">Sticker book</h2>
      <div className="sticker-album">
        {STICKERS.map((s) => {
          const has = earned.includes(s);
          return (
            <div key={s} className={`sticker-slot ${has ? 'has' : ''}`} aria-label={has ? `Sticker ${s}` : 'Empty slot'}>
              {has ? <Illu name={s} size={56} /> : <Icon name="lock" size={26} color="var(--ink-3)" />}
            </div>
          );
        })}
      </div>

      <h2 className="shelf-title">Badges</h2>
      <div className="badge-shelf">
        {[
          { id: 'first', l: 'First card', on: earned.length > 0 },
          { id: 'streak', l: '3 in a row', on: earned.length >= 2 },
          { id: 'cat', l: 'Finished a set', on: false },
        ].map((b) => (
          <div key={b.id} className={`badge ${b.on ? 'on' : ''}`}>
            <span className="badge-medal"><Icon name="star" size={30} color={b.on ? '#fff' : 'var(--ink-3)'} /></span>
            <small>{b.l}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
