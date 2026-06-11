import { useState } from 'react';
import { Icon } from '../components/Icon.jsx';

// "This week" stats come from real tracked data: pip-daily-* keys (cards
// learned, last 7 days) and pip-progress (sets started). The prototype's
// hard-coded play-time stat is hidden until time is actually tracked
// (decision recorded in PROGRESS.md).
function weekStats(progress) {
  let learned7 = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    try {
      learned7 += parseInt(localStorage.getItem('pip-daily-' + d) || '0', 10);
    } catch { /* private mode */ }
  }
  const sets = Object.values(progress || {}).filter((arr) => arr.length > 0).length;
  return { learned7, sets };
}

const PIP_KEYS_PREFIXES = ['pip-onboarded', 'pip-progress', 'pip-earned', 'pip-settings', 'pip-daily-', 'pip-last-visit', 'pip-gallery', 'pip-doodle-'];

function exportData() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (PIP_KEYS_PREFIXES.some((p) => k.startsWith(p))) out[k] = localStorage.getItem(k);
    }
  } catch { /* private mode */ }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pip-cards-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(onDone) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const f = input.files && input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        Object.entries(data).forEach(([k, v]) => {
          if (PIP_KEYS_PREFIXES.some((p) => k.startsWith(p)) && typeof v === 'string') {
            localStorage.setItem(k, v);
          }
        });
        onDone(true);
      } catch {
        onDone(false);
      }
    };
    reader.readAsText(f);
  };
  input.click();
}

export function Parent({ onBack, settings, onSetting, progress }) {
  const [gate, setGate] = useState(true);
  // problem regenerates each time the gate opens (component mounts per visit)
  const [a] = useState(() => 2 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  if (gate) {
    const press = (d) => {
      if (d === 'del') { setVal((v) => v.slice(0, -1)); setErr(false); return; }
      const nv = (val + d).slice(0, 2);
      setVal(nv);
      if (parseInt(nv, 10) === a + b) setTimeout(() => setGate(false), 250);
      else if (nv.length >= String(a + b).length) setErr(true);
    };
    return (
      <div className="screen parent-gate" data-testid="parental-gate" data-screen-label="Parental gate">
        <button className="round-btn floaty" aria-label="Back" onClick={onBack}><Icon name="close" size={26} /></button>
        <Icon name="lock" size={40} color="var(--ink-2)" />
        <h1>For grown-ups</h1>
        <p>Solve this to continue.</p>
        <div className={`gate-problem ${err ? 'err' : ''}`}>{a} + {b} = <b>{val || '?'}</b></div>
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0].map((k) => (
            <button key={k} className="key" onClick={() => press(k === 'del' ? 'del' : k)}>{k === 'del' ? '⌫' : k}</button>
          ))}
        </div>
      </div>
    );
  }

  const stats = weekStats(progress);

  const Toggle = ({ name, label, desc }) => (
    <div className="set-row">
      <div className="set-text"><b>{label}</b>{desc && <small>{desc}</small>}</div>
      <button data-testid={`settings-toggle-${name}`} className={`switch ${settings[name] ? 'on' : ''}`}
        role="switch" aria-checked={!!settings[name]} aria-label={label} onClick={() => onSetting(name, !settings[name])}>
        <span className="knob" />
      </button>
    </div>
  );

  return (
    <div className="screen parent-dash" data-screen-label="Parent dashboard">
      <header className="deck-bar">
        <button className="round-btn" aria-label="Back home" onClick={onBack}><Icon name="back" size={26} /></button>
        <div className="deck-title"><b>For grown-ups</b></div>
        <span style={{ width: 48 }} />
      </header>

      <div className="dash-card">
        <h3>This week</h3>
        <div className="dash-stats">
          <div><b>{stats.learned7}</b><small>cards learned</small></div>
          <div><b>{stats.sets}</b><small>sets started</small></div>
        </div>
      </div>

      <h2 className="shelf-title">Settings</h2>
      <div className="set-list">
        <Toggle name="sound" label="Sound effects" desc="Taps, flips, wins" />
        <Toggle name="music" label="Background music" />
        <Toggle name="voice" label="Spoken words" desc="Pip reads aloud" />
        <Toggle name="motion" label="Big animations" desc="Off = calmer, less motion" />
        <div className="set-row">
          <div className="set-text"><b>Voice language</b><small>Pip&apos;s accent</small></div>
          <select className="set-select" data-testid="settings-toggle-language" value={settings.language}
            onChange={(e) => onSetting('language', e.target.value)}>
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Español (soon)</option>
          </select>
        </div>
        <div className="set-row">
          <div className="set-text"><b>Difficulty</b><small>Quiz options</small></div>
          <select className="set-select" value={settings.difficulty} onChange={(e) => onSetting('difficulty', e.target.value)}>
            <option value="easy">Easy (2 choices)</option>
            <option value="normal">Normal (4 choices)</option>
          </select>
        </div>
        <Toggle name="limit" label="Screen-time reminder" desc="Gentle nudge after 20 min" />
      </div>

      <div className="dash-actions">
        <button className="pip-cta ghost sm" onClick={exportData}>Export data</button>
        <button className="pip-cta ghost sm" onClick={() => importData((ok) => setImportMsg(ok ? 'Imported! Reload to see it.' : 'That file didn’t work.'))}>Import data</button>
      </div>
      {importMsg && <p className="privacy">{importMsg}</p>}
      <p className="privacy">No login. No ads. Everything stays on this device.</p>
    </div>
  );
}
