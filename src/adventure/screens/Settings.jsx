// Settings.jsx — gear -> grown-ups math gate -> 5-tab control panel
// (Buddy / Sound / Play / Games / Progress). Ported verbatim from
// adventure-settings.jsx `SettingsModal` (window globals -> imports).
import { useState } from 'react';
import { Mascot } from '../art/Mascot.jsx';
import { MASCOT_CONCEPTS, BUDDY_LABELS } from '../art/buddy.js';
import { I } from '../art/icons.jsx';
import { advSfx } from '../audio.js';

// catalog of all activities (id -> label)
const ALL_ACTIVITIES = [
  { id: 'bubble', label: 'Bubble Pop' }, { id: 'memory', label: 'Memory Match' },
  { id: 'trace', label: 'Finger Tracing' }, { id: 'sort', label: 'Feed the Monsters' },
  { id: 'train', label: 'Counting Train' }, { id: 'shadow', label: 'Shadow Puzzle' },
  { id: 'pipsays', label: 'Pip Says' }, { id: 'peek', label: 'Peek-a-Boo' },
  { id: 'cube', label: 'Magic Cube' }, { id: 'jigsaw', label: 'Jigsaw' },
  { id: 'egg', label: 'Egg Surprise' }, { id: 'boxes', label: 'Mystery Boxes' },
  { id: 'wheel', label: 'Prize Wheel' }, { id: 'doors', label: 'Magic Doors' },
  { id: 'unfold', label: 'Magic Paper' }, { id: 'stack', label: 'Block Stacker' },
  { id: 'tunnel', label: 'Tunnel Runner' }, { id: 'fountain', label: 'Card Fountain' },
  { id: 'balloon', label: 'Balloon Float' }, { id: 'calm', label: 'Calm Corner' },
  { id: 'paint', label: 'Paint Studio' },
];
// module-level so it isn't recreated each render (react-hooks/static-components)
function Toggle({ set, update, k, label, desc }) {
  return (
    <div className="set-row2">
      <div className="set-text2"><b>{label}</b>{desc && <small>{desc}</small>}</div>
      <button className={`switch2 ${set[k] ? 'on' : ''}`} role="switch" aria-checked={!!set[k]}
        data-testid={`adv-set-${k}`} aria-label={label}
        onClick={() => { advSfx('tap'); update(k, !set[k]); }}>
        <span className="knob2" />
      </button>
    </div>
  );
}

