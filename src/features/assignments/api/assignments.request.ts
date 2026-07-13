import { apiClient } from '@/api/client'
import type { ApiEnvelope } from '@/features/auth/types'
import type { PaginatedData, TaskStatus } from '@/features/assignments/types'

// ── API response shapes (backend naming conventions) ──────────────────

export interface ApiAssignment {
  id: number
  title: string
  subject: string | null
  description: string | null
  dueDate: string
  courseId: number | null
  progress: number
  completed: boolean
  createdById: number
  createdAt: string
  updatedAt: string
}

export interface ApiChecklistItem {
  id: number
  taskId: number
  text: string
  done: boolean
}

export interface ApiAttachment {
  id: number
  taskId: number
  name: string
  size: number
  url: string
  uploadedAt: string
}

export interface ApiTask {
  id: number
  assignmentId: number
  title: string
  description: string | null
  status: TaskStatus
  assigneeIds: number[]
  checklist: ApiChecklistItem[]
  attachments: ApiAttachment[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface ApiAssignmentDetail extends ApiAssignment {
  tasks: ApiTask[]
  /** PENDING invite emails only. */
  invites: string[]
}

export interface ApiMember {
  id: number
  name: string
  initials: string
  color: string
}

export interface ApiInvite {
  id: number
  assignmentId: number
  email: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

// ── Request body shapes ───────────────────────────────────────────────

interface AssignmentBody {
  title: string
  subject?: string
  description?: string
  dueDate: string
  courseId?: number
}

interface TaskBody {
  title: string
  description?: string
  assigneeIds?: number[]
}

// ── Request layer ─────────────────────────────────────────────────────

const BASE = '/api/v1'

// Every endpoint responds with an ApiEnvelope<T> wrapper; `.then((r) => r.data.data)`
// unwraps it so callers deal with plain API shapes (ApiAssignment, ApiTask, etc.).
export const assignmentsRequest = {
  // Assignments
  list(page = 0, size = 20): Promise<PaginatedData<ApiAssignment>> {
    return apiClient
      .get<ApiEnvelope<PaginatedData<ApiAssignment>>>(`${BASE}/assignments`, {
        params: { page, size },
      })
      .then((r) => r.data.data)
  },

  getOne(id: number): Promise<ApiAssignmentDetail> {
    return apiClient
      .get<ApiEnvelope<ApiAssignmentDetail>>(`${BASE}/assignments/${id}`)
      .then((r) => r.data.data)
  },

  create(body: AssignmentBody): Promise<ApiAssignment> {
    return apiClient
      .post<ApiEnvelope<ApiAssignment>>(`${BASE}/assignments`, body)
      .then((r) => r.data.data)
  },

  update(id: number, body: AssignmentBody): Promise<ApiAssignment> {
    return apiClient
      .put<ApiEnvelope<ApiAssignment>>(`${BASE}/assignments/${id}`, body)
      .then((r) => r.data.data)
  },

  remove(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/assignments/${id}`).then(() => undefined)
  },

  toggleComplete(id: number): Promise<ApiAssignment> {
    return apiClient
      .patch<ApiEnvelope<ApiAssignment>>(`${BASE}/assignments/${id}/complete`)
      .then((r) => r.data.data)
  },

  // Tasks
  createTask(assignmentId: number, body: TaskBody): Promise<ApiTask> {
    return apiClient
      .post<ApiEnvelope<ApiTask>>(`${BASE}/assignments/${assignmentId}/tasks`, body)
      .then((r) => r.data.data)
  },

  updateTask(taskId: number, body: TaskBody): Promise<ApiTask> {
    return apiClient
      .put<ApiEnvelope<ApiTask>>(`${BASE}/tasks/${taskId}`, body)
      .then((r) => r.data.data)
  },

  removeTask(taskId: number): Promise<void> {
    return apiClient.delete(`${BASE}/tasks/${taskId}`).then(() => undefined)
  },

  setTaskStatus(taskId: number, status: TaskStatus): Promise<ApiTask> {
    return apiClient
      .patch<ApiEnvelope<ApiTask>>(`${BASE}/tasks/${taskId}/status`, { status })
      .then((r) => r.data.data)
  },

  reorderTasks(assignmentId: number, orderedIds: number[]): Promise<ApiTask[]> {
    return apiClient
      .patch<ApiEnvelope<ApiTask[]>>(`${BASE}/assignments/${assignmentId}/tasks/reorder`, {
        orderedIds,
      })
      .then((r) => r.data.data)
  },

  // Checklist
  addChecklistItem(taskId: number, text: string): Promise<ApiChecklistItem> {
    return apiClient
      .post<ApiEnvelope<ApiChecklistItem>>(`${BASE}/tasks/${taskId}/checklist`, { text })
      .then((r) => r.data.data)
  },

  toggleChecklistItem(itemId: number, done: boolean): Promise<ApiChecklistItem> {
    return apiClient
      .patch<ApiEnvelope<ApiChecklistItem>>(`${BASE}/checklist/${itemId}/toggle`, { done })
      .then((r) => r.data.data)
  },

  removeChecklistItem(itemId: number): Promise<void> {
    return apiClient.delete(`${BASE}/checklist/${itemId}`).then(() => undefined)
  },

  // Attachments
  uploadAttachment(taskId: number, file: File): Promise<ApiAttachment> {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<ApiEnvelope<ApiAttachment>>(`${BASE}/tasks/${taskId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },

  removeAttachment(attachmentId: number): Promise<void> {
    return apiClient.delete(`${BASE}/attachments/${attachmentId}`).then(() => undefined)
  },

  // Invites & Members
  sendInvite(assignmentId: number, email: string): Promise<ApiInvite> {
    return apiClient
      .post<ApiEnvelope<ApiInvite>>(`${BASE}/assignments/${assignmentId}/invites`, { email })
      .then((r) => r.data.data)
  },

  revokeInvite(assignmentId: number, email: string): Promise<void> {
    return apiClient
      .delete(`${BASE}/assignments/${assignmentId}/invites/${encodeURIComponent(email)}`)
      .then(() => undefined)
  },

  getMembers(assignmentId: number): Promise<ApiMember[]> {
    return apiClient
      .get<ApiEnvelope<ApiMember[]>>(`${BASE}/assignments/${assignmentId}/members`)
      .then((r) => r.data.data)
  },

  // User search (invite autocomplete)
  searchUsers(email: string): Promise<ApiMember[]> {
    return apiClient
      .get<ApiEnvelope<ApiMember[]>>(`${BASE}/users/search`, { params: { email } })
      .then((r) => r.data.data)
  },
}
