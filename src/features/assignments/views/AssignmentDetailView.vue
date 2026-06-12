<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlarmClock,
  ArrowLeft,
  Calendar,
  Check,
  CircleCheckBig,
  Clock,
  ClipboardX,
  type LucideIcon,
} from 'lucide-vue-next'

import AssignmentTaskList from '@/features/assignments/components/AssignmentTaskList.vue'
import AssignmentPlanPanel from '@/features/assignments/components/AssignmentPlanPanel.vue'
import ToastStack from '@/shared/components/ToastStack.vue'

import { useAssignmentStore } from '@/features/assignments/store/useAssignmentStore'
import { useToasts } from '@/shared/composables/useToasts'
import {
  ACCENT_HEX,
  daysLeft,
  formatDeadline,
  statusOf,
  subjectAccent,
} from '@/features/assignments/helpers'
import type { SubjectAccent } from '@/features/assignments/types'

const route = useRoute()
const router = useRouter()
const store = useAssignmentStore()
const { push } = useToasts()

const id = computed(() => Number(route.params.id))
const assignment = computed(() => store.find(id.value))

const accent = computed<SubjectAccent>(() =>
  assignment.value ? subjectAccent(assignment.value.subject) : 'indigo',
)

const TAG_CLASSES: Record<SubjectAccent, string> = {
  indigo: 'text-indigo-ink bg-indigo/12',
  emerald: 'text-emerald-ink bg-emerald/12',
  amber: 'text-amber-ink bg-amber/12',
  danger: 'text-danger-ink bg-danger/12',
}

interface Badge {
  icon: LucideIcon
  label: string
  class: string
}

const badge = computed<Badge>(() => {
  const a = assignment.value
  if (!a) return { icon: Clock, label: '', class: '' }
  if (statusOf(a) === 'done') {
    return { icon: Check, label: 'Completed', class: 'text-emerald-ink bg-emerald/15' }
  }
  const dl = daysLeft(a.deadline)
  if (dl < 0) return { icon: AlarmClock, label: `${Math.abs(dl)}d overdue`, class: 'text-white bg-danger' }
  if (dl === 0) return { icon: AlarmClock, label: 'Due today', class: 'text-white bg-danger' }
  if (dl <= 3) return { icon: Clock, label: `${dl}d left`, class: 'text-amber-ink bg-amber/20' }
  return { icon: Clock, label: `${dl}d left`, class: 'text-indigo-ink bg-indigo/10' }
})

const progressGradient = computed(() => {
  const a = assignment.value
  if (!a) return ''
  if (statusOf(a) === 'done') return 'linear-gradient(90deg, var(--emerald), var(--emerald-dark))'
  if (daysLeft(a.deadline) < 0) return 'linear-gradient(90deg, var(--danger), #dc2626)'
  return 'linear-gradient(90deg, var(--amber), #d97706)'
})

function goBack(): void {
  router.push({ name: 'assignments' })
}

function onAddTasks(titles: string[]): void {
  const added = store.addTasks(id.value, titles)
  if (added) push(`${added} task${added > 1 ? 's' : ''} added from the plan ✨`, 'sparkles', 'indigo')
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-muted hover:text-ink transition mb-4 rise d1"
    @click="goBack"
  >
    <ArrowLeft class="h-4 w-4" /> Back to assignments
  </button>

  <!-- Not found -->
  <div
    v-if="!assignment"
    class="card grid place-items-center text-center py-20 text-muted rise d2"
  >
    <ClipboardX class="h-9 w-9 mb-3 opacity-60" />
    <p class="font-display font-bold text-[17px] text-ink">Assignment not found</p>
    <p class="text-[13.5px] mt-1">It may have been deleted.</p>
    <button
      type="button"
      class="mt-5 px-4 py-2.5 rounded-xl text-white text-[13.5px] font-semibold"
      style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
      @click="goBack"
    >
      Back to assignments
    </button>
  </div>

  <template v-else>
    <!-- Header -->
    <section
      class="card p-5 md:p-6 mb-5 rise d2 relative overflow-hidden"
      :style="{ '--accent': ACCENT_HEX[accent] }"
    >
      <div
        class="absolute left-0 top-0 bottom-0 w-1.5"
        :style="{ background: ACCENT_HEX[accent] }"
      ></div>

      <div class="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pl-2">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span
              class="text-[10.5px] font-bold tracking-wide px-2 py-0.5 rounded-md uppercase"
              :class="TAG_CLASSES[accent]"
            >
              {{ assignment.subject || 'General' }}
            </span>
            <span
              class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
              :class="badge.class"
            >
              <component :is="badge.icon" class="h-3 w-3" /> {{ badge.label }}
            </span>
          </div>

          <h1
            class="font-display font-extrabold text-[26px] md:text-[30px] leading-tight mt-2 text-ink"
            :class="{ 'line-through text-muted': statusOf(assignment) === 'done' }"
          >
            {{ assignment.title }}
          </h1>

          <p v-if="assignment.desc" class="text-[14px] text-muted mt-2 max-w-2xl leading-relaxed">
            {{ assignment.desc }}
          </p>

          <div class="flex items-center gap-4 mt-3 text-[13px] text-muted">
            <span class="flex items-center gap-1.5">
              <Calendar class="h-4 w-4" /> Due {{ formatDeadline(assignment.deadline) }}
            </span>
            <span class="flex items-center gap-1.5">
              <CircleCheckBig class="h-4 w-4" />
              {{ assignment.tasks.filter((t) => t.status === 'done').length }}/{{ assignment.tasks.length }} tasks
            </span>
          </div>
        </div>

        <button
          type="button"
          class="self-start shrink-0 h-10 px-4 rounded-xl border border-border text-ink text-[13.5px] font-semibold flex items-center gap-2 hover:bg-bg transition"
          @click="store.toggleComplete(assignment.id)"
        >
          <Check class="h-4 w-4" />
          {{ statusOf(assignment) === 'done' ? 'Reopen' : 'Mark complete' }}
        </button>
      </div>

      <!-- Progress -->
      <div class="mt-5 pl-2">
        <div class="flex items-center justify-between text-[12.5px] mb-1.5">
          <span class="font-semibold tracking-wide text-muted uppercase">Overall progress</span>
          <span class="font-bold text-ink">{{ assignment.progress }}%</span>
        </div>
        <div class="h-3 rounded-full bg-bg overflow-hidden">
          <div
            class="bar-fill h-full rounded-full"
            :style="{ width: `${assignment.progress}%`, background: progressGradient }"
          ></div>
        </div>
      </div>
    </section>

    <!-- Tasks + AI plan -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="xl:col-span-2 rise d3">
        <AssignmentTaskList :assignment="assignment" />
      </div>
      <div class="rise d4">
        <AssignmentPlanPanel :assignment="assignment" @add-tasks="onAddTasks" />
      </div>
    </div>
  </template>

  <ToastStack />
</template>
