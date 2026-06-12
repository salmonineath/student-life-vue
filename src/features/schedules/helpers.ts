import type { EventCategory, ScheduleEvent } from './types'

/* ---------------- Time grid bounds ---------------- */
export const START_HOUR = 7
export const END_HOUR = 21
export const HOUR_PX = 56
/** Hour labels rendered down the left gutter. */
export const HOURS: number[] = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i,
)

/* ---------------- Date helpers ---------------- */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** ISO yyyy-mm-dd for a local Date. */
export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export function todayISO(): string {
  return toISO(today())
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

/** Sunday-based start of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay())
}

/** The 7 dates (Sun→Sat) of the week containing `d`. */
export function weekDates(d: Date): Date[] {
  const start = startOfWeek(d)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/**
 * The 42 dates (6 weeks, Sun→Sat) covering the month of `d`, including
 * trailing/leading days from adjacent months.
 */
export function monthGridDates(d: Date): Date[] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(d: Date): boolean {
  return isSameDay(d, today())
}

/* ---------------- Time helpers ---------------- */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Format 'HH:MM' (24h) into a friendly 'h:MM AM' label. */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${`${m}`.padStart(2, '0')} ${period}`
}

/** Hour-gutter label, e.g. "07:00". */
export function formatHourLabel(h: number): string {
  return `${`${h}`.padStart(2, '0')}:00`
}

/* ---------------- Formatting ---------------- */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/* ---------------- Category styling ---------------- */
export interface CategoryMeta {
  label: string
  /** Solid accent (dot / left bar). */
  dot: string
  /** Tailwind classes for chips & blocks (literal so the scanner sees them). */
  block: string
  /** Bar/legend color. */
  bar: string
}

export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  class: {
    label: 'Class',
    dot: '#4F46E5',
    block: 'bg-indigo/10 border-indigo/30 text-indigo-ink',
    bar: '#4F46E5',
  },
  study: {
    label: 'Study',
    dot: '#10B981',
    block: 'bg-emerald/10 border-emerald/30 text-emerald-ink',
    bar: '#10B981',
  },
  meeting: {
    label: 'Meeting',
    dot: '#F59E0B',
    block: 'bg-amber/15 border-amber/30 text-amber-ink',
    bar: '#F59E0B',
  },
  exam: {
    label: 'Exam',
    dot: '#EF4444',
    block: 'bg-danger/10 border-danger/30 text-danger-ink',
    bar: '#EF4444',
  },
  personal: {
    label: 'Personal',
    dot: '#64748B',
    block: 'bg-bg border-border text-muted',
    bar: '#64748B',
  },
}

export const CATEGORY_ORDER: EventCategory[] = ['class', 'study', 'meeting', 'exam', 'personal']

/* ---------------- Overlap layout ---------------- */
export interface LaidOutEvent {
  event: ScheduleEvent
  /** Column index within its overlap cluster. */
  lane: number
  /** Number of columns in the cluster. */
  lanes: number
}

/**
 * Assign side-by-side lanes to overlapping events so they don't cover each
 * other. Greedy interval partitioning within clusters of mutual overlap.
 */
export function layoutDayEvents(events: ScheduleEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start) || timeToMinutes(a.end) - timeToMinutes(b.end),
  )
  const out: LaidOutEvent[] = []
  let cluster: ScheduleEvent[] = []
  let clusterEnd = -1

  const flush = () => {
    const colEnds: number[] = []
    const cols = new Map<number, number>()
    for (const ev of cluster) {
      const s = timeToMinutes(ev.start)
      let placed = -1
      for (let i = 0; i < colEnds.length; i++) {
        if (s >= colEnds[i]) {
          placed = i
          break
        }
      }
      if (placed === -1) {
        placed = colEnds.length
        colEnds.push(0)
      }
      colEnds[placed] = timeToMinutes(ev.end)
      cols.set(ev.id, placed)
    }
    const lanes = colEnds.length
    for (const ev of cluster) out.push({ event: ev, lane: cols.get(ev.id) ?? 0, lanes })
    cluster = []
  }

  for (const ev of sorted) {
    if (cluster.length && timeToMinutes(ev.start) >= clusterEnd) {
      flush()
      clusterEnd = -1
    }
    cluster.push(ev)
    clusterEnd = Math.max(clusterEnd, timeToMinutes(ev.end))
  }
  flush()
  return out
}
