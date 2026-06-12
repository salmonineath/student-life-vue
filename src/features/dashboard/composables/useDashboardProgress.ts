import { computed, ref } from 'vue'

/** Counters shown across the hero, assignments, and progress sections. */
export interface ProgressCounts {
  upcoming: number
  overdue: number
  done: number
  onTrack: number
  behind: number
}

/**
 * Dashboard task-completion state.
 *
 * Encapsulates the single interactive behavior of the prototype: ticking the
 * assignment flips every dependent counter and the completion percentage. Kept
 * as a composable (not Pinia) because it is dashboard-local view state.
 */
export function useDashboardProgress() {
  const done = ref(false)

  function toggle(): void {
    done.value = !done.value
  }

  const completionPct = computed(() => (done.value ? 100 : 0))

  const counts = computed<ProgressCounts>(() => ({
    upcoming: done.value ? 0 : 1,
    overdue: 0,
    done: done.value ? 1 : 0,
    onTrack: 0,
    behind: done.value ? 0 : 1,
  }))

  return { done, toggle, completionPct, counts }
}
