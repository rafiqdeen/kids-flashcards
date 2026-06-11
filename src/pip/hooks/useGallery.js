// pip-gallery: [{ id, template, label, data(PNG dataURL) }] capped at 24.
// dataURLs are large — write-through with try/catch so quota overruns
// degrade to in-memory only (decision recorded in PROGRESS.md).
import { useState, useCallback } from 'react';

const KEY = 'pip-gallery';

export function useGallery() {
  const [gallery, setGallery] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addArt = useCallback((art) => {
    setGallery((g) => {
      const ng = [art, ...g].slice(0, 24);
      try {
        localStorage.setItem(KEY, JSON.stringify(ng));
      } catch {
        // quota exceeded — keep in memory for the session
      }
      return ng;
    });
  }, []);

  return { gallery, addArt };
}
