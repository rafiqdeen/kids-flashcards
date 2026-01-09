import { useCallback, useRef } from 'react';

export function useSound() {
  const audioContextRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Fade out to avoid click
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }, [getAudioContext]);

  const playSound = useCallback((soundType) => {
    switch (soundType) {
      case 'flip':
        // Quick click sound
        playTone(800, 0.05, 'square', 0.1);
        break;

      case 'success':
        // Ascending happy sound
        playTone(523, 0.15, 'sine', 0.2); // C5
        setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100); // E5
        setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200); // G5
        break;

      case 'error':
        // Descending sad sound
        playTone(400, 0.2, 'sawtooth', 0.15);
        setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.1), 150);
        break;

      case 'navigate':
        // Soft pop
        playTone(600, 0.08, 'sine', 0.15);
        break;

      case 'shuffle':
        // Shuffle whoosh effect
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            playTone(300 + Math.random() * 400, 0.05, 'square', 0.08);
          }, i * 40);
        }
        break;

      case 'celebrate':
        // Victory fanfare
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.25, 'sine', 0.2), i * 150);
        });
        // Add sparkle
        setTimeout(() => {
          for (let i = 0; i < 8; i++) {
            setTimeout(() => {
              playTone(1000 + Math.random() * 500, 0.1, 'sine', 0.1);
            }, i * 50);
          }
        }, 600);
        break;

      case 'click':
        playTone(500, 0.05, 'sine', 0.1);
        break;

      case 'pop':
        // Bubbly pop sound
        playTone(800, 0.08, 'sine', 0.2);
        setTimeout(() => playTone(1000, 0.06, 'sine', 0.15), 50);
        break;

      case 'whoosh':
        // Swoosh transition sound
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            playTone(200 + i * 100, 0.03, 'sine', 0.08 - i * 0.008);
          }, i * 15);
        }
        break;

      case 'ding':
        // Bell-like notification
        playTone(880, 0.3, 'sine', 0.15);
        playTone(1108, 0.3, 'sine', 0.1);
        break;

      case 'bounce':
        // Bouncy playful sound
        playTone(400, 0.1, 'sine', 0.15);
        setTimeout(() => playTone(600, 0.08, 'sine', 0.12), 80);
        setTimeout(() => playTone(500, 0.12, 'sine', 0.1), 150);
        break;

      case 'streak':
        // Streak achievement sound
        const streakNotes = [440, 554, 659, 880];
        streakNotes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.15, 'sine', 0.18), i * 80);
        });
        break;

      default:
        break;
    }
  }, [playTone]);

  return { playSound };
}
