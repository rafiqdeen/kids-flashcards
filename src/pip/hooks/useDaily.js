// pip-daily-YYYY-MM-DD: cards mastered today. Forgiving by design — the goal
// ring fills and resets daily; missing a day is never surfaced as failure.
import { useState, useCallback } from 'react';

const todayKey = () => 'pip-daily-' + new Date().toISOString().slice(0, 10);

export function useDaily() {
  const [dailyCount, setDailyCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(todayKey()) || '0', 10);
    } catch {
      return 0;
    }
  });

  const bumpDaily = useCallback(() => {
    setDailyCount((n) => {
      const v = n + 1;
      try {
        localStorage.setItem(todayKey(), String(v));
      } catch {
        // private mode
      }
      return v;
    });
  }, []);

  return { dailyCount, bumpDaily };
}
