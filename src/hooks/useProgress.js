import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kids-flashcards-progress';

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : getInitialProgress();
    } catch {
      return getInitialProgress();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage might not be available
    }
  }, [progress]);

  const markViewed = (category, cardId) => {
    setProgress((prev) => {
      const categoryProgress = prev[category] || { viewed: [], mastered: [] };
      if (categoryProgress.viewed.includes(cardId)) {
        return {
          ...prev,
          lastCategory: category, // Track last category
        };
      }
      return {
        ...prev,
        lastCategory: category, // Track last category
        [category]: {
          ...categoryProgress,
          viewed: [...categoryProgress.viewed, cardId],
        },
      };
    });
  };

  const markMastered = (category, cardId) => {
    setProgress((prev) => {
      const categoryProgress = prev[category] || { viewed: [], mastered: [] };
      if (categoryProgress.mastered.includes(cardId)) {
        return prev;
      }

      // Also mark as viewed if not already
      const viewed = categoryProgress.viewed.includes(cardId)
        ? categoryProgress.viewed
        : [...categoryProgress.viewed, cardId];

      return {
        ...prev,
        [category]: {
          ...categoryProgress,
          viewed,
          mastered: [...categoryProgress.mastered, cardId],
        },
      };
    });
  };

  const getCategoryProgress = (category) => {
    return progress[category] || { viewed: [], mastered: [] };
  };

  const resetProgress = (category) => {
    if (category) {
      setProgress((prev) => ({
        ...prev,
        [category]: { viewed: [], mastered: [] },
      }));
    } else {
      setProgress(getInitialProgress());
    }
  };

  return {
    progress,
    lastCategory: progress.lastCategory,
    markViewed,
    markMastered,
    getCategoryProgress,
    resetProgress,
  };
}

function getInitialProgress() {
  return {
    alphabet: { viewed: [], mastered: [] },
    numbers: { viewed: [], mastered: [] },
    animals: { viewed: [], mastered: [] },
    fruits: { viewed: [], mastered: [] },
    vegetables: { viewed: [], mastered: [] },
    birds: { viewed: [], mastered: [] },
    colors: { viewed: [], mastered: [] },
  };
}
