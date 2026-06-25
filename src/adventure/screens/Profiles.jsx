// Profiles.jsx — Welcome, profile create/picker/manage, parental math gate.
// Ported from adventure-profiles.jsx (window globals -> imports). Single-
// profile-first; grown-ups can add/switch/remove more (gated). Each profile
// namespaces its own data by id.
import { useState, useEffect, useRef } from 'react';
import { Mascot } from '../art/Mascot.jsx';
import { MASCOT_CONCEPTS, BUDDY_LABELS } from '../art/buddy.js';
import { advSfx } from '../audio.js';
import { newId } from '../data/profiles.js';
import { useInitialFocus } from '../hooks/useSpatialNav.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useBackHandler } from '../hooks/useBackButton.js';

const AGES = [{ k: 'little', l: 'Little', s: '2–3' }, { k: 'middle', l: 'Bigger', s: '4–5' }, { k: 'big', l: 'Big kid', s: '6–7' }];

/* ---------- reusable grown-up math gate ---------- */
export function ParentGate({ onPass, onClose }) {
  const [a] = useState(() => 2 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [val, setVal] = useState(''); const [err, setErr] = useState(false);
  const cardRef = useRef(null);
  useFocusTrap(cardRef, { onClose, initialFocus: () => cardRef.current && cardRef.current.querySelector('.gate2-key') });
  const press = (d) => {
    advSfx('tap');
    if (d === 'del') { setVal((v) => v.slice(0, -1)); setErr(false); return; }
    const nv = (val + d).slice(0, 2); setVal(nv);
    if (parseInt(nv, 10) === a + b) { advSfx('yes'); setTimeout(onPass, 200); }
    else if (nv.length >= String(a + b).length) setErr(true);
  };
  return (
    <div className="pf-scrim" data-testid="profile-gate" onClick={onClose}>
      <div className="pf-card pf-gate" ref={cardRef} role="dialog" aria-modal="true" aria-label="For grown-ups" onClick={(e) => e.stopPropagation()}>
        <div className="pf-lock">🔒</div>
        <b>For grown-ups</b>
        <p>Solve this to continue.</p>
        <div className={`gate2-q ${err ? 'err' : ''}`}>{a} + {b} = <b>{val || '?'}</b></div>
        <div className="gate2-pad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0].map((k) => (
          <button key={k} className="gate2-key" data-nav onClick={() => press(k === 'del' ? 'del' : k)}>{k === 'del' ? '⌫' : k}</button>
        ))}</div>
        <button className="pf-text-btn" data-nav onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

