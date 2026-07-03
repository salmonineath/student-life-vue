import { onMounted, onUnmounted } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'
import { useToasts } from '@/shared/composables/useToasts'
import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore'
import { formatTime, parseDate, timeToMinutes } from '@/features/schedules/helpers'
import type { ScheduleEvent } from '@/features/schedules/types'

const CHECK_INTERVAL_MS = 30_000

/**
 * Frontend-only reminder engine (the backend has no notification scheduling
 * yet). While the app is open it polls the schedule store and, when an event
 * enters its reminder window (start − reminderMinutes), fires a toast and adds
 * an entry to the notification center.
 *
 * Fired reminders are remembered in localStorage so a reload inside the
 * window doesn't notify twice; editing an event's time or reminder re-arms it
 * because the key encodes both.
 */
export function useEventReminders(): void {
  const schedule = useScheduleStore()
  const notifications = useNotificationStore()
  const { push } = useToasts()

  /** Identity of one scheduled firing. */
  function keyOf(e: ScheduleEvent): string {
    return `${e.id}|${e.date}|${e.start}|${e.reminderMinutes}`
  }

  function loadFired(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.firedReminders) ?? '{}')
    } catch {
      return {}
    }
  }

  function saveFired(fired: Record<string, number>): void {
    // Prune entries for events that started more than a day ago.
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const kept = Object.fromEntries(Object.entries(fired).filter(([, ts]) => ts > cutoff))
    localStorage.setItem(STORAGE_KEYS.firedReminders, JSON.stringify(kept))
  }

  function startOf(e: ScheduleEvent): number {
    return parseDate(e.date).getTime() + timeToMinutes(e.start) * 60_000
  }

  function check(): void {
    const now = Date.now()
    const fired = loadFired()
    let dirty = false

    for (const e of schedule.events) {
      if (e.reminderMinutes === null) continue
      const startMs = startOf(e)
      const fireAt = startMs - e.reminderMinutes * 60_000
      const key = keyOf(e)
      if (now < fireAt || now >= startMs || fired[key]) continue

      const time = formatTime(e.start)
      push(`Reminder: <b>${e.title}</b> starts at ${time}.`, 'alarm', 'amber')
      notifications.add({
        id: `reminder-${key}`,
        title: `Reminder: ${e.title}`,
        message: `Starts at ${time}${e.location ? ` · ${e.location}` : ''}`,
        read: false,
        createdAt: new Date().toISOString(),
      })

      fired[key] = startMs
      dirty = true
    }

    if (dirty) saveFired(fired)
  }

  let timer: number | undefined

  onMounted(() => {
    check()
    timer = window.setInterval(check, CHECK_INTERVAL_MS)
  })

  onUnmounted(() => {
    window.clearInterval(timer)
  })
}
