/** App-wide constants shared across features. */

export const APP_NAME = 'Student Life'

/**
 * localStorage keys used by persisted Pinia stores. Centralized so the
 * persistence layer and any direct readers stay in sync.
 */
export const STORAGE_KEYS = {
  auth: 'sl.auth',
  app: 'sl.app',
  assignments: 'sl.assignments',
  schedules: 'sl.schedules',
  /** Reminder keys that already fired, so reloads don't re-notify. */
  firedReminders: 'sl.fired-reminders',
} as const
