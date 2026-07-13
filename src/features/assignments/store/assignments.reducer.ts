import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'
import { daysLeft, statusOf } from '@/features/assignments/helpers'
import type {
  Assignment,
  AssignmentDraft,
  AssignmentFilter,
  AssignmentTask,
  ChecklistItem,
  Member,
  TaskAttachment,
} from '@/features/assignments/types'

export interface AssignmentStats {
  total: number
  done: number
  overdue: number
  avgProgress: number
}

export const useAssignmentStore = defineStore(
  'assignments',
  () => {
    // ── State ──────────────────────────────────────────────────────────
    const assignments = ref<Assignment[]>([])
    const current = ref<Assignment | null>(null)
    const members = ref<Member[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref('')
    const filter = ref<AssignmentFilter>('all')
    const pagination = ref({ page: 0, totalPages: 0, totalElements: 0 })

    // ── Computed ───────────────────────────────────────────────────────
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

    // ── Lookup helpers ─────────────────────────────────────────────────
    function find(id: number): Assignment | undefined {
      if (current.value?.id === id) return current.value
      return assignments.value.find((a) => a.id === id)
    }

    function findTask(assignmentId: number, taskId: number): AssignmentTask | undefined {
      return find(assignmentId)?.tasks.find((t) => t.id === taskId)
    }

    // ── Private helper ─────────────────────────────────────────────────
    // Recomputes progress/completed after any task mutation. If the
    // assignment has tasks, their done-ratio is the source of truth for
    // progress (overrides whatever was set manually). If it has no tasks,
    // progress is left as-is (driven only by toggleComplete/create/update).
    function syncProgress(a: Assignment): void {
      if (a.tasks.length) {
        const done = a.tasks.filter((t) => t.status === 'done').length
        a.progress = Math.round((done / a.tasks.length) * 100)
      }
      a.completed = a.progress >= 100
      // `a` may be `current` (the detail-page copy); mirror the derived
      // fields into the list entry too so the list view stays in sync
      // without needing a full refetch.
      const idx = assignments.value.findIndex((x) => x.id === a.id)
      if (idx >= 0) {
        assignments.value[idx] = {
          ...assignments.value[idx],
          progress: a.progress,
          completed: a.completed,
        }
      }
    }

    // ── Sync mutations used by actions ─────────────────────────────────
    function setLoading(val: boolean): void { loading.value = val }
    function setError(msg: string | null): void { error.value = msg }
    function setSearch(q: string): void { search.value = q }
    function setFilter(f: AssignmentFilter): void { filter.value = f }

    function setAssignments(list: Assignment[]): void { assignments.value = list }
    function setCurrent(a: Assignment | null): void { current.value = a }
    function setMembers(list: Member[]): void { members.value = list }
    function setPagination(p: { page: number; totalPages: number; totalElements: number }): void {
      pagination.value = p
    }

    // `a` here comes from list/create/update API responses, which don't
    // include tasks/invites (see mapAssignment vs mapAssignmentDetail) — so
    // both branches below splice the incoming fields in while keeping
    // whatever tasks/invites were already loaded, instead of wiping them out.
    function upsertAssignment(a: Assignment): void {
      const idx = assignments.value.findIndex((x) => x.id === a.id)
      if (idx >= 0) {
        // Preserve tasks already loaded in the list entry.
        assignments.value[idx] = { ...a, tasks: assignments.value[idx].tasks }
      } else {
        assignments.value.unshift(a)
      }
      // Keep current in sync without stomping its tasks/invites.
      if (current.value?.id === a.id) {
        current.value = { ...a, tasks: current.value.tasks, invites: current.value.invites }
      }
    }

    function removeAssignment(id: number): void {
      assignments.value = assignments.value.filter((a) => a.id !== id)
      if (current.value?.id === id) current.value = null
    }

    function upsertTask(task: AssignmentTask): void {
      if (!current.value) return
      const idx = current.value.tasks.findIndex((t) => t.id === task.id)
      if (idx >= 0) {
        current.value.tasks[idx] = task
      } else {
        current.value.tasks.push(task)
      }
      syncProgress(current.value)
    }

    function removeTask(taskId: number): void {
      if (!current.value) return
      current.value.tasks = current.value.tasks.filter((t) => t.id !== taskId)
      syncProgress(current.value)
    }

    function setTasks(tasks: AssignmentTask[]): void {
      if (current.value) {
        current.value.tasks = tasks
        syncProgress(current.value)
      }
    }

    function upsertChecklistItem(taskId: number, item: ChecklistItem): void {
      const t = current.value?.tasks.find((x) => x.id === taskId)
      if (!t) return
      const idx = t.checklist.findIndex((c) => c.id === item.id)
      if (idx >= 0) {
        t.checklist[idx] = item
      } else {
        t.checklist.push(item)
      }
    }

    function removeChecklistItem(taskId: number, itemId: number): void {
      const t = current.value?.tasks.find((x) => x.id === taskId)
      if (t) t.checklist = t.checklist.filter((c) => c.id !== itemId)
    }

    function upsertAttachment(taskId: number, attachment: TaskAttachment): void {
      const t = current.value?.tasks.find((x) => x.id === taskId)
      if (!t) return
      const idx = t.attachments.findIndex((a) => a.id === attachment.id)
      if (idx >= 0) {
        t.attachments[idx] = attachment
      } else {
        t.attachments.push(attachment)
      }
    }

    function removeAttachment(taskId: number, attachmentId: number): void {
      const t = current.value?.tasks.find((x) => x.id === taskId)
      if (t) t.attachments = t.attachments.filter((a) => a.id !== attachmentId)
    }

    function addPendingInvite(email: string): void {
      if (!current.value) return
      const normalized = email.trim().toLowerCase()
      if (!current.value.invites.includes(normalized)) {
        current.value.invites.push(normalized)
      }
    }

    function removePendingInvite(email: string): void {
      if (current.value) {
        current.value.invites = current.value.invites.filter((e) => e !== email)
      }
    }

    // ── Optimistic local-only helpers (no API call) ────────────────────

    /** Drag-and-drop reorder before the API call. */
    function reorderTask(assignmentId: number, draggedId: number, targetId: number): void {
      const a = find(assignmentId)
      if (!a || draggedId === targetId) return
      const from = a.tasks.findIndex((t) => t.id === draggedId)
      const to = a.tasks.findIndex((t) => t.id === targetId)
      if (from < 0 || to < 0) return
      const [moved] = a.tasks.splice(from, 1)
      a.tasks.splice(to, 0, moved)
    }

    /** Toggle an assignee on a task optimistically. */
    function toggleAssignee(taskId: number, memberId: number): void {
      const t = current.value?.tasks.find((x) => x.id === taskId)
      if (!t) return
      t.assigneeIds = t.assigneeIds.includes(memberId)
        ? t.assigneeIds.filter((id) => id !== memberId)
        : [...t.assigneeIds, memberId]
    }

    /** Bulk-add tasks locally (used by the AI study planner). */
    function addTasksLocally(assignmentId: number, tasks: AssignmentTask[]): void {
      const a = find(assignmentId)
      if (!a) return
      a.tasks.push(...tasks)
      syncProgress(a)
    }

    // ── Legacy local-only mutations (kept for backward compat) ─────────
    // Components that haven't migrated to action functions still work.

    function _nextTaskId(): number {
      return (
        assignments.value.flatMap((a) => a.tasks).reduce((max, t) => Math.max(max, t.id), 0) + 1
      )
    }

    function _makeTask(id: number, title: string, partial: Partial<AssignmentTask> = {}): AssignmentTask {
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

    function addTask(assignmentId: number, title: string): void {
      const a = find(assignmentId)
      const trimmed = title.trim()
      if (!a || !trimmed) return
      a.tasks.push(_makeTask(_nextTaskId(), trimmed))
      syncProgress(a)
    }

    function addTasks(assignmentId: number, titles: string[]): number {
      const a = find(assignmentId)
      if (!a) return 0
      let id = _nextTaskId()
      let added = 0
      for (const title of titles) {
        const trimmed = title.trim()
        if (!trimmed) continue
        a.tasks.push(_makeTask(id++, trimmed))
        added++
      }
      syncProgress(a)
      return added
    }

    function updateTaskLocal(
      assignmentId: number,
      taskId: number,
      patch: Partial<Pick<AssignmentTask, 'title' | 'description'>>,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (t) Object.assign(t, patch)
    }

    function setTaskStatus(
      assignmentId: number,
      taskId: number,
      status: AssignmentTask['status'],
    ): void {
      const a = find(assignmentId)
      const t = a?.tasks.find((x) => x.id === taskId)
      if (!a || !t) return
      t.status = status
      syncProgress(a)
    }

    function toggleTask(assignmentId: number, taskId: number): void {
      const t = findTask(assignmentId, taskId)
      if (t) setTaskStatus(assignmentId, taskId, t.status === 'done' ? 'todo' : 'done')
    }

    function removeTaskLocal(assignmentId: number, taskId: number): void {
      const a = find(assignmentId)
      if (!a) return
      a.tasks = a.tasks.filter((t) => t.id !== taskId)
      syncProgress(a)
    }

    function addChecklistItem(assignmentId: number, taskId: number, text: string): void {
      const t = findTask(assignmentId, taskId)
      const trimmed = text.trim()
      if (!t || !trimmed) return
      const maxId = t.checklist.reduce((max, c) => Math.max(max, c.id), 0)
      t.checklist.push({ id: maxId + 1, text: trimmed, done: false })
    }

    function toggleChecklistItem(
      assignmentId: number,
      taskId: number,
      itemId: number,
    ): void {
      const item = findTask(assignmentId, taskId)?.checklist.find((c) => c.id === itemId)
      if (item) item.done = !item.done
    }

    function removeChecklistItemLocal(
      assignmentId: number,
      taskId: number,
      itemId: number,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (t) t.checklist = t.checklist.filter((c) => c.id !== itemId)
    }

    function addAttachment(
      assignmentId: number,
      taskId: number,
      file: Omit<TaskAttachment, 'id'>,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (!t) return
      const maxId = t.attachments.reduce((max, a) => Math.max(max, a.id), 0)
      t.attachments.push({ id: maxId + 1, ...file })
    }

    function removeAttachmentLocal(
      assignmentId: number,
      taskId: number,
      attachmentId: number,
    ): void {
      const t = findTask(assignmentId, taskId)
      if (t) t.attachments = t.attachments.filter((f) => f.id !== attachmentId)
    }

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

    function create(draft: AssignmentDraft): Assignment {
      const maxId = assignments.value.reduce((max, a) => Math.max(max, a.id), 0)
      const a: Assignment = {
        id: maxId + 1,
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
      syncProgress(a)
    }

    function remove(id: number): void {
      assignments.value = assignments.value.filter((a) => a.id !== id)
      if (current.value?.id === id) current.value = null
    }

    function toggleComplete(id: number): boolean {
      const a = find(id)
      if (!a) return false
      const becomingDone = statusOf(a) !== 'done'
      if (a.tasks.length) {
        // With tasks, "complete" means all tasks done/todo; syncProgress then
        // recomputes the percentage from that.
        a.tasks.forEach((t) => { t.status = becomingDone ? 'done' : 'todo' })
        syncProgress(a)
      } else if (becomingDone) {
        a.completed = true
        a.progress = 100
      } else {
        // Reopening a taskless assignment: drop back to 75% rather than 0%,
        // since going all the way to 0 would look like no work was ever done.
        a.completed = false
        if (a.progress >= 100) a.progress = 75
      }
      return becomingDone
    }

    function applyTaskDraft(
      assignmentId: number,
      taskId: number,
      draft: Pick<AssignmentTask, 'title' | 'description' | 'status' | 'checklist' | 'assigneeIds' | 'attachments'>,
    ): void {
      const a = find(assignmentId)
      const t = a?.tasks.find((x) => x.id === taskId)
      if (!a || !t) return
      let checklistId = t.checklist.reduce((max, c) => Math.max(max, c.id), 0) + 1
      let attachmentId = t.attachments.reduce((max, f) => Math.max(max, f.id), 0) + 1
      t.title = draft.title
      t.description = draft.description
      t.status = draft.status
      // Draft items with id <= 0 are new (not yet persisted), so mint fresh
      // local ids for them; existing items (id > 0) are copied as-is.
      t.checklist = draft.checklist.map((c) => (c.id > 0 ? { ...c } : { ...c, id: checklistId++ }))
      t.assigneeIds = [...draft.assigneeIds]
      t.attachments = draft.attachments.map((f) => (f.id > 0 ? { ...f } : { ...f, id: attachmentId++ }))
      syncProgress(a)
    }

    return {
      // state
      assignments,
      current,
      members,
      loading,
      error,
      search,
      filter,
      pagination,
      // computed
      filtered,
      stats,
      hasAlerts,
      // lookups
      find,
      findTask,
      // api sync mutations
      setLoading,
      setError,
      setSearch,
      setFilter,
      setAssignments,
      setCurrent,
      setMembers,
      setPagination,
      upsertAssignment,
      removeAssignment,
      upsertTask,
      removeTask,
      setTasks,
      upsertChecklistItem,
      removeChecklistItem,
      upsertAttachment,
      removeAttachment,
      addPendingInvite,
      removePendingInvite,
      // optimistic helpers
      reorderTask,
      toggleAssignee,
      addTasksLocally,
      // legacy local-only (for components not yet migrated to action functions)
      create,
      update,
      remove,
      toggleComplete,
      addTask,
      addTasks,
      updateTask: updateTaskLocal,
      setTaskStatus,
      toggleTask,
      removeTaskLocal,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItemLocal,
      addAttachment,
      removeAttachmentLocal,
      addInvite,
      removeInvite,
      applyTaskDraft,
    }
  },
  {
    persist: {
      key: STORAGE_KEYS.assignments,
      pick: ['assignments'],
      // One-time migration run after loading persisted state from storage:
      // upgrades assignments/tasks saved under older shapes of this store
      // (e.g. tasks that used a boolean `done` flag or a single `proof`
      // attachment instead of today's `status`/`attachments[]`) so old
      // localStorage data doesn't break the current app.
      afterHydrate: (ctx) => {
        const list = (ctx.store.assignments ?? []) as Assignment[]
        // Attachment ids must stay unique across the whole persisted store,
        // so seed the counter from the highest id already in use before
        // minting new ones for migrated `proof` fields below.
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
            // Old schema: boolean `done` → new schema: `status` enum.
            if (!legacy.status) legacy.status = legacy.done ? 'done' : 'todo'
            delete legacy.done
            if (typeof t.description !== 'string') t.description = ''
            if (!Array.isArray(t.checklist)) t.checklist = []
            if (!Array.isArray(t.assigneeIds)) t.assigneeIds = []
            if (!Array.isArray(t.attachments)) t.attachments = []
            // Old schema: single `proof` file → new schema: `attachments[]`.
            if (legacy.proof) t.attachments.push({ id: attachmentId++, ...legacy.proof })
            delete legacy.proof
          })
        })
      },
    },
  },
)
