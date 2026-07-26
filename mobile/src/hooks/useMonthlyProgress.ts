import { useCallback, useEffect, useState } from 'react';
import { getMonthlyProgress, MonthlyProgress } from '../api/readings';

/**
 * This month's recognition progress for the current user: distinct days
 * answered, the month's reading-day total, and the current award category.
 * Refreshes on demand (e.g. after answering a quiz). Resets each month and
 * silently no-ops for guests / offline.
 */
export function useMonthlyProgress() {
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress | null>(null);

  const refreshMonthlyProgress = useCallback(async () => {
    try {
      setMonthlyProgress(await getMonthlyProgress());
    } catch {
      // Keep any previous value; guests (401) simply have no progress.
    }
  }, []);

  useEffect(() => {
    refreshMonthlyProgress();
  }, [refreshMonthlyProgress]);

  return { monthlyProgress, refreshMonthlyProgress };
}

export default useMonthlyProgress;
