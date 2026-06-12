import type { Assignment, AssignmentStatus, SubjectAccent, TaskStatus } from './types'

/** Parse an ISO date (yyyy-mm-dd) into a local Date at midnight. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Today at local midnight (so day math ignores the clock time). */
export function today(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Whole days from today until the given deadline (negative = overdue). */
export function daysLeft(iso: string): number {
  return Math.round((parseDate(iso).getTime() - today().getTime()) / 86_400_000)
}

/** Kanban column an assignment belongs to, derived from its state. */
export function statusOf(a: Assignment): AssignmentStatus {
  if (a.completed || a.progress >= 100) return 'done'
  if (a.progress > 0) return 'progress'
  return 'todo'
}

/** Friendly deadline label, e.g. "Jun 18, 2026". */
export function formatDeadline(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const SUBJECT_COLORS: Record<string, SubjectAccent> = {
  IT: 'indigo',
  CS: 'indigo',
  Math: 'emerald',
  Business: 'amber',
  Science: 'emerald',
  English: 'danger',
  Design: 'indigo',
}

/** Brand accent for a subject tag (defaults to indigo). */
export function subjectAccent(subject: string): SubjectAccent {
  return SUBJECT_COLORS[subject] ?? 'indigo'
}

/** Hex value backing a subject accent (for the card's left bar). */
export const ACCENT_HEX: Record<SubjectAccent, string> = {
  indigo: '#4F46E5',
  emerald: '#10B981',
  amber: '#F59E0B',
  danger: '#EF4444',
}

/** Display metadata for each task status (label + colors). */
export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; activeClass: string; dot: string }
> = {
  todo: { label: 'To do', activeClass: 'bg-bg border border-border text-ink', dot: '#94A3B8' },
  progress: { label: 'In progress', activeClass: 'bg-amber text-white border border-amber', dot: '#F59E0B' },
  done: { label: 'Done', activeClass: 'bg-emerald text-white border border-emerald', dot: '#10B981' },
}

/** Task statuses in workflow order. */
export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'progress', 'done']

/** Human-readable file size, e.g. "12.4 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
