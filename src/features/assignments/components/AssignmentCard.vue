<script setup lang="ts">
import { computed } from 'vue'
import {
  AlarmClock,
  Calendar,
  Check,
  Clock,
  Pencil,
  RotateCcw,
  Sparkles,
  Trash2,
  UserPlus,
  type LucideIcon,
} from 'lucide-vue-next'

import type { Assignment, SubjectAccent } from '@/features/assignments/types'
import {
  ACCENT_HEX,
  daysLeft,
  formatDeadline,
  statusOf,
  subjectAccent,
} from '@/features/assignments/helpers'
import { useSparks } from '@/features/assignments/composables/useSparks'

const props = defineProps<{ assignment: Assignment }>()

const { burst } = useSparks()

/** Complete: fire a spark burst at the click point, then toggle. */
function onComplete(ev: MouseEvent): void {
  const target = ev.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  // Anchor the burst to the button's top-center regardless of viewport scroll/layout.
  burst(rect.left + rect.width / 2, rect.top)
  emit('toggle', props.assignment.id)
}

const emit = defineEmits<{
  open: [id: number]
  toggle: [id: number]
  edit: [id: number]
  remove: [id: number]
  plan: [id: number]
}>()

const taskSummary = computed(() => {
  const tasks = props.assignment.tasks
  if (!tasks.length) return null
  return { done: tasks.filter((t) => t.status === 'done').length, total: tasks.length }
})

const status = computed(() => statusOf(props.assignment))
const accent = computed<SubjectAccent>(() => subjectAccent(props.assignment.subject))

// Full literal class strings so Tailwind's scanner picks them up.
const TAG_CLASSES: Record<SubjectAccent, string> = {
  indigo: 'text-indigo-ink bg-indigo/12',
  emerald: 'text-emerald-ink bg-emerald/12',
  amber: 'text-amber-ink bg-amber/12',
  danger: 'text-danger-ink bg-danger/12',
}

// Progress bar color signals urgency: green once done, red once overdue,
// amber otherwise — independent of the badge below, which also shows day counts.
const barGradient = computed(() => {
  if (status.value === 'done') return 'linear-gradient(90deg, var(--emerald), var(--emerald-dark))'
  if (daysLeft(props.assignment.deadline) < 0) return 'linear-gradient(90deg, var(--danger), #dc2626)'
  return 'linear-gradient(90deg, var(--amber), #d97706)'
})

interface Badge {
  icon: LucideIcon
  label: string
  class: string
}

const badge = computed<Badge>(() => {
  if (status.value === 'done') {
    return {
      icon: Check,
      label: 'Completed',
      class: 'text-emerald-ink bg-emerald/15',
    }
  }
  // Ordered from most to least urgent: overdue > due today > due soon (<=3d) > later.
  const dl = daysLeft(props.assignment.deadline)
  if (dl < 0) return { icon: AlarmClock, label: `${Math.abs(dl)}d overdue`, class: 'text-white bg-danger' }
  if (dl === 0) return { icon: AlarmClock, label: 'Due today', class: 'text-white bg-danger' }
  if (dl <= 3) return { icon: Clock, label: `${dl}d left`, class: 'text-amber-ink bg-amber/20' }
  return { icon: Clock, label: `${dl}d left`, class: 'text-indigo-ink bg-indigo/10' }
})
</script>

<template>
  <article
    class="acard pop-in p-4 cursor-pointer"
    :data-id="assignment.id"
    :style="{ '--accent': ACCENT_HEX[accent] }"
    @click="emit('open', assignment.id)"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="min-w-0">
        <h4
          class="font-display font-bold text-[15.5px] leading-snug truncate"
          :class="status === 'done' ? 'line-through text-muted' : 'text-ink'"
        >
          {{ assignment.title }}
        </h4>
        <span
          class="inline-block mt-1.5 text-[10.5px] font-bold tracking-wide px-2 py-0.5 rounded-md uppercase"
          :class="TAG_CLASSES[accent]"
        >
          {{ assignment.subject || 'General' }}
        </span>
      </div>
      <span
        class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
        :class="badge.class"
      >
        <component :is="badge.icon" class="h-3 w-3" /> {{ badge.label }}
      </span>
    </div>

    <p
      v-if="assignment.desc"
      class="text-[12.5px] text-muted leading-snug mb-3 line-clamp-2"
    >
      {{ assignment.desc }}
    </p>
    <div v-else class="mb-3"></div>

    <div class="mb-1 flex items-center justify-between text-[11px]">
      <span class="font-semibold tracking-wide text-muted uppercase">
        Progress
        <span v-if="taskSummary" class="normal-case font-medium text-muted/80">
          · {{ taskSummary.done }}/{{ taskSummary.total }} tasks
        </span>
      </span>
      <span class="font-bold" :class="status === 'done' ? 'text-emerald-ink' : 'text-ink'">
        {{ assignment.progress }}%
      </span>
    </div>
    <div class="h-2.5 rounded-full bg-bg overflow-hidden mb-3">
      <div
        class="bar-fill h-full rounded-full"
        :style="{ width: `${assignment.progress}%`, background: barGradient }"
      ></div>
    </div>

    <div class="flex items-center justify-between text-[12px] text-muted mb-3">
      <span class="flex items-center gap-1.5">
        <Calendar class="h-3.5 w-3.5" /> {{ formatDeadline(assignment.deadline) }}
      </span>
      <span
        v-if="assignment.invites.length"
        class="flex items-center gap-1.5"
        :title="assignment.invites.join(', ')"
      >
        <UserPlus class="h-3.5 w-3.5" /> {{ assignment.invites.length }} invited
      </span>
    </div>

    <div class="flex items-center gap-2" @click.stop>
      <button
        v-if="status === 'done'"
        type="button"
        class="flex-1 py-2 rounded-xl text-[12.5px] font-semibold border border-border text-muted hover:bg-bg transition flex items-center justify-center gap-1.5"
        @click="emit('toggle', assignment.id)"
      >
        <RotateCcw class="h-3.5 w-3.5" /> Reopen
      </button>
      <button
        v-else
        type="button"
        class="flex-1 py-2 rounded-xl text-[12.5px] font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald/20 hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
        @click="onComplete"
      >
        <Check class="h-3.5 w-3.5" /> Complete
      </button>

      <button
        type="button"
        title="AI study plan"
        class="h-9 w-9 grid place-items-center rounded-xl border border-indigo/30 text-indigo-ink hover:bg-indigo/10 transition"
        @click="emit('plan', assignment.id)"
      >
        <Sparkles class="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Edit"
        class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
        @click="emit('edit', assignment.id)"
      >
        <Pencil class="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Delete"
        class="h-9 w-9 grid place-items-center rounded-xl border border-danger/30 text-danger-ink hover:bg-danger/10 transition"
        @click="emit('remove', assignment.id)"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  </article>
</template>
