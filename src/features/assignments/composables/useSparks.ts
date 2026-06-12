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

const sparks = ref<Spark[]>([])
let seq = 0

const CHARS = ['✦', '✶', '✨', '●']
const COLORS = ['#10B981', '#4F46E5', '#F59E0B']

/**
 * Celebratory spark burst, rendered once by <SparkLayer> at the viewport root.
 * Singleton state so a card can fire a burst and unmount without losing it.
 */
export function useSparks() {
  function burst(x: number, y: number): void {
    for (let i = 0; i < 7; i++) {
      const id = seq++
      sparks.value.push({
        id,
        char: CHARS[i % 4],
        x: x + (Math.random() * 40 - 20),
        y,
        color: COLORS[i % 3],
        size: 11 + Math.random() * 9,
        delay: i * 0.04,
      })
      window.setTimeout(() => {
        sparks.value = sparks.value.filter((s) => s.id !== id)
      }, 950)
    }
  }

  return { sparks, burst }
}
