<script setup lang="ts">
import { BarChart3, BookOpen, CircleCheckBig, TriangleAlert } from 'lucide-vue-next'

import type { AssignmentStats } from '@/features/assignments/store/useAssignmentStore'

defineProps<{ stats: AssignmentStats }>()
</script>

<template>
  <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
    <div class="stat-pill card rise d3 p-4 flex items-center gap-4">
      <div class="h-12 w-12 rounded-2xl grid place-items-center bg-indigo/10 text-indigo-ink shrink-0">
        <BookOpen class="h-6 w-6" />
      </div>
      <div>
        <p class="text-[28px] font-display font-extrabold text-indigo-ink leading-none">
          {{ stats.total }}
        </p>
        <p class="text-[10.5px] font-semibold tracking-wide text-muted uppercase mt-1.5">Total</p>
      </div>
    </div>

    <div class="stat-pill card rise d3 p-4 flex items-center gap-4">
      <div class="h-12 w-12 rounded-2xl grid place-items-center bg-emerald/10 text-emerald-ink shrink-0">
        <CircleCheckBig class="h-6 w-6" />
      </div>
      <div>
        <p class="text-[28px] font-display font-extrabold text-emerald-ink leading-none">
          {{ stats.done }}
        </p>
        <p class="text-[10.5px] font-semibold tracking-wide text-muted uppercase mt-1.5">
          Completed
        </p>
      </div>
    </div>

    <div class="stat-pill card rise d4 p-4 flex items-center gap-4">
      <div class="h-12 w-12 rounded-2xl grid place-items-center bg-danger/10 text-danger-ink shrink-0">
        <TriangleAlert class="h-6 w-6" />
      </div>
      <div>
        <p class="text-[28px] font-display font-extrabold text-danger-ink leading-none">
          {{ stats.overdue }}
        </p>
        <p class="text-[10.5px] font-semibold tracking-wide text-muted uppercase mt-1.5">Overdue</p>
      </div>
    </div>

    <div class="stat-pill card rise d4 p-4 flex items-center gap-4">
      <div class="h-12 w-12 rounded-2xl grid place-items-center bg-amber/15 text-amber-ink shrink-0">
        <BarChart3 class="h-6 w-6" />
      </div>
      <div>
        <p class="text-[28px] font-display font-extrabold text-amber-ink leading-none">
          {{ stats.avgProgress }}%
        </p>
        <p class="text-[10.5px] font-semibold tracking-wide text-muted uppercase mt-1.5">
          Avg Progress
        </p>
      </div>
    </div>
  </section>
</template>
