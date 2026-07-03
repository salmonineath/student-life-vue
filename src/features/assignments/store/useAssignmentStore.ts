import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'
import { daysLeft, statusOf } from '@/features/assignments/helpers'
import type {
  Assignment,
  AssignmentDraft,
  AssignmentFilter,
  AssignmentTask,
  TaskAttachment,
} from '@/features/assignments/types'

/** Tallies shown in the four stat pills. */
export interface AssignmentStats {
  total: number
  done: number
  overdue: number
  avgProgress: number
}

/** Build a task with all fields defaulted. */
function makeTask(id: number, title: string, partial: Partial<AssignmentTask> = {}): AssignmentTask {
  return {
    id,
    title,
    description: '',
    status: 'todo',
    attachments: [],
    checklist: [],
    assigneeIds: [],
    ...partial,
  }
}

function seed(): Assignment[] {
  return [
    {
      id: 1,
      title: 'My assignment',
      subject: 'IT',
      desc: 'Something',
      deadline: '2026-06-18',
      progress: 25,
      completed: false,
      invites: ['dara.sok@university.edu'],
      tasks: [
        makeTask(1, 'Gather requirements', {
          status: 'done',
          description: 'Collect the brief, rubric, and any reference material before starting.',
          assigneeIds: [0],
          checklist: [
            { id: 1, text: 'Read the assignment brief', done: true },
            { id: 2, text: 'Note the grading rubric', done: false },
          ],
        }),
        makeTask(2, 'Draft the structure', { status: 'progress', assigneeIds: [0] }),
        makeTask(3, 'Write the content'),
        makeTask(4, 'Review & submit'),
      ],
    },
    {
      id: 2,
      title: 'Algorithms problem set',
      subject: 'CS',
      desc: 'Solve graph traversal exercises 1–8.',
      deadline: '2026-06-14',
      progress: 60,
      completed: false,
      invites: [],
      tasks: [
        makeTask(5, 'Read chapter 4', { status: 'done' }),
        makeTask(6, 'Solve exercises 1–4', { status: 'done' }),
        makeTask(7, 'Solve exercises 5–8', { status: 'done' }),
        makeTask(8, 'Verify complexity analysis'),
        makeTask(9, 'Write up solutions'),
      ],
    },
    {
      id: 3,
      title: 'Marketing case study',
      subject: 'Business',
      desc: 'Analyze the launch campaign and write a 4-page review.',
      deadline: '2026-06-10',
      progress: 40,
      completed: false,
      invites: ['lina.chan@university.edu', 'rin.vibol@university.edu'],
      tasks: [
        makeTask(10, 'Collect campaign data', { status: 'done' }),
        makeTask(11, 'Identify key metrics', { status: 'done' }),
        makeTask(12, 'Draft the analysis'),
        makeTask(13, 'Add recommendations'),
        makeTask(14, 'Proofread & format'),
      ],
    },
    {
      id: 4,
      title: 'Calculus worksheet',
      subject: 'Math',
      desc: 'Integration by parts practice set.',
      deadline: '2026-06-09',
      progress: 100,
      completed: true,
      invites: [],
      tasks: [
        makeTask(15, 'Watch the lecture', { status: 'done' }),
        makeTask(16, 'Complete the worksheet', { status: 'done' }),
        makeTask(17, 'Check answers', { status: 'done' }),
      ],
    },
  ]
}

/**
 * Assignment store.
 *
 * Assignments are consumed by more than one view (the board list and the
 * detail page), so the data lives in Pinia rather than a view-local composable
 * — the same threshold `useNotificationStore` follows. Persisted so a student's
 * tasks, attachments and progress survive a reload.
 */