/* ---------- Welcome screen (2 calm directions) ---------- */
export function WelcomeScreen({ onStart, speak }) {
  const [variant, setVariant] = useState(() => { try { return localStorage.getItem('pip-welcome-variant') || 'calm'; } catch { return 'calm'; } });
  const pick = (v) => { setVariant(v); try { localStorage.setItem('pip-welcome-variant', v); } catch { /* private mode */ } };
  const rootRef = useRef(null);
  useInitialFocus(rootRef, [variant]); // land on the "start" CTA
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => speak && speak("Hi! I'm Pip. Let's go on an adventure!"), 500); return () => clearTimeout(t); }, []);

  return (
    <div className={`welcome welcome-${variant}`} data-screen-label="Welcome" ref={rootRef}>
      {variant === 'calm' ? (
        <div className="wc-inner">
          <div className="wc-ambient" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="wc-pip"><Mascot concept="pip" state="cheer" size={156} /></div>
          <h1 className="wc-mark"><span>Pip</span><em>!</em></h1>
          <p className="wc-sub">Little learners, big adventures.</p>
          <button className="wc-cta" data-nav data-nav-default="" data-testid="welcome-start" onClick={onStart}>Let’s go!</button>
        </div>
      ) : (
        <div className="wc-scene-wrap">
          <svg className="wc-scene" viewBox="0 0 100 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs><linearGradient id="wc_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ed0ff" /><stop offset="1" stopColor="#dff3ff" /></linearGradient></defs>
            <rect width="100" height="120" fill="url(#wc_sky)" />
            <circle cx="80" cy="22" r="11" fill="#ffe27a" /><circle cx="80" cy="22" r="16" fill="#ffe27a" opacity=".3" />
            <g fill="#fff" opacity=".9"><ellipse cx="24" cy="30" rx="13" ry="7" /><ellipse cx="32" cy="26" rx="9" ry="6" /></g>
            <path d="M0 70 Q30 56 60 66 T100 62 V120 H0Z" fill="#8fd66f" />
            <path d="M0 84 Q34 74 66 84 T100 80 V120 H0Z" fill="#6cc24f" />
            <path d="M40 120 Q44 86 50 86 Q56 86 60 120Z" fill="#e7d3a8" opacity=".9" />
            {[[18, 100], [78, 104], [30, 112]].map((p, i) => <path key={i} d={`M${p[0]} ${p[1]} l1.6 4 4.2.3 -3.3 2.7 1.1 4.1 -3.6 -2.3 -3.6 2.3 1.1 -4.1 -3.3 -2.7 4.2 -.3Z`} fill="#ffd84d" />)}
          </svg>
          <div className="wc-scene-pip"><Mascot concept="pip" state="cheer" size={134} /></div>
          <div className="wc-banner"><h1 className="wc-mark sm"><span>Pip</span><em>!</em></h1><p>An adventure of learning &amp; play</p></div>
          <button className="wc-cta" data-nav data-nav-default="" data-testid="welcome-start" onClick={onStart}>Start the adventure</button>
        </div>
      )}
      {/* compare directions — temporary picker for you to choose */}
      <div className="wc-variant-pick" role="group" aria-label="Welcome style">
        <span>Style:</span>
        <button className={variant === 'calm' ? 'on' : ''} data-nav onClick={() => pick('calm')}>Calm</button>
        <button className={variant === 'scene' ? 'on' : ''} data-nav onClick={() => pick('scene')}>Scene</button>
      </div>
    </div>
  );
}

