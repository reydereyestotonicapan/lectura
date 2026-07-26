import { useCallback, useEffect, useState } from 'react';
import { getPlanProgress } from '../api/readings';

export interface PlanProgressState {
  daysAnswered: number;
  totalDays: number;
}

/**
 * Overall reading-plan progress for the current user: how many distinct days
 * they have answered out of the total days in the plan. Refreshes on demand
 * (e.g. after answering a quiz). Silently no-ops for guests / offline.
 */
export function usePlanProgress() {
  const [planProgress, setPlanProgress] = useState<PlanProgressState | null>(null);

  const refreshPlanProgress = useCallback(async () => {
    try {
      const p = await getPlanProgress();
      setPlanProgress({ daysAnswered: p.days_answered, totalDays: p.total_days });
    } catch {
      // Keep any previous value; guests (401) simply have no plan progress.
    }
  }, []);

  useEffect(() => {
    refreshPlanProgress();
  }, [refreshPlanProgress]);

  return { planProgress, refreshPlanProgress };
}

export default usePlanProgress;
