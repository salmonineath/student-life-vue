import { useAssignmentStore } from './assignments.reducer'
import { assignmentsRequest } from '../api/assignments.request'
import type { ApiAssignment, ApiAssignmentDetail, ApiTask, ApiChecklistItem, ApiAttachment, ApiMember } from '../api/assignments.request'
import type { Assignment, AssignmentDraft, AssignmentTask, ChecklistItem, Member, TaskAttachment, TaskStatus } from '@/features/assignments/types'

// ── Mapping: API shapes → frontend shapes ─────────────────────────────

function mapAttachment(r: ApiAttachment): TaskAttachment {
  return { id: r.id, name: r.name, size: r.size, uploadedAt: r.uploadedAt, url: r.url }
}

function mapChecklistItem(r: ApiChecklistItem): ChecklistItem {
  return { id: r.id, text: r.text, done: r.done }
}

function mapTask(r: ApiTask): AssignmentTask {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    status: r.status,
    assigneeIds: r.assigneeIds ?? [],
    checklist: (r.checklist ?? []).map(mapChecklistItem),
    attachments: (r.attachments ?? []).map(mapAttachment),
  }
}

function mapAssignment(r: ApiAssignment): Assignment {
  return {
    id: r.id,
    title: r.title,
    subject: r.subject ?? '',
    desc: r.description ?? '',
    // Backend sends a full ISO datetime; the frontend model only stores the
    // yyyy-mm-dd date part (see Assignment['deadline']).
    deadline: r.dueDate.split('T')[0],
    progress: r.progress,
    completed: r.completed,
    // List/summary responses don't include tasks/invites — callers that need
    // them use upsertAssignment, which merges these in from already-loaded
    // state instead of wiping them.
    invites: [],
    tasks: [],
  }
}

function mapAssignmentDetail(r: ApiAssignmentDetail): Assignment {
  return {
    ...mapAssignment(r),
    invites: r.invites ?? [],
    tasks: (r.tasks ?? []).map(mapTask),
  }
}

function mapMember(r: ApiMember): Member {
  return { id: r.id, name: r.name, initials: r.initials, color: r.color }
}

function toApiBody(draft: AssignmentDraft) {
  return {
    title: draft.title,
    subject: draft.subject || undefined,
    description: draft.desc || undefined,
    // The form gives a plain yyyy-mm-dd date; pad it to a full ISO datetime
    // for the backend unless it's already one (defensive — shouldn't happen
    // given the current form, but avoids double-appending if it ever does).
    dueDate: draft.deadline.includes('T') ? draft.deadline : `${draft.deadline}T00:00:00Z`,
  }
}

// ── Assignment actions ─────────────────────────────────────────────────

export async function fetchAssignmentsAction(page = 0): Promise<void> {
  const store = useAssignmentStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const page_data = await assignmentsRequest.list(page)
    store.setAssignments(page_data.content.map(mapAssignment))
    store.setPagination({
      page: page_data.number,
      totalPages: page_data.totalPages,
      totalElements: page_data.totalElements,
    })
  } catch {
    store.setError('Failed to load assignments.')
    throw new Error('Failed to load assignments.')
  } finally {
    store.setLoading(false)
  }
}

export async function fetchAssignmentAction(id: number): Promise<void> {
  const store = useAssignmentStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const data = await assignmentsRequest.getOne(id)
    store.setCurrent(mapAssignmentDetail(data))
  } catch {
    store.setError('Failed to load assignment.')
    throw new Error('Failed to load assignment.')
  } finally {
    store.setLoading(false)
  }
}

export async function createAssignmentAction(draft: AssignmentDraft): Promise<Assignment> {
  const store = useAssignmentStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const data = await assignmentsRequest.create(toApiBody(draft))
    const assignment = mapAssignment(data)
    store.upsertAssignment(assignment)
    return assignment
  } catch {
    store.setError('Failed to create assignment.')
    throw new Error('Failed to create assignment.')
  } finally {
    store.setLoading(false)
  }
}

export async function updateAssignmentAction(id: number, draft: AssignmentDraft): Promise<void> {
  const store = useAssignmentStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const data = await assignmentsRequest.update(id, toApiBody(draft))
    store.upsertAssignment(mapAssignment(data))
  } catch {
    store.setError('Failed to update assignment.')
    throw new Error('Failed to update assignment.')
  } finally {
    store.setLoading(false)
  }
}

export async function removeAssignmentAction(id: number): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.remove(id)
    store.removeAssignment(id)
  } catch {
    store.setError('Failed to delete assignment.')
    throw new Error('Failed to delete assignment.')
  }
}

