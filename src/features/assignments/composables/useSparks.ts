import { ref } from 'vue'

export interface Spark {
  id: number
  char: string
  /** Viewport coordinates (px). */
  x: number
  y: number
  color: string
  size: number
  delay: number
}

// Module-level (not inside useSparks) so all callers share one spark list —
// state must survive the triggering card unmounting mid-animation.
const sparks = ref<Spark[]>([])
let seq = 0

const SPARK_COUNT = 7
const CHARS = ['✦', '✶', '✨', '●']
const COLORS = ['#10B981', '#4F46E5', '#F59E0B']

/**
 * Celebratory spark burst, rendered once by <SparkLayer> at the viewport root.
 * Singleton state so a card can fire a burst and unmount without losing it.
 */
export function useSparks() {
  function burst(x: number, y: number): void {
    for (let i = 0; i < SPARK_COUNT; i++) {
      const id = seq++
      sparks.value.push({
        id,
        char: CHARS[i % CHARS.length],
        // Randomize horizontal spread (+/-20px) so sparks fan out instead of stacking.
        x: x + (Math.random() * 40 - 20),
        y,
        color: COLORS[i % COLORS.length],
        size: 11 + Math.random() * 9,
        // Stagger each spark's start slightly for a burst feel rather than a single flash.
        delay: i * 0.04,
      })
      // Self-cleanup: each spark removes itself after its animation lifetime.
      window.setTimeout(() => {
        sparks.value = sparks.value.filter((s) => s.id !== id)
      }, 950)
    }
  }

  return { sparks, burst }
}
