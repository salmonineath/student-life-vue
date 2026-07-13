# Assignments Feature — Backend Requirements

## Current State

Everything is **hardcoded seed data** in Pinia with `localStorage` persistence. No API calls exist yet.

---

## 1. Data Models the Backend Needs to Store

### Assignment
| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | auto-generated |
| `title` | string | required |
| `subject` | string | e.g. "IT", "CS", "Math" |
| `desc` | string | optional description |
| `deadline` | date | ISO format `yyyy-mm-dd` |
| `progress` | integer | 0–100, derived from tasks if tasks exist |
| `completed` | boolean | true if progress >= 100 |
| `invites` | string[] | array of invited user emails |
| `tasks` | Task[] | nested tasks |
| `owner_id` | integer | FK to the user who created it |

### Task (nested inside Assignment)
| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | auto-generated |
| `assignment_id` | integer | FK |
| `title` | string | required |
| `description` | string | optional notes |
| `status` | enum | `"todo"` \| `"progress"` \| `"done"` |
| `assignee_ids` | integer[] | array of member/user ids |
| `checklist` | ChecklistItem[] | sub-steps |
| `attachments` | Attachment[] | uploaded files |
| `order` | integer | for drag-and-drop reorder |

### Checklist Item
| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | auto-generated |
| `task_id` | integer | FK |
| `text` | string | required |
| `done` | boolean | default false |

### Attachment
| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | auto-generated |
| `task_id` | integer | FK |
| `name` | string | original filename |
| `size` | integer | bytes |
| `uploaded_at` | timestamp | ISO datetime |
| `url` | string | file URL (S3, local storage, etc.) |

### Member (already exists as User — just needs to be returned)
| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | |
| `name` | string | fullname |
| `initials` | string | 2-char initials derived from name |
| `color` | string | hex color (assigned per user or static) |

---

## 2. API Endpoints Backend Needs to Build

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/assignments` | List all assignments for the logged-in user |
| `POST` | `/api/v1/assignments` | Create a new assignment |
| `GET` | `/api/v1/assignments/{id}` | Get single assignment with all tasks |
| `PUT` | `/api/v1/assignments/{id}` | Update title, subject, desc, deadline |
| `DELETE` | `/api/v1/assignments/{id}` | Delete assignment |
| `PATCH` | `/api/v1/assignments/{id}/complete` | Toggle completed flag |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/assignments/{id}/tasks` | Add a task |
| `PUT` | `/api/v1/assignments/{id}/tasks/{taskId}` | Update title, description, status, assignees |
| `DELETE` | `/api/v1/assignments/{id}/tasks/{taskId}` | Remove a task |
| `PATCH` | `/api/v1/assignments/{id}/tasks/{taskId}/status` | Set status only (`todo`/`progress`/`done`) |
| `PATCH` | `/api/v1/assignments/{id}/tasks/reorder` | Reorder tasks — body: `{ orderedIds: [3,1,2] }` |

### Checklist
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/assignments/{id}/tasks/{taskId}/checklist` | Add checklist item |
| `PATCH` | `/api/v1/assignments/{id}/tasks/{taskId}/checklist/{itemId}/toggle` | Toggle done |
| `DELETE` | `/api/v1/assignments/{id}/tasks/{taskId}/checklist/{itemId}` | Remove item |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/assignments/{id}/tasks/{taskId}/attachments` | Upload file (`multipart/form-data`) |
| `DELETE` | `/api/v1/assignments/{id}/tasks/{taskId}/attachments/{attachmentId}` | Remove file |

### Invites & Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/assignments/{id}/invites` | Invite user by email |
| `DELETE` | `/api/v1/assignments/{id}/invites/{email}` | Remove invite |
| `GET` | `/api/v1/assignments/{id}/members` | Get all members with id, name, initials, color |
| `GET` | `/api/v1/users/search?email={q}` | Search users by email (for invite autocomplete) |

---

## 3. Expected Response Shapes

### `GET /api/v1/assignments`
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "title": "My assignment",
      "subject": "IT",
      "desc": "Something",
      "deadline": "2026-06-18",
      "progress": 25,
      "completed": false,
      "invites": ["dara.sok@university.edu"],
      "tasks": [
        {
          "id": 1,
          "title": "Gather requirements",
          "description": "Collect the brief and rubric before starting.",
          "status": "done",
          "assigneeIds": [1],
          "checklist": [
            { "id": 1, "text": "Read the brief", "done": true },
            { "id": 2, "text": "Note the grading rubric", "done": false }
          ],
          "attachments": [
            { "id": 1, "name": "brief.pdf", "size": 204800, "uploadedAt": "2026-06-01T08:00:00Z" }
          ]
        }
      ]
    }
  ]
}
```

### `GET /api/v1/assignments/{id}/members`
```json
{
  "status": 200,
  "data": [
    { "id": 1, "name": "Sok Dara", "initials": "SD", "color": "#10B981" },
    { "id": 2, "name": "Chan Lina", "initials": "CL", "color": "#F59E0B" }
  ]
}
```

### `POST /api/v1/assignments` — Request body
```json
{
  "title": "My assignment",
  "subject": "IT",
  "desc": "Something",
  "deadline": "2026-06-18",
  "progress": 0
}
```

### `PATCH /api/v1/assignments/{id}/tasks/reorder` — Request body
```json
{
  "orderedIds": [3, 1, 2]
}
```

---

## 4. What the Frontend Does NOT Need the Backend For

| Feature | Reason |
|---------|--------|
| **AI Study Planner** | Currently client-side only — pure deterministic function based on days left and progress. No AI API needed unless upgrading to real AI later. |
| **Subject accent colors** | Derived from subject string on the frontend — no need to store in DB. |
| **Stats (total, done, overdue, avgProgress)** | Computed from the assignments list on the frontend — no separate stats endpoint needed. |
| **Days left / overdue label** | Computed from `deadline` field on the frontend. |

---

## 5. Implementation Notes

> **Negative temp IDs on task save** — When the user edits a task and saves it, new checklist items carry negative placeholder IDs (e.g. `-1`, `-2`). The backend must assign real IDs and return the full updated task so the frontend can replace the temp IDs.

> **`progress` is computed, not stored** — The backend should derive `progress` (and `completed`) from the task statuses on every fetch (`done tasks / total tasks * 100`). The frontend does not send `progress` as a write field — it reads it back from the API response.

---

## 6. Priority Order to Build

```
1. GET/POST/PUT/DELETE  /assignments                  ← unblocks the whole list view
2. POST/PUT/DELETE      /assignments/{id}/tasks        ← unblocks task management
3. PATCH                /tasks/{taskId}/status         ← unblocks progress tracking
4. POST/PATCH/DELETE    /checklist                     ← unblocks task detail modal
5. POST/DELETE          /invites  +  GET /members      ← unblocks collaboration
6. POST/DELETE          /attachments                   ← file uploads last (needs storage setup)
```
