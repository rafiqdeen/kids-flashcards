// pip-progress: { [categoryId]: cardId[] } — mastered cards only (README schema).
// One-time migration seeds it from the legacy `kids-flashcards-progress` key so
// existing kids keep their mastery (legacy key left untouched).
import { useState, useEffect, useCallback } from 'react';

const KEY = 'pip-progress';
const LEGACY_KEY = 'kids-flashcards-progress';
const LEGACY_CAT_MAP = { bodyparts: 'body' };

function migrateLegacy() {
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
    if (!legacy) return {};
    const out = {};
    for (const [cat, val] of Object.entries(legacy)) {
      if (val && Array.isArray(val.mastered) && val.mastered.length) {
        out[LEGACY_CAT_MAP[cat] || cat] = val.mastered.map(String);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
      return migrateLegacy();
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      // private mode — keep in memory
    }
  }, [progress]);

  const masterCard = useCallback((catId, cardId) => {
    setProgress((p) => {
      const arr = p[catId] || [];
      if (arr.includes(cardId)) return p;
      return { ...p, [catId]: [...arr, cardId] };
    });
  }, []);

  return { progress, masterCard };
}