export async function toggleCompleteAction(id: number): Promise<void> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.toggleComplete(id)
    store.upsertAssignment(mapAssignment(data))
  } catch {
    store.setError('Failed to toggle completion.')
    throw new Error('Failed to toggle completion.')
  }
}

// ── Task actions ───────────────────────────────────────────────────────

export async function createTaskAction(assignmentId: number, title: string): Promise<AssignmentTask> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.createTask(assignmentId, { title })
    const task = mapTask(data)
    store.upsertTask(task)
    return task
  } catch {
    store.setError('Failed to create task.')
    throw new Error('Failed to create task.')
  }
}

export async function updateTaskAction(
  taskId: number,
  patch: { title: string; description?: string; assigneeIds?: number[] },
): Promise<void> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.updateTask(taskId, patch)
    store.upsertTask(mapTask(data))
  } catch {
    store.setError('Failed to update task.')
    throw new Error('Failed to update task.')
  }
}

export async function removeTaskAction(taskId: number): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.removeTask(taskId)
    store.removeTask(taskId)
  } catch {
    store.setError('Failed to remove task.')
    throw new Error('Failed to remove task.')
  }
}

export async function setTaskStatusAction(
  taskId: number,
  status: TaskStatus,
): Promise<void> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.setTaskStatus(taskId, status)
    store.upsertTask(mapTask(data))
  } catch {
    store.setError('Failed to update task status.')
    throw new Error('Failed to update task status.')
  }
}

export async function reorderTasksAction(
  assignmentId: number,
  orderedIds: number[],
): Promise<void> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.reorderTasks(assignmentId, orderedIds)
    store.setTasks(data.map(mapTask))
  } catch {
    store.setError('Failed to reorder tasks.')
    throw new Error('Failed to reorder tasks.')
  }
}

// ── Checklist actions ──────────────────────────────────────────────────

export async function addChecklistItemAction(taskId: number, text: string): Promise<ChecklistItem> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.addChecklistItem(taskId, text)
    const item = mapChecklistItem(data)
    store.upsertChecklistItem(taskId, item)
    return item
  } catch {
    store.setError('Failed to add checklist item.')
    throw new Error('Failed to add checklist item.')
  }
}

export async function toggleChecklistItemAction(
  taskId: number,
  itemId: number,
  done: boolean,
): Promise<void> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.toggleChecklistItem(itemId, done)
    store.upsertChecklistItem(taskId, mapChecklistItem(data))
  } catch {
    store.setError('Failed to toggle checklist item.')
    throw new Error('Failed to toggle checklist item.')
  }
}

export async function removeChecklistItemAction(taskId: number, itemId: number): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.removeChecklistItem(itemId)
    store.removeChecklistItem(taskId, itemId)
  } catch {
    store.setError('Failed to remove checklist item.')
    throw new Error('Failed to remove checklist item.')
  }
}

// ── Attachment actions ─────────────────────────────────────────────────

export async function uploadAttachmentAction(taskId: number, file: File): Promise<TaskAttachment> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.uploadAttachment(taskId, file)
    const attachment = mapAttachment(data)
    store.upsertAttachment(taskId, attachment)
    return attachment
  } catch {
    store.setError('Failed to upload attachment.')
    throw new Error('Failed to upload attachment.')
  }
}

export async function removeAttachmentAction(taskId: number, attachmentId: number): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.removeAttachment(attachmentId)
    store.removeAttachment(taskId, attachmentId)
  } catch {
    store.setError('Failed to remove attachment.')
    throw new Error('Failed to remove attachment.')
  }
}

// ── Invite & Member actions ────────────────────────────────────────────

export async function sendInviteAction(assignmentId: number, email: string): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.sendInvite(assignmentId, email)
    store.addPendingInvite(email)
  } catch {
    store.setError('Failed to send invite.')
    throw new Error('Failed to send invite.')
  }
}

export async function revokeInviteAction(assignmentId: number, email: string): Promise<void> {
  const store = useAssignmentStore()
  try {
    await assignmentsRequest.revokeInvite(assignmentId, email)
    store.removePendingInvite(email)
  } catch {
    store.setError('Failed to revoke invite.')
    throw new Error('Failed to revoke invite.')
  }
}

export async function fetchMembersAction(assignmentId: number): Promise<Member[]> {
  const store = useAssignmentStore()
  try {
    const data = await assignmentsRequest.getMembers(assignmentId)
    const list = data.map(mapMember)
    store.setMembers(list)
    return list
  } catch {
    store.setError('Failed to load members.')
    throw new Error('Failed to load members.')
  }
}

// ── User search (invite autocomplete) ─────────────────────────────────

export async function searchUsersAction(email: string): Promise<Member[]> {
  try {
    const data = await assignmentsRequest.searchUsers(email)
    return data.map(mapMember)
  } catch {
    return []
  }
}
