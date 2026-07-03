<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Plus, Sparkles } from 'lucide-vue-next'

import AssignmentStats from '@/features/assignments/components/AssignmentStats.vue'
import AssignmentToolbar from '@/features/assignments/components/AssignmentToolbar.vue'
import AssignmentList from '@/features/assignments/components/AssignmentList.vue'
import AssignmentFormModal from '@/features/assignments/components/AssignmentFormModal.vue'
import AiPlannerModal from '@/features/assignments/components/AiPlannerModal.vue'
import SparkLayer from '@/features/assignments/components/SparkLayer.vue'

import { useAssignmentStore } from '@/features/assignments/store/useAssignmentStore'
import { useToasts } from '@/shared/composables/useToasts'
import { useConfirm } from '@/shared/composables/useConfirm'
import { daysLeft, statusOf } from '@/features/assignments/helpers'
import type { Assignment, AssignmentDraft } from '@/features/assignments/types'

const router = useRouter()
const store = useAssignmentStore()
const { assignments, search, filter, filtered, stats } = storeToRefs(store)
const { create, update, remove, find, toggleComplete } = store

const { push } = useToasts()
const { confirm } = useConfirm()

function openDetail(id: number): void {
  router.push({ name: 'assignment-detail', params: { id } })
}

// --- Create / edit modal ---
const formOpen = ref(false)
const editing = ref<Assignment | null>(null)

function openCreate(): void {
  editing.value = null
  formOpen.value = true
}

function openEdit(id: number): void {
  editing.value = find(id) ?? null
  formOpen.value = true
}

function onSubmit(draft: AssignmentDraft): void {
  if (editing.value) {
    update(editing.value.id, draft)
    push('Assignment updated', 'check-check', 'emerald')
  } else {
    create(draft)
    push('Assignment created', 'sparkles', 'emerald')
  }
}

// --- AI planner modal ---
const aiOpen = ref(false)
const preselectId = ref<number | null>(null)

function openPlanner(id: number | null): void {
  preselectId.value = id
  aiOpen.value = true
}

// --- Card actions ---
function onToggle(id: number): void {
  const a = find(id)
  const becameDone = toggleComplete(id)
  if (a && becameDone) push(`"${a.title}" completed! 🎉`, 'party', 'emerald')
}

async function onRemove(id: number): Promise<void> {
  const a = find(id)
  const ok = await confirm({
    title: 'Delete assignment?',
    message: a ? `"${a.title}" and all of its tasks will be permanently removed.` : undefined,
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return
  remove(id)
  push('Assignment deleted', 'trash', 'danger')
}

const completedLabel = computed(() => `${stats.value.done} completed`)

// --- Proactive deadline reminders on load ---
function showReminders(): void {
  const soon = assignments.value
    .filter((a) => statusOf(a) !== 'done')
    .map((a) => ({ a, dl: daysLeft(a.deadline) }))
    .filter((x) => x.dl <= 3)
    .sort((p, q) => p.dl - q.dl)

  if (!soon.length) {
    push("You're all caught up — no deadlines in the next 3 days ✨", 'check-check', 'emerald')
    return
  }

  soon.slice(0, 3).forEach((x, i) => {
    window.setTimeout(() => {
      if (x.dl < 0) push(`<b>${x.a.title}</b> is ${Math.abs(x.dl)} day(s) overdue!`, 'alarm', 'danger')
      else if (x.dl === 0) push(`<b>${x.a.title}</b> is due today — don't miss it!`, 'alarm', 'danger')
      else push(`<b>${x.a.title}</b> is due in ${x.dl} day(s).`, 'clock', 'amber')
    }, i * 350)
  })
}

onMounted(() => {
  window.setTimeout(showReminders, 900)
})
</script>

<template>
  <!-- Hero -->
  <section class="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-5 rise d2">
    <div>
      <p class="text-[12px] font-semibold tracking-[.16em] text-muted uppercase">Assignments</p>
      <h2 class="font-display font-extrabold text-[30px] md:text-[36px] leading-tight mt-1 text-ink">
        <span class="greet-word gw1">My</span>
        <span class="greet-word gw2 grad-text">Assignments</span>
      </h2>
      <p class="text-[14.5px] text-muted mt-1.5">
        <span class="font-semibold text-emerald-ink">{{ completedLabel }}</span>
        — keep the momentum going.
      </p>
    </div>

    <div class="flex items-center gap-3 self-start xl:self-auto">
      <button
        type="button"
        class="px-4 py-3 rounded-xl border border-indigo/30 text-indigo-ink text-[14px] font-semibold flex items-center gap-2 hover:bg-indigo/10 transition ai-btn"
        @click="openPlanner(null)"
      >
        <Sparkles class="h-4.5 w-4.5" /> AI Planner
      </button>
      <button
        type="button"
        class="px-5 py-3 rounded-xl text-white text-[14px] font-semibold flex items-center gap-2 shadow-lg shadow-emerald/25 hover:-translate-y-0.5 transition"
        style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
        @click="openCreate"
      >
        <Plus class="h-4.5 w-4.5" /> New Assignment
      </button>
    </div>
  </section>

  <AssignmentStats :stats="stats" />

  <AssignmentToolbar v-model:search="search" v-model:filter="filter" />

  <AssignmentList
    :assignments="filtered"
    @open="openDetail"
    @toggle="onToggle"
    @edit="openEdit"
    @remove="onRemove"
    @plan="openPlanner"
  />

  <AssignmentFormModal v-model:open="formOpen" :editing="editing" @submit="onSubmit" />

  <AiPlannerModal
    v-model:open="aiOpen"
    :assignments="assignments"
    :preselect-id="preselectId"
  />

  <SparkLayer />
</template>
