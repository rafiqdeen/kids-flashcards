// Speech diagnostic overlay — open the app with ?pipdebug to see it.
// Tells us whether ANY speech works in this browser and what voice is picked,
// so we stop guessing. Not part of the normal UI.
import { useState, useEffect } from 'react';
import { pickVoice } from './speech.js';

const BUILD = 'speech-debug-1';

export function SpeechDebug() {
  const [voices, setVoices] = useState([]);
  const [log, setLog] = useState([]);
  const add = (m) => setLog((l) => [`${new Date().toISOString().slice(11, 19)} ${m}`, ...l].slice(0, 12));

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
    load();
    window.speechSynthesis?.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', load);
  }, []);

  const run = (label, build) => {
    const synth = window.speechSynthesis;
    if (!synth) { add('NO speechSynthesis API'); return; }
    try {
      if (synth.speaking || synth.pending) synth.cancel();
      const u = build();
      u.onstart = () => add(`${label}: onstart ✓ (audio should play)`);
      u.onend = () => add(`${label}: onend`);
      u.onerror = (e) => add(`${label}: ERROR ${e.error}`);
      window.__keep = window.__keep || [];
      window.__keep.push(u);
      synth.speak(u);
      synth.resume();
      add(`${label}: speak() called, voice=${u.voice ? u.voice.name : 'default'} lang=${u.lang || '(none)'}`);
    } catch (e) {
      add(`${label}: threw ${e.message}`);
    }
  };

  const picked = window.speechSynthesis ? pickVoice('en-US') : null;
  const defaultVoice = voices.find((v) => v.default);

  const box = { position: 'fixed', inset: '8px', zIndex: 9999, background: '#fff', color: '#222',
    font: '13px/1.4 monospace', padding: 12, borderRadius: 12, overflow: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,.3)' };
  const btn = { display: 'block', width: '100%', margin: '6px 0', padding: '14px', fontSize: 16, fontWeight: 700,
    borderRadius: 10, border: '2px solid #333', background: '#ffe9d2', cursor: 'pointer' };

  return (
    <div style={box}>
      <b>Pip speech debug</b> ({BUILD}) — tap a button, watch the log, screenshot it.
      <button style={btn} onClick={() => run('1 plain', () => new SpeechSynthesisUtterance('Hello, can you hear me?'))}>
        1) PLAIN speak (bare API, default voice)
      </button>
      <button style={btn} onClick={() => run('2 enUS', () => {
        const u = new SpeechSynthesisUtterance('A is for Apple');
        const v = pickVoice('en-US'); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
        return u;
      })}>
        2) APP picker (en-US)
      </button>
      <button style={btn} onClick={() => run('3 firstLocal', () => {
        const u = new SpeechSynthesisUtterance('Testing offline voice');
        const v = voices.find((x) => x.localService); if (v) { u.voice = v; u.lang = v.lang; }
        return u;
      })}>
        3) First OFFLINE voice
      </button>
      <div style={{ margin: '8px 0' }}>
        <div>speechSynthesis: <b>{window.speechSynthesis ? 'present' : 'MISSING'}</b></div>
        <div>voices loaded: <b>{voices.length}</b></div>
        <div>OS default voice: <b>{defaultVoice ? `${defaultVoice.name} / ${defaultVoice.lang} / local=${defaultVoice.localService}` : '(none)'}</b></div>
        <div>app picks (en-US): <b>{picked ? `${picked.name} / ${picked.lang} / local=${picked.localService}` : '(none)'}</b></div>
        <div>pip-settings: <b>{(() => { try { return localStorage.getItem('pip-settings') || '(none)'; } catch { return '(blocked)'; } })()}</b></div>
      </div>
      <div style={{ background: '#f4f4f4', padding: 8, borderRadius: 8, minHeight: 80 }}>
        {log.length === 0 ? '(log will appear here)' : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div style={{ marginTop: 8, fontSize: 11 }}>
        first 8 voices: {voices.slice(0, 8).map((v) => `${v.name}(${v.lang}${v.localService ? ',local' : ''}${v.default ? ',default' : ''})`).join(' · ')}
      </div>
    </div>
  );
}
