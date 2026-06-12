<script setup lang="ts">
import { ref } from 'vue'
import {
  AlignLeft,
  Check,
  CheckSquare,
  GripVertical,
  ListTodo,
  Paperclip,
  Plus,
  Trash2,
} from 'lucide-vue-next'

import MemberAvatar from './MemberAvatar.vue'
import TaskDetailModal from './TaskDetailModal.vue'
import { findMember } from '@/features/assignments/members'
import type { Assignment } from '@/features/assignments/types'
import { useAssignmentStore } from '@/features/assignments/store/useAssignmentStore'

const props = defineProps<{ assignment: Assignment }>()

const store = useAssignmentStore()

const newTitle = ref('')
const openTaskId = ref<number | null>(null)
const modalOpen = ref(false)

// --- Drag & drop reordering ---
const draggingId = ref<number | null>(null)

function onDragStart(taskId: number, e: DragEvent): void {
  draggingId.value = taskId
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragEnter(targetId: number): void {
  if (draggingId.value !== null && draggingId.value !== targetId) {
    store.reorderTask(props.assignment.id, draggingId.value, targetId)
  }
}

function onDragEnd(): void {
  draggingId.value = null
}

function addTask(): void {
  if (!newTitle.value.trim()) return
  store.addTask(props.assignment.id, newTitle.value)
  newTitle.value = ''
}

function openTask(id: number): void {
  openTaskId.value = id
  modalOpen.value = true
}

function assignees(ids: number[]) {
  return ids.map(findMember).filter((m) => m !== undefined)
}
</script>

<template>
  <section class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-display font-bold text-[16px] text-ink flex items-center gap-2">
        <Paperclip class="h-4.5 w-4.5 text-indigo" /> Tasks
      </h3>
      <span
        v-if="assignment.tasks.length"
        class="text-[12px] font-semibold text-muted bg-bg border border-border px-2.5 py-1 rounded-full"
      >
        {{ assignment.tasks.filter((t) => t.status === 'done').length }}/{{ assignment.tasks.length }} done
      </span>
    </div>

    <p class="text-[12.5px] text-muted mb-4 leading-snug">
      Drag to reorder. Click a task to add details, a checklist and assignees. Upload proof to
      auto-complete it — progress updates as you go.
    </p>

    <ul class="space-y-2.5">
      <li
        v-for="task in assignment.tasks"
        :key="task.id"
        draggable="true"
        class="rounded-2xl border border-border p-3 transition hover:bg-bg/60 hover:border-indigo/30 cursor-pointer"
        :class="
          draggingId === task.id
            ? 'opacity-40 ring-2 ring-indigo/40'
            : task.status === 'done'
              ? 'bg-emerald/[.04] border-emerald/30'
              : ''
        "
        @click="openTask(task.id)"
        @dragstart="onDragStart(task.id, $event)"
        @dragenter.prevent="onDragEnter(task.id)"
        @dragover.prevent
        @dragend="onDragEnd"
        @drop.prevent="onDragEnd"
      >
        <div class="flex items-start gap-2.5">
          <span
            class="mt-1 shrink-0 text-muted/50 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            @click.stop
          >
            <GripVertical class="h-4 w-4" />
          </span>

          <button
            type="button"
            class="h-6 w-6 mt-0.5 shrink-0 rounded-lg border-2 grid place-items-center transition"
            :class="task.status === 'done' ? 'border-emerald bg-emerald text-white' : 'border-border text-transparent hover:border-emerald'"
            :aria-label="task.status === 'done' ? 'Mark task not done' : 'Mark task done'"
            @click.stop="store.toggleTask(assignment.id, task.id)"
          >
            <Check class="h-3.5 w-3.5" />
          </button>

          <div class="flex-1 min-w-0">
            <p
              class="text-[14px] font-semibold leading-snug"
              :class="task.status === 'done' ? 'line-through text-muted' : 'text-ink'"
            >
              {{ task.title }}
            </p>

            <!-- meta badges -->
            <div class="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-2 text-[11.5px] text-muted">
              <span
                v-if="task.status === 'progress'"
                class="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-ink bg-amber/15 px-2 py-0.5 rounded-full"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-amber"></span> In progress
              </span>
              <span v-if="task.description" class="flex items-center gap-1" title="Has a description">
                <AlignLeft class="h-3.5 w-3.5" />
              </span>
              <span v-if="task.checklist.length" class="flex items-center gap-1">
                <CheckSquare class="h-3.5 w-3.5" />
                {{ task.checklist.filter((c) => c.done).length }}/{{ task.checklist.length }}
              </span>
              <span
                v-if="task.proof"
                class="flex items-center gap-1 text-emerald-ink font-medium"
                title="Proof uploaded"
              >
                <Paperclip class="h-3.5 w-3.5" /> Proof
              </span>
              <span v-if="task.assigneeIds.length" class="flex items-center -space-x-1.5">
                <MemberAvatar
                  v-for="m in assignees(task.assigneeIds)"
                  :key="m.id"
                  :member="m"
                  :size="20"
                />
              </span>
            </div>
          </div>

          <button
            type="button"
            title="Remove task"
            class="h-8 w-8 shrink-0 grid place-items-center rounded-lg border border-danger/30 text-danger-ink hover:bg-danger/10 transition"
            @click.stop="store.removeTask(assignment.id, task.id)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    </ul>

    <div
      v-if="!assignment.tasks.length"
      class="rounded-2xl border-2 border-dashed border-border/70 grid place-items-center py-8 text-center text-muted"
    >
      <ListTodo class="h-6 w-6 mb-2 opacity-60" />
      <p class="text-[12.5px] font-medium">No tasks yet — add one below or generate a plan.</p>
    </div>

    <!-- Add task -->
    <form class="mt-4 flex items-center gap-2" @submit.prevent="addTask">
      <input
        v-model="newTitle"
        class="flex-1 bg-bg border border-border rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition"
        placeholder="Add a task…"
      />
      <button
        type="submit"
        class="h-[42px] px-4 rounded-xl text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-md shadow-emerald/20 hover:-translate-y-0.5 transition"
        style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
      >
        <Plus class="h-4 w-4" /> Add
      </button>
    </form>

    <TaskDetailModal v-model:open="modalOpen" :assignment-id="assignment.id" :task-id="openTaskId" />
  </section>
</template>
