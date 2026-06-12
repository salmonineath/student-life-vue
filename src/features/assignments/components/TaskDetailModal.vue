<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AlignLeft,
  Calendar,
  Check,
  CheckSquare,
  FileCheck2,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
  Upload,
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
import { useToasts } from '@/shared/composables/useToasts'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  assignmentId: number
  taskId: number | null
}>()

const store = useAssignmentStore()
const { push } = useToasts()

const assignment = computed(() => store.find(props.assignmentId))
const task = computed(() =>
  props.taskId === null ? undefined : assignment.value?.tasks.find((t) => t.id === props.taskId),
)

const isDone = computed(() => task.value?.status === 'done')

// Close automatically if the task disappears (e.g. deleted).
watch(
  () => task.value,
  (t) => {
    if (open.value && !t) close()
  },
)

// --- Editable title / description (write straight through to the store) ---
const title = computed({
  get: () => task.value?.title ?? '',
  set: (v) => task.value && store.updateTask(props.assignmentId, task.value.id, { title: v }),
})
const description = computed({
  get: () => task.value?.description ?? '',
  set: (v) => task.value && store.updateTask(props.assignmentId, task.value.id, { description: v }),
})

// --- Checklist ---
const newItem = ref('')
const checklistDone = computed(() => task.value?.checklist.filter((c) => c.done).length ?? 0)
const checklistTotal = computed(() => task.value?.checklist.length ?? 0)
const checklistPct = computed(() =>
  checklistTotal.value ? Math.round((checklistDone.value / checklistTotal.value) * 100) : 0,
)

function addItem(): void {
  if (!task.value || !newItem.value.trim()) return
  store.addChecklistItem(props.assignmentId, task.value.id, newItem.value)
  newItem.value = ''
}

// --- Proof upload ---
const fileInput = ref<HTMLInputElement | null>(null)
function onFileChosen(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && task.value) {
    store.setTaskProof(props.assignmentId, task.value.id, {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    })
    push('Proof uploaded — task marked complete ✅', 'check-check', 'emerald')
  }
  input.value = ''
}

function close(): void {
  open.value = false
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}
watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && task"
      class="modal-overlay fixed inset-0 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto"
      @click.self="close"
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
            @click="store.toggleTask(assignmentId, task.id)"
          >
            <Check class="h-4 w-4" />
          </button>
          <div class="min-w-0 flex-1">
            <input
              v-model="title"
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
        <button
          type="button"
          class="h-9 w-9 shrink-0 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
          @click="close"
        >
          <X class="h-4.5 w-4.5" />
        </button>
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
                :class="task.status === s ? TASK_STATUS_META[s].activeClass : 'text-muted hover:text-ink'"
                @click="store.setTaskStatus(assignmentId, task.id, s)"
              >
                <span
                  v-if="task.status !== s"
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
              v-model="description"
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
                v-for="item in task.checklist"
                :key="item.id"
                class="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg transition"
              >
                <button
                  type="button"
                  class="h-5 w-5 shrink-0 rounded border-2 grid place-items-center transition"
                  :class="item.done ? 'border-indigo bg-indigo text-white' : 'border-border text-transparent hover:border-indigo'"
                  @click="store.toggleChecklistItem(assignmentId, task.id, item.id)"
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
                  @click="store.removeChecklistItem(assignmentId, task.id, item.id)"
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
            @click="store.toggleTask(assignmentId, task.id)"
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
                :class="task.assigneeIds.includes(m.id)
                  ? 'border-indigo bg-indigo/10 text-indigo-ink font-semibold'
                  : 'border-transparent text-muted hover:bg-bg'"
                @click="store.toggleAssignee(assignmentId, task.id, m.id)"
              >
                <MemberAvatar :member="m" :size="26" :ring="false" />
                <span class="text-[13px] flex-1">{{ m.name }}</span>
                <Check v-if="task.assigneeIds.includes(m.id)" class="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>

          <!-- Attachment / proof -->
          <div>
            <p class="flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase mb-2.5">
              <Upload class="h-3.5 w-3.5" /> Attachment
            </p>
            <button
              type="button"
              class="w-full px-3.5 py-2.5 rounded-xl border border-indigo/30 text-indigo-ink text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-indigo/10 transition"
              @click="fileInput?.click()"
            >
              <Upload class="h-4 w-4" /> {{ task.proof ? 'Replace proof' : 'Upload proof' }}
            </button>
            <input ref="fileInput" type="file" class="hidden" @change="onFileChosen" />

            <div
              v-if="task.proof"
              class="mt-2.5 flex items-center gap-2 text-[12.5px] text-emerald-ink bg-emerald/10 border border-emerald/20 rounded-lg px-3 py-2"
            >
              <FileCheck2 class="h-4 w-4 shrink-0" />
              <span class="truncate font-medium flex-1">{{ task.proof.name }}</span>
              <span class="text-emerald-ink/70 shrink-0">{{ formatFileSize(task.proof.size) }}</span>
              <button
                type="button"
                class="text-emerald-ink/70 hover:text-danger-ink transition shrink-0"
                title="Remove proof"
                @click="store.clearProof(assignmentId, task.id)"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
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
