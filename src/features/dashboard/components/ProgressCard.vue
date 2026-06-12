<script setup lang="ts">
import { computed } from 'vue'

import SectionHeader from './SectionHeader.vue'
import type { ProgressCounts } from '@/features/dashboard/composables/useDashboardProgress'

const props = defineProps<{
  completionPct: number
  counts: ProgressCounts
}>()

// Circumference of the r=54 ring (matches the prototype's 339).
const CIRCUMFERENCE = 339

const ringOffset = computed(
  () => CIRCUMFERENCE - (CIRCUMFERENCE * props.completionPct) / 100,
)
const doneBarWidth = computed(() => `${props.completionPct}%`)
</script>

<template>
  <section class="card p-5 flex flex-col">
    <SectionHeader title="Progress" gradient="linear-gradient(var(--emerald), var(--indigo))" />

    <div class="flex-1 flex items-center gap-6">
      <!-- Donut -->
      <div class="relative h-[120px] w-[120px] shrink-0">
        <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" stroke-width="11" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#progress-ring)"
            stroke-width="11"
            stroke-linecap="round"
            stroke-dasharray="339"
            :stroke-dashoffset="ringOffset"
            style="transition: stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)"
          />
          <defs>
            <linearGradient id="progress-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 grid place-items-center text-center">
          <div>
            <p class="text-[24px] font-display font-extrabold text-ink">{{ completionPct }}%</p>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Done</p>
          </div>
        </div>
      </div>

      <!-- Legend bars -->
      <div class="flex-1 space-y-3.5">
        <div>
          <div class="flex items-center justify-between text-[12.5px] mb-1.5">
            <span class="flex items-center gap-2 text-muted">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo"></span> On track
            </span>
            <span class="font-bold text-ink">{{ counts.onTrack }}</span>
          </div>
          <div class="h-2 rounded-full bg-bg overflow-hidden">
            <div class="bar-fill h-full bg-indigo rounded-full" style="width: 6%"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between text-[12.5px] mb-1.5">
            <span class="flex items-center gap-2 text-muted">
              <span class="h-2.5 w-2.5 rounded-full bg-danger"></span> Behind
            </span>
            <span class="font-bold text-ink">{{ counts.behind }}</span>
          </div>
          <div class="h-2 rounded-full bg-bg overflow-hidden">
            <div class="bar-fill h-full bg-danger rounded-full" style="width: 100%"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between text-[12.5px] mb-1.5">
            <span class="flex items-center gap-2 text-muted">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald"></span> Done
            </span>
            <span class="font-bold text-ink">{{ counts.done }}</span>
          </div>
          <div class="h-2 rounded-full bg-bg overflow-hidden">
            <div
              class="h-full bg-emerald rounded-full transition-all duration-700"
              :style="{ width: doneBarWidth }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