export function SettingsModal({ set, update, onClose, onQuickPlay, onUnlockAll, onReset }) {
  const [gated, setGated] = useState(true);
  const [a] = useState(() => 2 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState('buddy');
  const [confirmReset, setConfirmReset] = useState(false);

  const press = (d) => {
    advSfx('tap');
    if (d === 'del') { setVal((v) => v.slice(0, -1)); setErr(false); return; }
    const nv = (val + d).slice(0, 2);
    setVal(nv);
    if (parseInt(nv, 10) === a + b) { advSfx('yes'); setTimeout(() => setGated(false), 200); }
    else if (nv.length >= String(a + b).length) setErr(true);
  };

  const toggleActivity = (id) => {
    advSfx('tap');
    const dis = set.disabled.includes(id) ? set.disabled.filter((x) => x !== id) : [...set.disabled, id];
    update('disabled', dis);
  };

  return (
    <div className="set-scrim" data-testid="settings-modal" onClick={onClose}>
      <div className="set-panel" onClick={(e) => e.stopPropagation()}>
        <div className="set-head">
          <b>{gated ? 'For grown-ups' : 'Settings'}</b>
          <button className="gbtn white round" aria-label="Close settings" data-testid="settings-close"
            onClick={onClose} style={{ minHeight: 46, width: 46 }}><I n="close" s={20} /></button>
        </div>

        {gated ? (
          <div className="gate2" data-testid="settings-gate">
            <p>Solve this to open settings.</p>
            <div className={`gate2-q ${err ? 'err' : ''}`}>{a} + {b} = <b>{val || '?'}</b></div>
            <div className="gate2-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0].map((k) => (
                <button key={k} className="gate2-key" onClick={() => press(k === 'del' ? 'del' : k)}>{k === 'del' ? '⌫' : k}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="set-tabs" role="tablist">
              {[['buddy', 'Buddy'], ['sound', 'Sound'], ['play', 'Play'], ['activities', 'Games'], ['progress', 'Progress']].map(([id, l]) => (
                <button key={id} role="tab" aria-selected={tab === id} className={`set-tab ${tab === id ? 'on' : ''}`}
                  data-testid={`settings-tab-${id}`} onClick={() => { advSfx('tap'); setTab(id); }}>{l}</button>
              ))}
            </div>

            <div className="set-body">
              {tab === 'buddy' && (<>
                <p className="set-hint">Pick your learning buddy! They cheer you on everywhere — on the map, in games, quizzes and stories.</p>
                <div className="buddy-grid">
                  {MASCOT_CONCEPTS.map((c) => (
                    <button key={c} className={`buddy-pick ${set.buddy === c ? 'on' : ''}`} data-testid={`buddy-${c}`}
                      aria-label={BUDDY_LABELS[c]} aria-pressed={set.buddy === c}
                      onClick={() => { advSfx('yes'); update('buddy', c); }}>
                      <span className="buddy-pick-art"><Mascot concept={c} state="cheer" size={62} /></span>
                      <b>{BUDDY_LABELS[c]}</b>
                      {set.buddy === c && <span className="buddy-check"><I n="check" s={16} /></span>}
                    </button>
                  ))}
                </div>
              </>)}

              {tab === 'sound' && (<>
                <Toggle set={set} update={update} k="voice" label="Pip's voice" desc="Reads words out loud" />
                <Toggle set={set} update={update} k="sfx" label="Sound effects" desc="Dings, pops & cheers" />
                <Toggle set={set} update={update} k="music" label="Soft music" desc="Gentle background tune" />
              </>)}

              {tab === 'play' && (<>
                <Toggle set={set} update={update} k="motion" label="Big animations" desc="Off = calm & still" />
                <div className="set-block">
                  <div className="set-text2"><b>Colour tone</b><small>Gentler colours to protect little eyes</small></div>
                  <div className="tone-grid" role="radiogroup" aria-label="Colour tone">
                    {[
                      ['normal', 'Normal'], ['grey', 'Greyscale'],
                      ['warm', 'Reading'], ['soft', 'Softer'],
                    ].map(([v, l]) => (
                      <button key={v} role="radio" aria-checked={(set.colorTone || 'normal') === v}
                        className={`tone-opt tone-${v} ${(set.colorTone || 'normal') === v ? 'on' : ''}`}
                        data-testid={`adv-tone-${v}`}
                        onClick={() => { advSfx('tap'); update('colorTone', v); }}>
                        <span className="tone-sw" aria-hidden="true" />{l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="set-row2">
                  <div className="set-text2"><b>Quiz difficulty</b><small>How many choices</small></div>
                  <div className="seg2" role="radiogroup" aria-label="Quiz difficulty">
                    {[['easy', 'Easy · 2'], ['normal', 'Normal · 4']].map(([v, l]) => (
                      <button key={v} role="radio" aria-checked={set.difficulty === v}
                        className={`seg2-opt ${set.difficulty === v ? 'on' : ''}`} data-testid={`adv-diff-${v}`}
                        onClick={() => { advSfx('tap'); update('difficulty', v); }}>{l}</button>
                    ))}
                  </div>
                </div>
              </>)}

              {tab === 'activities' && (<>
                <p className="set-hint">Turn games off to hide them everywhere. Tap ▶ to jump straight in.</p>
                <div className="act-list">
                  {ALL_ACTIVITIES.map((a2) => {
                    const off = set.disabled.includes(a2.id);
                    return (
                      <div key={a2.id} className={`act-row ${off ? 'off' : ''}`}>
                        <button className="act-play" aria-label={`Play ${a2.label} now`} data-testid={`quickplay-${a2.id}`}
                          disabled={off} onClick={() => { advSfx('yes'); onQuickPlay(a2.id); }}><I n="play" s={18} /></button>
                        <b>{a2.label}</b>
                        <button className={`switch2 sm ${off ? '' : 'on'}`} role="switch" aria-checked={!off}
                          aria-label={`${a2.label} enabled`} data-testid={`acttoggle-${a2.id}`}
                          onClick={() => toggleActivity(a2.id)}><span className="knob2" /></button>
                      </div>
                    );
                  })}
                </div>
              </>)}

              {tab === 'progress' && (<>
                <button className="gbtn white wide" data-testid="adv-unlock-all"
                  onClick={() => { advSfx('win'); onUnlockAll(); }}>
                  <I n="star" s={20} /> Unlock all lands
                </button>
                {!confirmReset ? (
                  <button className="gbtn white wide danger" data-testid="adv-reset"
                    onClick={() => { advSfx('tap'); setConfirmReset(true); }}>
                    <I n="trash" s={20} /> Reset all progress
                  </button>
                ) : (
                  <div className="reset-confirm" data-testid="adv-reset-confirm">
                    <b>Erase all stars & stickers?</b>
                    <div className="reset-row">
                      <button className="gbtn white" onClick={() => setConfirmReset(false)}>Keep it</button>
                      <button className="gbtn danger2" data-testid="adv-reset-yes"
                        onClick={() => { advSfx('no'); onReset(); }}>Yes, erase</button>
                    </div>
                  </div>
                )}
                <p className="set-hint">No login. No ads. Everything stays on this device.</p>
              </>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
