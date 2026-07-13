import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'
import type {
  EventCategory,
  ScheduleEvent,
  ScheduleEventDraft,
  ScheduleView,
} from '@/features/schedules/types'
import {
  addDays,
  addMonths,
  isSameDay,
  parseDate,
  startOfWeek,
  timeToMinutes,
  toISO,
  today,
  weekDates,
} from '@/features/schedules/helpers'

/** Seed a demo week around today so the calendar isn't empty on first load. */
function seed(): ScheduleEvent[] {
  const monday = addDays(startOfWeek(today()), 1)
  const day = (offset: number) => toISO(addDays(monday, offset))
  let id = 1
  const ev = (
    title: string,
    category: EventCategory,
    offset: number,
    start: string,
    end: string,
    extra: Partial<ScheduleEvent> = {},
  ): ScheduleEvent => ({
    id: id++,
    title,
    category,
    date: day(offset),
    start,
    end,
    location: '',
    notes: '',
    important: false,
    reminderMinutes: null,
    ...extra,
  })

  return [
    ev('Data Structures Lecture', 'class', 0, '08:00', '09:30', { location: 'Room B204' }),
    ev('Study group — Algorithms', 'study', 0, '10:00', '11:30'),
    ev('Project standup', 'meeting', 1, '09:00', '09:45', { location: 'Online' }),
    ev('UX Design Workshop', 'class', 1, '13:00', '15:00', { location: 'Lab 3' }),
    ev('Database midterm', 'exam', 2, '09:30', '11:00', {
      important: true,
      location: 'Hall A',
      reminderMinutes: 30,
    }),
    ev('Gym', 'personal', 2, '17:00', '18:00'),
    ev('Marketing Lecture', 'class', 3, '08:15', '09:45', { location: 'Room C101' }),
    ev('Thesis advisor meeting', 'meeting', 3, '14:00', '14:45', { important: true }),
    ev('Library deep work', 'study', 4, '10:00', '12:30'),
    ev('Group presentation', 'meeting', 4, '15:00', '16:00', { important: true }),
  ]
}

/**
 * Schedule store.
 *
 * Holds the student's events plus the active view/focus date. Persisted so
 * created events and the chosen layout survive a reload — matching the
 * assignment store's pattern.
 */
export const useScheduleStore = defineStore(
  'schedules',
  () => {
    // --- State ---
    const events = ref<ScheduleEvent[]>(seed())
    const view = ref<ScheduleView>('week')
    /** Focused date (drives which week/day/month is shown). */
    const focusISO = ref<string>(toISO(today()))

    function nextId(): number {
      return events.value.reduce((max, e) => Math.max(max, e.id), 0) + 1
    }

    // --- Getters ---
    const focusDate = computed(() => parseDate(focusISO.value))

    const visibleWeek = computed(() => weekDates(focusDate.value))

    function eventsOnDay(d: Date): ScheduleEvent[] {
      const iso = toISO(d)
      return events.value
        .filter((e) => e.date === iso)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    }

    /** Next upcoming event from now (today onward). */
    const upcoming = computed<ScheduleEvent | null>(() => {
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const todayD = today()
      const future = events.value
        .filter((e) => {
          const d = parseDate(e.date)
          if (d > todayD) return true
          // Today's events still count as "upcoming" until they actually end,
          // not just until they start (so an in-progress event still shows).
          if (isSameDay(d, todayD)) return timeToMinutes(e.end) >= nowMin
          return false
        })
        .sort(
          (a, b) =>
            parseDate(a.date).getTime() - parseDate(b.date).getTime() ||
            timeToMinutes(a.start) - timeToMinutes(b.start),
        )
      return future[0] ?? null
    })

    /** Total minutes booked per category this visible week (for the breakdown). */
    const weekBreakdown = computed<{ category: EventCategory; minutes: number }[]>(() => {
      const week = visibleWeek.value.map(toISO)
      const totals = new Map<EventCategory, number>()
      for (const e of events.value) {
        if (!week.includes(e.date)) continue
        const mins = timeToMinutes(e.end) - timeToMinutes(e.start)
        totals.set(e.category, (totals.get(e.category) ?? 0) + Math.max(mins, 0))
      }
      return [...totals.entries()]
        .map(([category, minutes]) => ({ category, minutes }))
        .sort((a, b) => b.minutes - a.minutes)
    })

    // --- Navigation ---
    function setView(v: ScheduleView): void {
      view.value = v
    }
    function goToday(): void {
      focusISO.value = toISO(today())
    }
    function selectDate(d: Date): void {
      focusISO.value = toISO(d)
    }
    function step(dir: number): void {
      const d = focusDate.value
      if (view.value === 'day') focusISO.value = toISO(addDays(d, dir))
      else if (view.value === 'week') focusISO.value = toISO(addDays(d, dir * 7))
      else focusISO.value = toISO(addMonths(d, dir))
    }

    // --- CRUD ---
    function create(draft: ScheduleEventDraft): void {
      events.value.push({ id: nextId(), ...draft })
    }
    function update(id: number, draft: ScheduleEventDraft): void {
      const e = events.value.find((x) => x.id === id)
      if (e) Object.assign(e, draft)
    }
    function remove(id: number): void {
      events.value = events.value.filter((e) => e.id !== id)
    }
    function toggleImportant(id: number): void {
      const e = events.value.find((x) => x.id === id)
      if (e) e.important = !e.important
    }
    function find(id: number): ScheduleEvent | undefined {
      return events.value.find((e) => e.id === id)
    }

    return {
      events,
      view,
      focusISO,
      focusDate,
      visibleWeek,
      upcoming,
      weekBreakdown,
      eventsOnDay,
      setView,
      goToday,
      selectDate,
      step,
      create,
      update,
      remove,
      toggleImportant,
      find,
    }
  },
  {
    persist: {
      key: STORAGE_KEYS.schedules,
      pick: ['events', 'view'],
      // Backfill fields added after a user's data was first persisted.
      afterHydrate: (ctx) => {
        const events = (ctx.store.events ?? []) as ScheduleEvent[]
        events.forEach((e) => {
          if (e.reminderMinutes === undefined) e.reminderMinutes = null
        })
      },
    },
  },
)
