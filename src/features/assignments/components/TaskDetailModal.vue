<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AlignLeft,
  Calendar,
  Check,
  CheckSquare,
  FileText,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-vue-next'

import MemberAvatar from './MemberAvatar.vue'
import { MEMBERS } from '@/features/assignments/members'
import {
  formatDeadline,
  formatFileSize,
  TASK_STATUS_META,
  TASK_STATUS_ORDER,
} from '@/features/assignments/helpers'
import { useAssignmentStore } from '@/features/assignments/store/useAssignmentStore'
import {
  updateTaskAction,
  setTaskStatusAction,
  addChecklistItemAction,
  toggleChecklistItemAction,
  removeChecklistItemAction,
  uploadAttachmentAction,
  removeAttachmentAction,
} from '@/features/assignments/store/assignments.action'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useToasts } from '@/shared/composables/useToasts'
import type { AssignmentTask, ChecklistItem, TaskAttachment } from '@/features/assignments/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  assignmentId: number
  taskId: number | null
}>()

const store = useAssignmentStore()
const { confirm } = useConfirm()
const { push } = useToasts()

const assignment = computed(() => store.find(props.assignmentId))
const task = computed(() =>
  props.taskId === null ? undefined : assignment.value?.tasks.find((t) => t.id === props.taskId),
)

// --- Draft: edits stay local until Save commits them via API ---
type TaskDraft = Pick<
  AssignmentTask,
  'title' | 'description' | 'status' | 'checklist' | 'assigneeIds' | 'attachments'
>

function snapshot(t: AssignmentTask): TaskDraft {
  return {
    title: t.title,
    description: t.description,
    status: t.status,
    checklist: t.checklist.map((c) => ({ ...c })),
    assigneeIds: [...t.assigneeIds],
    attachments: t.attachments.map((f) => ({ ...f })),
  }
}

const draft = ref<TaskDraft | null>(null)
const saving = ref(false)

// Originals needed for diffing on save.
const originalChecklist = ref<ChecklistItem[]>([])
const originalAttachmentIds = ref<Set<number>>(new Set())
// File objects for new uploads, keyed by negative temp id.
const pendingFiles = ref(new Map<number, File>())

// Negative placeholder ids for items added while the modal is open — real ids
// from the API are always positive, so `id < 0` reliably means "not yet persisted".
let tempId = -1

watch(
  [open, () => task.value?.id],
  ([isOpen]) => {
    if (isOpen && task.value) {
      draft.value = snapshot(task.value)
      originalChecklist.value = task.value.checklist.map((c) => ({ ...c }))
      originalAttachmentIds.value = new Set(task.value.attachments.map((f) => f.id))
      pendingFiles.value = new Map()
      tempId = -1
    }
  },
  { immediate: true },
)

// Anything changed since the modal opened (or was last saved)? A JSON-string
// comparison is a cheap-but-effective deep-equality check here since TaskDraft
// is plain, serializable data with no functions/dates that would compare unstably.
const isDirty = computed(
  () =>
    !!task.value &&
    !!draft.value &&
    JSON.stringify(draft.value) !== JSON.stringify(snapshot(task.value)),
)

const isDone = computed(() => draft.value?.status === 'done')

function toggleDone(): void {
  if (draft.value) draft.value.status = draft.value.status === 'done' ? 'todo' : 'done'
}

// Close automatically if the task disappears (e.g. deleted from the list behind
// this modal) — nothing to keep, and bypassing requestClose avoids an
// unnecessary "unsaved changes" prompt for a task that no longer exists.
watch(
  () => task.value,
  (t) => {
    if (open.value && !t) close()
  },
)

// --- Checklist (draft-local) ---
const newItem = ref('')
const checklistDone = computed(() => draft.value?.checklist.filter((c) => c.done).length ?? 0)
const checklistTotal = computed(() => draft.value?.checklist.length ?? 0)
const checklistPct = computed(() =>
  checklistTotal.value ? Math.round((checklistDone.value / checklistTotal.value) * 100) : 0,
)

function addItem(): void {
  const text = newItem.value.trim()
  if (!draft.value || !text) return
  draft.value.checklist.push({ id: tempId--, text, done: false })
  newItem.value = ''
}

