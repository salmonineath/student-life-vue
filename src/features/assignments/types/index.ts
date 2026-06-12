/** Kanban-style status an assignment falls into, derived from its progress. */
export type AssignmentStatus = 'todo' | 'progress' | 'done'

/** Active toolbar filter. */
export type AssignmentFilter = 'all' | 'active' | 'done' | 'late'

/** Metadata for a proof-of-research file a student uploads against a task. */
export interface TaskProof {
  /** Original file name. */
  name: string
  /** File size in bytes. */
  size: number
  /** ISO timestamp of when it was uploaded. */
  uploadedAt: string
}

/** A single checklist item inside a task (Trello-style sub-steps). */
export interface ChecklistItem {
  id: number
  text: string
  done: boolean
}

/** Workflow status of a single task. */
export type TaskStatus = 'todo' | 'progress' | 'done'

/** A person a task can be assigned to (self or a teammate). */
export interface Member {
  id: number
  name: string
  /** Initials shown in the avatar. */
  initials: string
  /** Avatar background color (hex). */
  color: string
}

/**
 * A single actionable task within an assignment. Completing a task (by
 * uploading proof, or ticking it off) drives the assignment's progress.
 */
export interface AssignmentTask {
  id: number
  title: string
  /** Longer notes shown in the task popup. */
  description: string
  /** Workflow status: To do → In progress → Done. */
  status: TaskStatus
  /** Uploaded proof of research, or null if none submitted yet. */
  proof: TaskProof | null
  /** Sub-steps tracked within the task. */
  checklist: ChecklistItem[]
  /** Ids of the members this task is assigned to. */
  assigneeIds: number[]
}

/** A single assignment shown in the list and on the detail page. */
export interface Assignment {
  id: number
  title: string
  /** Short course/subject tag, e.g. "IT". Defaults to "General". */
  subject: string
  /** Free-text description (optional). */
  desc: string
  /** Deadline as an ISO date string (yyyy-mm-dd). */
  deadline: string
  /**
   * Completion percentage (0–100). Derived from `tasks` when any exist,
   * otherwise set manually via the form's slider.
   */
  progress: number
  /** Explicitly marked complete (also implied by progress >= 100). */
  completed: boolean
  /** Breakdown of work; completing these auto-updates `progress`. */
  tasks: AssignmentTask[]
}

/** Editable fields submitted from the create/edit modal. */
export type AssignmentDraft = Omit<Assignment, 'id' | 'completed' | 'tasks'>

/** Brand accent keyed off the subject tag. */
export type SubjectAccent = 'indigo' | 'emerald' | 'amber' | 'danger'
