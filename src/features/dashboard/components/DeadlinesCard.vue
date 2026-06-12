<script setup lang="ts">
import { ArrowRight, AlarmClock } from 'lucide-vue-next'

import SectionHeader from './SectionHeader.vue'
import type { DashboardAssignment } from '@/features/dashboard/types'

defineProps<{ assignment: DashboardAssignment }>()
</script>

<template>
  <section class="card p-5">
    <SectionHeader title="Deadlines" gradient="linear-gradient(var(--amber), var(--danger))">
      <template #action>
        <a
          href="#"
          class="text-[13px] font-semibold text-indigo-ink flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          View all <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </template>
    </SectionHeader>

    <div
      class="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-amber/40 hover:bg-amber/[.03] transition group"
    >
      <div class="h-11 w-11 rounded-xl grid place-items-center bg-amber/15 text-amber-ink shrink-0">
        <AlarmClock class="h-5 w-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-[14.5px] text-ink">{{ assignment.title }}</p>
        <p class="text-[12.5px] text-muted mt-0.5 flex items-center gap-1.5">
          <span
            class="px-1.5 py-0.5 rounded-md bg-indigo/15 text-indigo-ink text-[10.5px] font-bold tracking-wide"
          >
            {{ assignment.tag }}
          </span>
          {{ assignment.due }}
        </p>
      </div>
      <span
        class="text-[11px] font-bold text-white bg-amber-ink px-3 py-1.5 rounded-full uppercase tracking-wide shrink-0"
      >
        Due soon
      </span>
    </div>
  </section>
</template>