function toggleItem(itemId: number): void {
  const item = draft.value?.checklist.find((c) => c.id === itemId)
  if (item) item.done = !item.done
}

function removeItem(itemId: number): void {
  if (draft.value) draft.value.checklist = draft.value.checklist.filter((c) => c.id !== itemId)
}

// --- Members (draft-local) ---
function toggleAssignee(memberId: number): void {
  if (!draft.value) return
  draft.value.assigneeIds = draft.value.assigneeIds.includes(memberId)
    ? draft.value.assigneeIds.filter((id) => id !== memberId)
    : [...draft.value.assigneeIds, memberId]
}

// --- Attachments (draft-local; uploaded to Cloudinary on Save) ---
const fileInput = ref<HTMLInputElement | null>(null)
function onFilesChosen(e: Event): void {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length && draft.value) {
    for (const file of files) {
      const tid = tempId--
      pendingFiles.value.set(tid, file)
      draft.value.attachments.push({
        id: tid,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
    }
  }
  input.value = ''
}

function removeAttachment(attachmentId: number): void {
  if (draft.value)
    draft.value.attachments = draft.value.attachments.filter((f) => f.id !== attachmentId)
}

// --- Save: commit all draft changes via API ---
async function save(): Promise<void> {
  if (!task.value || !draft.value || saving.value) return
  saving.value = true
  try {
    const taskId = task.value.id
    const d = draft.value

    // 1. Main task fields + assignees.
    await updateTaskAction(taskId, {
      title: d.title,
      description: d.description,
      assigneeIds: d.assigneeIds,
    })

    // 2. Status (separate PATCH endpoint).
    if (d.status !== task.value.status) {
      await setTaskStatusAction(taskId, d.status)
    }

    // 3. Checklist: remove deleted, sync toggled, add new.
    // Diff against the snapshot taken when the modal opened to figure out what
    // actually changed, since the draft has no per-item dirty tracking of its own.
    const origMap = new Map(originalChecklist.value.map((c) => [c.id, c]))
    const draftExisting = d.checklist.filter((c) => c.id > 0)
    const draftExistingIds = new Set(draftExisting.map((c) => c.id))

    await Promise.all([
      // Removed items.
      ...[...origMap.keys()]
        .filter((id) => !draftExistingIds.has(id))
        .map((id) => removeChecklistItemAction(taskId, id)),
      // Toggled items.
      ...draftExisting
        .filter((c) => origMap.get(c.id)?.done !== c.done)
        .map((c) => toggleChecklistItemAction(taskId, c.id, c.done)),
    ])
    // New items — sequential to keep display order.
    for (const c of d.checklist.filter((c) => c.id < 0)) {
      await addChecklistItemAction(taskId, c.text)
    }

    // 4. Attachments: remove deleted, upload new. Negative-id attachments are
    // local File objects held in pendingFiles that haven't hit Cloudinary yet.
    const draftAttIds = new Set(d.attachments.filter((f) => f.id > 0).map((f) => f.id))
    await Promise.all([
      // Removed.
      ...[...originalAttachmentIds.value]
        .filter((id) => !draftAttIds.has(id))
        .map((id) => removeAttachmentAction(taskId, id)),
      // Uploaded.
      ...d.attachments
        .filter((f) => f.id < 0)
        .map((f) => {
          const file = pendingFiles.value.get(f.id)
          return file ? uploadAttachmentAction(taskId, file) : Promise.resolve(undefined)
        }),
    ])

    push('Task saved', 'check', 'emerald')
    close()
  } catch {
    push('Failed to save task. Please try again.', 'x', 'danger')
  } finally {
    saving.value = false
  }
}

function close(): void {
  open.value = false
}

/** X button, overlay click and Escape land here so unsaved edits get a warning. */
async function requestClose(): Promise<void> {
  if (isDirty.value) {
    const ok = await confirm({
      title: 'Are you sure you want to leave this page?',
      message: 'Once you close this modal, all unsaved progress will be lost.',
      confirmLabel: 'Yes',
      cancelLabel: 'No',
      danger: true,
    })
    if (!ok) return
  }
  close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') void requestClose()
}
watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && task && draft"
      class="modal-overlay fixed inset-0 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto"
      @click.self="requestClose"
    >
    <div
      class="modal-panel bg-white rounded-3xl w-full max-w-5xl min-h-[88vh] flex flex-col shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 px-6 md:px-8 pt-6 pb-4 border-b border-border">
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            class="h-7 w-7 mt-1.5 shrink-0 rounded-lg border-2 grid place-items-center transition"
            :class="isDone ? 'border-emerald bg-emerald text-white' : 'border-border text-transparent hover:border-emerald'"
            :aria-label="isDone ? 'Mark not done' : 'Mark done'"
            @click="toggleDone"
          >
            <Check class="h-4 w-4" />
          </button>
          <div class="min-w-0 flex-1">
            <input
              v-model="draft.title"
              class="w-full bg-transparent font-display font-extrabold text-[24px] md:text-[26px] text-ink outline-none rounded-lg px-1.5 -ml-1.5 focus:bg-bg transition"
            />
            <p class="text-[13px] text-muted mt-1 px-1.5">
              in list
              <span class="font-semibold text-ink bg-bg border border-border rounded-md px-2 py-0.5 ml-1">
                {{ assignment?.title }}
              </span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="h-9 px-4 flex items-center gap-1.5 rounded-xl text-white text-[13px] font-semibold shadow-md shadow-emerald/20 transition hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
            :disabled="!isDirty || saving"
            @click="save"
          >
            <template v-if="saving">
              <span class="task-spinner" aria-hidden="true" />
              Saving…
            </template>
            <template v-else>
              <Save class="h-4 w-4" /> Save
            </template>
          </button>
          <button
            type="button"
            class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
            aria-label="Close"
            @click="requestClose"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <!-- Body: main + sidebar -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-6 md:px-8 py-6">
        <!-- MAIN -->
        <div class="lg:col-span-2 space-y-7">
          <!-- Status label (interactive) -->
          <div>
            <p class="flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase mb-2">
              <Tag class="h-3.5 w-3.5" /> Label
            </p>
            <div class="inline-flex items-center gap-1.5 bg-bg border border-border rounded-xl p-1">
              <button
                v-for="s in TASK_STATUS_ORDER"
                :key="s"
                type="button"
                class="text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                :class="draft.status === s ? TASK_STATUS_META[s].activeClass : 'text-muted hover:text-ink'"
                @click="draft.status = s"
              >
                <span
                  v-if="draft.status !== s"
                  class="h-1.5 w-1.5 rounded-full"
                  :style="{ background: TASK_STATUS_META[s].dot }"
                ></span>
                {{ TASK_STATUS_META[s].label }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <p class="flex items-center gap-2 text-[14px] font-bold text-ink mb-2.5">
              <AlignLeft class="h-4 w-4 text-muted" /> Description
            </p>
            <textarea
              v-model="draft.description"
              rows="5"
              class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition resize-none"
              placeholder="Add a more detailed description…"
            ></textarea>
          </div>

          <!-- Checklist -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="flex items-center gap-2 text-[14px] font-bold text-ink">
                <CheckSquare class="h-4 w-4 text-muted" /> Checklist
              </p>
              <span v-if="checklistTotal" class="text-[12.5px] font-semibold text-muted">
                {{ checklistPct }}%
              </span>
            </div>

            <div v-if="checklistTotal" class="h-2 rounded-full bg-bg overflow-hidden mb-3">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${checklistPct}%`, background: 'linear-gradient(90deg, var(--indigo), #7c3aed)' }"
              ></div>
            </div>

            <ul class="space-y-1">
              <li
                v-for="item in draft.checklist"
                :key="item.id"
                class="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg transition"
              >
                <button
                  type="button"
                  class="h-5 w-5 shrink-0 rounded border-2 grid place-items-center transition"
                  :class="item.done ? 'border-indigo bg-indigo text-white' : 'border-border text-transparent hover:border-indigo'"
                  @click="toggleItem(item.id)"
                >
                  <Check class="h-3 w-3" />
                </button>
                <span class="flex-1 text-[14px]" :class="item.done ? 'line-through text-muted' : 'text-ink'">
                  {{ item.text }}
                </span>
                <button
                  type="button"
                  class="opacity-0 group-hover:opacity-100 text-muted hover:text-danger-ink transition"
                  title="Remove item"
                  @click="removeItem(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </li>
            </ul>

            <form class="mt-2.5 flex items-center gap-2" @submit.prevent="addItem">
              <input
                v-model="newItem"
                class="flex-1 bg-bg border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition"
                placeholder="Add a checklist item…"
              />
              <button
                type="submit"
                class="h-[42px] px-3.5 rounded-lg border border-indigo/30 text-indigo-ink text-[13px] font-semibold flex items-center gap-1.5 hover:bg-indigo/10 transition"
              >
                <Plus class="h-4 w-4" /> Add
              </button>
            </form>
          </div>
        </div>

        <!-- SIDEBAR -->
        <div class="lg:border-l lg:border-border lg:pl-7 space-y-5">
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl text-[13.5px] font-semibold flex items-center justify-center gap-2 transition"
            :class="isDone
              ? 'border border-border text-muted hover:bg-bg'
              : 'text-white shadow-md shadow-emerald/20 hover:-translate-y-0.5'"
            :style="isDone ? '' : 'background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))'"
            @click="toggleDone"
          >
            <component :is="isDone ? RotateCcw : Check" class="h-4 w-4" />
            {{ isDone ? 'Reopen task' : 'Mark complete' }}
          </button>

          <!-- Members / assignees -->
          <div>
            <p class="flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase mb-2.5">
              <Users class="h-3.5 w-3.5" /> Members
            </p>
            <div class="flex flex-col gap-1.5">
              <button
                v-for="m in MEMBERS"
                :key="m.id"
                type="button"
                class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border transition text-left"
                :class="draft.assigneeIds.includes(m.id)
                  ? 'border-indigo bg-indigo/10 text-indigo-ink font-semibold'
                  : 'border-transparent text-muted hover:bg-bg'"
                @click="toggleAssignee(m.id)"
              >
                <MemberAvatar :member="m" :size="26" :ring="false" />
                <span class="text-[13px] flex-1">{{ m.name }}</span>
                <Check v-if="draft.assigneeIds.includes(m.id)" class="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>

          <!-- Attachments -->
          <div>
            <p class="flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase mb-2.5">
              <Paperclip class="h-3.5 w-3.5" /> Attachments
              <span v-if="draft.attachments.length" class="normal-case font-semibold">
                ({{ draft.attachments.length }})
              </span>
            </p>
            <button
              type="button"
              class="w-full px-3.5 py-2.5 rounded-xl border border-indigo/30 text-indigo-ink text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-indigo/10 transition"
              @click="fileInput?.click()"
            >
              <Paperclip class="h-4 w-4" /> Add attachment
            </button>
            <input ref="fileInput" type="file" multiple class="hidden" @change="onFilesChosen" />

            <ul v-if="draft.attachments.length" class="mt-2.5 space-y-1.5">
              <li
                v-for="file in draft.attachments"
                :key="file.id"
                class="flex items-center gap-2 text-[12.5px] text-ink bg-bg border border-border rounded-lg px-3 py-2"
              >
                <FileText class="h-4 w-4 shrink-0 text-muted" />
                <span class="truncate font-medium flex-1" :title="file.name">{{ file.name }}</span>
                <span class="text-muted shrink-0">{{ formatFileSize(file.size) }}</span>
                <button
                  type="button"
                  class="text-muted hover:text-danger-ink transition shrink-0"
                  title="Remove attachment"
                  @click="removeAttachment(file.id)"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          </div>

          <!-- Due date (from the assignment) -->
          <div v-if="assignment">
            <p class="flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase mb-2.5">
              <Calendar class="h-3.5 w-3.5" /> Due date
            </p>
            <p class="text-[13.5px] text-ink font-medium flex items-center gap-2">
              <Calendar class="h-4 w-4 text-muted" /> {{ formatDeadline(assignment.deadline) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<style scoped>
.task-spinner {
  height: 0.875rem;
  width: 0.875rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
