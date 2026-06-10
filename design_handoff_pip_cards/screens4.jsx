// screens4.jsx — v2 additions: PWA update toast, daily goal ring, welcome-back, keyboard help
(function () {
  const { useState, useEffect } = React;

  // ---------- PWA update toast ----------
  function UpdateToast() {
    const [show, setShow] = useState(false);
    useEffect(() => {
      if (sessionStorage.getItem('pip-toast-seen')) return;
      const t = setTimeout(() => setShow(true), 9000);
      return () => clearTimeout(t);
    }, []);
    const dismiss = () => { setShow(false); try { sessionStorage.setItem('pip-toast-seen', '1'); } catch (e) {} };
    if (!show) return null;
    return (
      <div className="pwa-toast" role="status" data-testid="pwa-toast">
        <Icon name="sparkle" size={22} />
        <span>A new version is ready!</span>
        <button className="toast-cta" onClick={dismiss}>Refresh</button>
        <button className="toast-x" aria-label="Not now" onClick={dismiss}><Icon name="close" size={18} /></button>
      </div>
    );
  }

  // ---------- Daily goal ring (forgiving — fills, never shames) ----------
  function DailyGoalRing({ count, goal = 5, size = 52 }) {
    const pct = Math.min(1, count / goal);
    const r = (size - 8) / 2, c = 2 * Math.PI * r;
    return (
      <div className="goal-ring" data-testid="daily-goal" role="img"
        aria-label={`Today: ${count} of ${goal} cards learned`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pop-grass)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 400ms var(--ease-spring)' }} />
        </svg>
        <span className="goal-ring-label">{pct >= 1 ? <Icon name="check" size={20} color="var(--pop-grass)" /> : count}</span>
      </div>
    );
  }

  // ---------- Welcome back (comeback is celebrated, absence never punished) ----------
  function useWelcomeBack(speak) {
    const [back, setBack] = useState(false);
    useEffect(() => {
      let last; try { last = parseInt(localStorage.getItem('pip-last-visit') || '0', 10); } catch (e) { last = 0; }
      const now = Date.now();
      if (last && now - last > 6 * 3600 * 1000) {
        setBack(true);
        setTimeout(() => { speak('Welcome back! I missed you!'); announce('Welcome back!'); }, 700);
        setTimeout(() => setBack(false), 4200);
      }
      try { localStorage.setItem('pip-last-visit', String(now)); } catch (e) {}
      // eslint-disable-next-line
    }, []);
    return back;
  }
  function WelcomeBack({ show, mascot }) {
    if (!show) return null;
    return (
      <div className="welcome-back" data-testid="welcome-back" aria-hidden="true">
        <Mascot concept={mascot} state="cheer" size={84} />
        <b>Welcome back!</b>
      </div>
    );
  }

  // ---------- Keyboard help ("?" map for parents / older kids) ----------
  function KeyHelp({ onClose }) {
    const ROWS = [
      { keys: ['←', '→'], label: 'Previous / next card' },
      { keys: ['Space'], label: 'Flip the card' },
      { keys: ['Enter'], label: 'Flip the card' },
      { keys: ['Esc'], label: 'Back to home' },
      { keys: ['Tab'], label: 'Move between buttons' },
    ];
    return (
      <div className="modal-scrim" data-testid="key-help" onClick={onClose}>
        <div className="trophy-modal key-help-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Keyboard keys</h2>
          <div className="key-rows">
            {ROWS.map((row, i) => (
              <div key={i} className="key-row">
                <span className="key-caps">{row.keys.map(k => <kbd key={k}>{k}</kbd>)}</span>
                <span className="key-label">{row.label}</span>
              </div>
            ))}
          </div>
          <button className="pip-cta ghost" onClick={onClose}>Got it</button>
        </div>
      </div>
    );
  }

  Object.assign(window, { UpdateToast, DailyGoalRing, useWelcomeBack, WelcomeBack, KeyHelp });
})();
