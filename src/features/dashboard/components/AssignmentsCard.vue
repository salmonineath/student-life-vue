<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowRight, Check, ChevronRight } from 'lucide-vue-next'

import SectionHeader from './SectionHeader.vue'
import StatNumber from './StatNumber.vue'
import type { DashboardAssignment } from '@/features/dashboard/types'
import type { ProgressCounts } from '@/features/dashboard/composables/useDashboardProgress'

const props = defineProps<{
  assignment: DashboardAssignment
  counts: ProgressCounts
  done: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

// --- "pop" feedback on the checkbox ---
const popping = ref(false)

// --- celebratory sparks ---
interface Spark {
  id: number
  char: string
  left: number
  color: string
  size: number
  delay: number
}
const sparks = ref<Spark[]>([])
let sparkId = 0
const SPARK_CHARS = ['✦', '✶', '✨', '●']
const SPARK_COLORS = ['#10B981', '#4F46E5', '#F59E0B']
const SPARK_COUNT = 6
// Sparks auto-remove after this timeout, which must exceed the CSS spark
// animation duration so they don't get yanked mid-animation.
const SPARK_LIFETIME_MS = 950

function spawnSparks(): void {
  for (let i = 0; i < SPARK_COUNT; i++) {
    const id = sparkId++
    sparks.value.push({
      id,
      // Cycle through the palettes by index so consecutive sparks vary in
      // look without needing per-spark randomness.
      char: SPARK_CHARS[i % SPARK_CHARS.length],
      left: 8 + Math.random() * 16,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      size: 10 + Math.random() * 8,
      delay: i * 0.04,
    })
    window.setTimeout(() => {
      sparks.value = sparks.value.filter((s) => s.id !== id)
    }, SPARK_LIFETIME_MS)
  }
}

// Fire the pop + sparks whenever the task transitions to done.
watch(
  () => props.done,
  (isDone) => {
    if (!isDone) return
    popping.value = true
    spawnSparks()
    window.setTimeout(() => {
      popping.value = false
    }, 420)
  },
)
</script>

<template>
  <section class="card p-5">
    <SectionHeader
      title="Assignments"
      gradient="linear-gradient(var(--indigo), var(--emerald))"
    >
      <template #action>
        <a
          href="#"
          class="text-[13px] font-semibold text-indigo-ink flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          View all <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </template>
    </SectionHeader>

    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="rounded-2xl border border-indigo/30 bg-indigo/10 p-4">
        <p class="text-[26px] font-display font-extrabold text-indigo-ink">
          <StatNumber :value="counts.upcoming" />
        </p>
        <p class="text-[10.5px] font-semibold uppercase tracking-wide text-indigo-ink mt-0.5">
          Upcoming
        </p>
      </div>
      <div class="rounded-2xl border border-danger/30 bg-danger/10 p-4">
        <p class="text-[26px] font-display font-extrabold text-danger-ink">
          <StatNumber :value="counts.overdue" />
        </p>
        <p class="text-[10.5px] font-semibold uppercase tracking-wide text-danger-ink mt-0.5">
          Overdue
        </p>
      </div>
      <div class="rounded-2xl border border-emerald/30 bg-emerald/10 p-4">
        <p class="text-[26px] font-display font-extrabold text-emerald-ink">
          <StatNumber :value="counts.done" :animate="false" />
        </p>
        <p class="text-[10.5px] font-semibold uppercase tracking-wide text-emerald-ink mt-0.5">
          Done
        </p>
      </div>
    </div>

    <!-- interactive task -->
    <div
      class="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border hover:bg-bg transition relative"
      :class="{ 'task-done': done }"
    >
      <button
        type="button"
        class="h-7 w-7 rounded-lg border-2 border-emerald grid place-items-center text-white transition shrink-0"
        :class="{ pop: popping }"
        :style="{ background: done ? 'var(--emerald)' : 'transparent' }"
        aria-label="Mark assignment done"
        @click="emit('toggle')"
      >
        <Check class="h-4 w-4 transition" :class="done ? 'opacity-100' : 'opacity-0'" />
        <span
          v-for="spark in sparks"
          :key="spark.id"
          class="spark"
          :style="{
            left: `${spark.left}px`,
            top: '0px',
            color: spark.color,
            fontSize: `${spark.size}px`,
            animationDelay: `${spark.delay}s`,
          }"
        >
          {{ spark.char }}
        </span>
      </button>
      <div class="flex-1 min-w-0">
        <p class="task-title font-semibold text-[14.5px] text-ink">{{ assignment.title }}</p>
        <p class="text-[12.5px] text-muted mt-0.5 flex items-center gap-1.5">
          <span
            class="px-1.5 py-0.5 rounded-md bg-indigo/15 text-indigo-ink text-[10.5px] font-bold tracking-wide"
          >
            {{ assignment.tag }}
          </span>
          {{ assignment.due }}
        </p>
      </div>
      <ChevronRight class="h-4 w-4 text-muted shrink-0" />
    </div>
    <p class="text-[12px] text-muted text-center mt-3">
      Tip: tick it off to watch your progress climb ✨
    </p>
  </section>
</template>
