import { ref } from 'vue'

/** Brand color of a toast (maps to a fill in ToastStack). */
export type ToastColor = 'emerald' | 'indigo' | 'amber' | 'danger'

/** Icon key of a toast (mapped to a Lucide component in ToastStack). */
export type ToastIcon =
  | 'check'
  | 'check-check'
  | 'sparkles'
  | 'trash'
  | 'party'
  | 'alarm'
  | 'clock'
  | 'calendar'
  | 'star'
  | 'paperclip'
  | 'mail'

export interface Toast {
  id: number
  /** Message HTML — may contain inline <b> emphasis. */
  msg: string
  icon: ToastIcon
  color: ToastColor
  /** Toggled just before removal to play the exit animation. */
  leaving: boolean
}

const toasts = ref<Toast[]>([])
let seq = 0

/**
 * Global toast queue.
 *
 * Toasts are fired from several features (assignment actions, schedule
 * reminders) but rendered once by <ToastStack>, so the state lives at module
 * scope — a lightweight singleton rather than per-component state.
 */
export function useToasts() {
  function dismiss(id: number): void {
    const target = toasts.value.find((t) => t.id === id)
    if (!target) return
    target.leaving = true
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 350)
  }

  function push(msg: string, icon: ToastIcon = 'check', color: ToastColor = 'indigo'): number {
    const id = seq++
    toasts.value.push({ id, msg, icon, color, leaving: false })
    window.setTimeout(() => dismiss(id), 4200)
    return id
  }

  return { toasts, push, dismiss }
}