export const useAssignmentStore = defineStore(
  'assignments',
  () => {
    // --- State ---
    const assignments = ref<Assignment[]>(seed())
    const search = ref('')
    const filter = ref<AssignmentFilter>('all')

    // --- Internal helpers ---
    function nextAssignmentId(): number {
      return assignments.value.reduce((max, a) => Math.max(max, a.id), 0) + 1
    }
    function nextTaskId(): number {
      return (
        assignments.value.flatMap((a) => a.tasks).reduce((max, t) => Math.max(max, t.id), 0) + 1
      )
    }
    function nextChecklistId(): number {
      return (
        assignments.value
          .flatMap((a) => a.tasks)
          .flatMap((t) => t.checklist)
          .reduce((max, c) => Math.max(max, c.id), 0) + 1
      )
    }

    /** Recompute progress from tasks (when any) and sync the completed flag. */
    function recompute(a: Assignment): void {
      if (a.tasks.length) {
        const done = a.tasks.filter((t) => t.status === 'done').length
        a.progress = Math.round((done / a.tasks.length) * 100)
      }
      a.completed = a.progress >= 100
    }

    function findTask(assignmentId: number, taskId: number): AssignmentTask | undefined {
      return find(assignmentId)?.tasks.find((t) => t.id === taskId)
    }

    // --- Getters ---
    const filtered = computed<Assignment[]>(() => {
      const q = search.value.toLowerCase().trim()
      return assignments.value.filter((a) => {
        const st = statusOf(a)
        if (filter.value === 'active' && st === 'done') return false
        if (filter.value === 'done' && st !== 'done') return false
        if (filter.value === 'late' && !(st !== 'done' && daysLeft(a.deadline) < 0)) return false
        if (q && !`${a.title} ${a.subject} ${a.desc}`.toLowerCase().includes(q)) return false
        return true
      })
    })

    const stats = computed<AssignmentStats>(() => {
      const list = assignments.value
      const total = list.length
      const done = list.filter((a) => statusOf(a) === 'done').length
      const overdue = list.filter((a) => statusOf(a) !== 'done' && daysLeft(a.deadline) < 0).length
      const avgProgress = total
        ? Math.round(list.reduce((sum, a) => sum + a.progress, 0) / total)
        : 0
      return { total, done, overdue, avgProgress }
    })

    const hasAlerts = computed(() =>
      assignments.value.some((a) => statusOf(a) !== 'done' && daysLeft(a.deadline) <= 3),
    )

    function find(id: number): Assignment | undefined {
      return assignments.value.find((a) => a.id === id)
    }

    // --- Assignment actions ---
    function create(draft: AssignmentDraft): Assignment {
      const a: Assignment = {
        id: nextAssignmentId(),
        ...draft,
        completed: draft.progress >= 100,
        tasks: [],
      }
      assignments.value.unshift(a)
      return a
    }

    function update(id: number, draft: AssignmentDraft): void {
      const a = find(id)
      if (!a) return
      Object.assign(a, draft)
      recompute(a)
    }

    function remove(id: number): void {
      assignments.value = assignments.value.filter((a) => a.id !== id)
    }

    /** Flip completion. With tasks, marks them all done / not-done. */
    function toggleComplete(id: number): boolean {
      const a = find(id)
      if (!a) return false
      const becomingDone = statusOf(a) !== 'done'
      if (a.tasks.length) {
        a.tasks.forEach((t) => {
          t.status = becomingDone ? 'done' : 'todo'
        })
        recompute(a)
      } else if (becomingDone) {
        a.completed = true
        a.progress = 100
      } else {
        a.completed = false
        if (a.progress >= 100) a.progress = 75
      }
      return becomingDone
    }

    // --- Invite actions ---
    /** Invite an email to the assignment. Returns false on duplicates. */
    function addInvite(assignmentId: number, email: string): boolean {
      const a = find(assignmentId)
      const normalized = email.trim().toLowerCase()
      if (!a || !normalized) return false
      if (a.invites.some((e) => e.toLowerCase() === normalized)) return false
      a.invites.push(normalized)
      return true
    }

    function removeInvite(assignmentId: number, email: string): void {
      const a = find(assignmentId)
      if (a) a.invites = a.invites.filter((e) => e !== email)
    }

    // --- Task actions ---
    function addTask(assignmentId: number, title: string): void {
      const a = find(assignmentId)
      const trimmed = title.trim()
      if (!a || !trimmed) return
      a.tasks.push(makeTask(nextTaskId(), trimmed))
      recompute(a)
    }

    /** Add several tasks at once (e.g. from a generated study plan). */
    function addTasks(assignmentId: number, titles: string[]): number {
      const a = find(assignmentId)
      if (!a) return 0
      let id = nextTaskId()
      let added = 0
      for (const title of titles) {
        const trimmed = title.trim()
        if (!trimmed) continue
        a.tasks.push(makeTask(id++, trimmed))
        added++
      }
      recompute(a)
      return added
    }

    /** Patch a task's title and/or description. */
    function updateTask(
      assignmentId: number,
      taskId: number,
      patch: Partial<Pick<AssignmentTask, 'title' | 'description'>>,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (t) Object.assign(t, patch)
    }

    /** Set a task's workflow status (To do / In progress / Done). */
    function setTaskStatus(assignmentId: number, taskId: number, status: AssignmentTask['status']): void {
      const a = find(assignmentId)
      const t = a?.tasks.find((x) => x.id === taskId)
      if (!a || !t) return
      t.status = status
      recompute(a)
    }

    /** Toggle the checkbox: done ⇄ to-do. */
    function toggleTask(assignmentId: number, taskId: number): void {
      const t = findTask(assignmentId, taskId)
      if (t) setTaskStatus(assignmentId, taskId, t.status === 'done' ? 'todo' : 'done')
    }

    function removeTask(assignmentId: number, taskId: number): void {
      const a = find(assignmentId)
      if (!a) return
      a.tasks = a.tasks.filter((t) => t.id !== taskId)
      recompute(a)
    }

    /** Reorder by moving the dragged task to the target task's position. */
    function reorderTask(assignmentId: number, draggedId: number, targetId: number): void {
      const a = find(assignmentId)
      if (!a || draggedId === targetId) return
      const from = a.tasks.findIndex((t) => t.id === draggedId)
      const to = a.tasks.findIndex((t) => t.id === targetId)
      if (from < 0 || to < 0) return
      const [moved] = a.tasks.splice(from, 1)
      a.tasks.splice(to, 0, moved)
    }

    /** Attach a file to a task. Purely informational — no status side effects. */
    function addAttachment(
      assignmentId: number,
      taskId: number,
      file: Omit<TaskAttachment, 'id'>,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (!t) return
      const nextId =
        assignments.value
          .flatMap((a) => a.tasks)
          .flatMap((x) => x.attachments)
          .reduce((max, f) => Math.max(max, f.id), 0) + 1
      t.attachments.push({ id: nextId, ...file })
    }

    function removeAttachment(assignmentId: number, taskId: number, attachmentId: number): void {
      const t = findTask(assignmentId, taskId)
      if (t) t.attachments = t.attachments.filter((f) => f.id !== attachmentId)
    }

    // --- Checklist actions ---
    function addChecklistItem(assignmentId: number, taskId: number, text: string): void {
      const t = findTask(assignmentId, taskId)
      const trimmed = text.trim()
      if (t && trimmed) t.checklist.push({ id: nextChecklistId(), text: trimmed, done: false })
    }

    function toggleChecklistItem(assignmentId: number, taskId: number, itemId: number): void {
      const item = findTask(assignmentId, taskId)?.checklist.find((c) => c.id === itemId)
      if (item) item.done = !item.done
    }

    function removeChecklistItem(assignmentId: number, taskId: number, itemId: number): void {
      const t = findTask(assignmentId, taskId)
      if (t) t.checklist = t.checklist.filter((c) => c.id !== itemId)
    }

    // --- Assignee actions ---
    function toggleAssignee(assignmentId: number, taskId: number, memberId: number): void {
      const t = findTask(assignmentId, taskId)
      if (!t) return
      t.assigneeIds = t.assigneeIds.includes(memberId)
        ? t.assigneeIds.filter((id) => id !== memberId)
        : [...t.assigneeIds, memberId]
    }

    return {
      assignments,
      search,
      filter,
      filtered,
      stats,
      hasAlerts,
      find,
      findTask,
      create,
      update,
      remove,
      toggleComplete,
      addInvite,
      removeInvite,
      addTask,
      addTasks,
      updateTask,
      setTaskStatus,
      toggleTask,
      removeTask,
      reorderTask,
      addAttachment,
      removeAttachment,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
      toggleAssignee,
    }
  },
  {
    persist: {
      key: STORAGE_KEYS.assignments,
      pick: ['assignments'],
      // Backfill fields added after a user's data was first persisted.
      afterHydrate: (ctx) => {
        const list = (ctx.store.assignments ?? []) as Assignment[]
        let attachmentId =
          list
            .flatMap((a) => a.tasks ?? [])
            .flatMap((t) => t.attachments ?? [])
            .reduce((max, f) => Math.max(max, f.id), 0) + 1
        list.forEach((a) => {
          if (!Array.isArray(a.invites)) a.invites = []
          delete (a as Assignment & { memberIds?: number[] }).memberIds
          a.tasks?.forEach((t) => {
            const legacy = t as AssignmentTask & {
              done?: boolean
              proof?: { name: string; size: number; uploadedAt: string } | null
            }
            if (!legacy.status) legacy.status = legacy.done ? 'done' : 'todo'
            delete legacy.done
            if (typeof t.description !== 'string') t.description = ''
            if (!Array.isArray(t.checklist)) t.checklist = []
            if (!Array.isArray(t.assigneeIds)) t.assigneeIds = []
            if (!Array.isArray(t.attachments)) t.attachments = []
            // Migrate the old single "proof" file into the attachments list.
            if (legacy.proof) t.attachments.push({ id: attachmentId++, ...legacy.proof })
            delete legacy.proof
          })
        })
      },
    },
  },
)
