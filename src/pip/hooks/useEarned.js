// pip-earned: string[] sticker ids (README schema).
import { useState, useEffect, useCallback } from 'react';

const KEY = 'pip-earned';

export function useEarned() {
  const [earned, setEarned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(earned));
    } catch {
      // private mode
    }
  }, [earned]);

  const addSticker = useCallback((id) => {
    setEarned((e) => (e.includes(id) ? e : [...e, id]));
  }, []);

  // mastering cards drips stickers from a starter cycle (reference behavior)
  const dripSticker = useCallback(() => {
    setEarned((e) => (e.length < 9 && !e.includes('star')
      ? [...e, ['cat', 'apple', 'sun', 'star', 'frog'][e.length % 5]]
      : e));
  }, []);

  return { earned, addSticker, dripSticker };
}