/* ---------- Buddy avatar + name + age (create / edit) ---------- */
export function CreateProfile({ initial, onSave, onCancel, title = 'Make a profile' }) {
  const [name, setName] = useState(initial ? initial.name : '');
  const [buddy, setBuddy] = useState(initial ? initial.buddy : 'pip');
  const [age, setAge] = useState(initial ? initial.age : 'middle');
  const ok = name.trim().length > 0;
  const rootRef = useRef(null);
  useInitialFocus(rootRef);
  useBackHandler(onCancel || (() => {}), !!onCancel); // BACK = the optional "Back" action
  return (
    <div className="pf-screen" data-screen-label="Create profile" ref={rootRef}>
      <div className="pf-create">
        <h1 className="pf-h">{title}</h1>
        <div className="pf-preview"><Mascot concept={buddy} state="cheer" size={96} /></div>

        <label className="pf-field">
          <span>Name <small>(grown-up types this)</small></span>
          <input data-testid="profile-name" data-nav data-nav-default="" type="text" value={name} maxLength={14}
            placeholder="Type a name…" onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="pf-label">Pick a buddy</div>
        <div className="pf-buddy-grid">
          {MASCOT_CONCEPTS.map((c) => (
            <button key={c} className={`pf-buddy ${buddy === c ? 'on' : ''}`} data-nav data-testid={`profile-buddy-${c}`}
              aria-label={BUDDY_LABELS[c]} aria-pressed={buddy === c}
              onClick={() => { advSfx('tap'); setBuddy(c); }}>
              <Mascot concept={c} state="idle" size={46} />
            </button>
          ))}
        </div>

        <div className="pf-label">How big are you?</div>
        <div className="pf-age-row">
          {AGES.map((a) => (
            <button key={a.k} className={`pf-age ${age === a.k ? 'on' : ''}`} data-nav data-testid={`profile-age-${a.k}`}
              aria-pressed={age === a.k} onClick={() => { advSfx('tap'); setAge(a.k); }}>
              <b>{a.l}</b><small>{a.s}</small>
            </button>
          ))}
        </div>

        <div className="pf-actions">
          {onCancel && <button className="wc-cta ghost" data-nav onClick={onCancel}>Back</button>}
          <button className="wc-cta" data-nav data-testid="profile-save" disabled={!ok}
            onClick={() => { advSfx('win'); onSave({ id: initial ? initial.id : newId(), name: name.trim(), buddy, age }); }}>
            {initial ? 'Save' : "Let’s play!"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- "Who's playing?" picker ---------- */
export function ProfilePicker({ profiles, onPick, onAdd }) {
  const rootRef = useRef(null);
  useInitialFocus(rootRef);
  return (
    <div className="pf-screen" data-screen-label="Who's playing" ref={rootRef}>
      <h1 className="pf-h">Who’s playing?</h1>
      <div className="pf-pick-grid">
        {profiles.map((p, i) => (
          <button key={p.id} className="pf-pick-card" data-nav data-nav-default={i === 0 ? '' : undefined} data-testid={`pick-${p.id}`} onClick={() => { advSfx('yes'); onPick(p.id); }}>
            <span className="pf-avatar"><Mascot concept={p.buddy} state="cheer" size={72} /></span>
            <b>{p.name}</b>
          </button>
        ))}
        <button className="pf-pick-card add" data-nav data-testid="pick-add" onClick={onAdd}>
          <span className="pf-avatar plus">+</span><b>Add</b>
        </button>
      </div>
    </div>
  );
}

/* ---------- manage sheet (switch / add / remove) ---------- */
export function ProfileSheet({ profiles, activeId, onSwitch, onAdd, onDelete, onClose }) {
  const [confirmDel, setConfirmDel] = useState(null);
  const sheetRef = useRef(null);
  useFocusTrap(sheetRef, { onClose });
  return (
    <div className="pf-scrim" data-testid="profile-sheet" onClick={onClose}>
      <div className="pf-card pf-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Profiles" onClick={(e) => e.stopPropagation()}>
        <div className="pf-sheet-head"><b>Profiles</b>
          <button className="gbtn white round" data-nav aria-label="Close" data-testid="profile-sheet-close" onClick={onClose} style={{ minHeight: 44, width: 44 }}>✕</button>
        </div>
        <div className="pf-sheet-list">
          {profiles.map((p, i) => (
            <div key={p.id} className={`pf-row ${p.id === activeId ? 'active' : ''}`}>
              <button className="pf-row-main" data-nav data-nav-default={i === 0 ? '' : undefined} data-testid={`switch-${p.id}`} onClick={() => { if (p.id !== activeId) { advSfx('yes'); onSwitch(p.id); } }}>
                <span className="pf-avatar sm"><Mascot concept={p.buddy} state="idle" size={44} /></span>
                <span className="pf-row-name">{p.name}{p.id === activeId && <small>playing now</small>}</span>
              </button>
              {profiles.length > 1 && <button className="pf-del" data-nav aria-label={`Remove ${p.name}`} data-testid={`del-${p.id}`} onClick={() => setConfirmDel(p)}>Remove</button>}
            </div>
          ))}
        </div>
        <button className="wc-cta" data-nav data-testid="profile-add" onClick={onAdd}>+ Add a profile</button>
        <p className="pf-note">Grown-ups manage profiles. Everything stays on this device.</p>

        {confirmDel && (
          <div className="pf-confirm" data-testid="profile-del-confirm">
            <b>Remove {confirmDel.name}?</b><span>Their stars &amp; stickers will be erased.</span>
            <div className="pf-confirm-row">
              <button className="wc-cta ghost sm" data-nav onClick={() => setConfirmDel(null)}>Keep</button>
              <button className="wc-cta danger sm" data-nav data-testid="profile-del-yes" onClick={() => { onDelete(confirmDel.id); setConfirmDel(null); }}>Remove</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
