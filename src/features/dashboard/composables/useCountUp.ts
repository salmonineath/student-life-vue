import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

interface UseCountUpOptions {
  /** Element to observe; the count-up starts when it scrolls into view. */
  el?: Readonly<Ref<HTMLElement | null>>
  /** Visibility ratio that triggers the count-up. */
  threshold?: number
  /** When false, the value is shown immediately and tracks `target` reactively. */
  enabled?: boolean
}

/**
 * Reactive replacement for the prototype's IntersectionObserver count-up.
 *
 * The displayed number animates from 0 up to `target` the first time the bound
 * element scrolls into view. After that initial run it tracks `target`
 * reactively (jumping, not re-animating) — matching the original behavior where
 * toggling a task set the counters directly.
 */
export function useCountUp(target: Ref<number>, options: UseCountUpOptions = {}) {
  const { el, threshold = 0.6, enabled = true } = options

  const display = ref(0)

  let hasRun = false
  let timer: ReturnType<typeof setInterval> | null = null
  let observer: IntersectionObserver | null = null

  function stopTimer(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function animateTo(value: number): void {
    stopTimer()
    if (value <= 0) {
      display.value = value
      return
    }
    let current = 0
    const step = Math.max(1, Math.round(value / 24))
    timer = setInterval(() => {
      current += step
      if (current >= value) {
        current = value
        stopTimer()
      }
      display.value = current
    }, 32)
  }

  function run(): void {
    if (hasRun) return
    hasRun = true
    animateTo(target.value)
  }

  onMounted(() => {
    if (!enabled) {
      display.value = target.value
      hasRun = true
      return
    }
    if (!el?.value || typeof IntersectionObserver === 'undefined') {
      run()
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run()
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold },
    )
    observer.observe(el.value)
  })

  // Once the entrance animation has played, reflect later changes instantly.
  watch(target, (value) => {
    if (hasRun) {
      stopTimer()
      display.value = value
    }
  })

  onBeforeUnmount(() => {
    stopTimer()
    observer?.disconnect()
  })

  return { display }
}
