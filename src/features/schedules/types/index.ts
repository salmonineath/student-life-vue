/** Which calendar layout is active. */
export type ScheduleView = 'month' | 'week' | 'day'

/** Category of a schedule event (drives its color). */
export type EventCategory = 'class' | 'study' | 'meeting' | 'exam' | 'personal'

/** A single scheduled event/task on the calendar. */
export interface ScheduleEvent {
  id: number
  title: string
  category: EventCategory
  /** Day it occurs, ISO date string (yyyy-mm-dd). */
  date: string
  /** Start time, 24h 'HH:MM'. */
  start: string
  /** End time, 24h 'HH:MM'. */
  end: string
  /** Optional place / room. */
  location: string
  /** Optional free-text notes. */
  notes: string
  /** Flagged as high-priority. */
  important: boolean
  /** Notify this many minutes before the event, or null for no notification. */
  reminderMinutes: number | null
}

/** Editable fields submitted from the event form. */
export type ScheduleEventDraft = Omit<ScheduleEvent, 'id'>
