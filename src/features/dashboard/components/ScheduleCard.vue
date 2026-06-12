<script setup lang="ts">
import { ArrowRight, Coffee } from 'lucide-vue-next'

import SectionHeader from './SectionHeader.vue'
import type { DashboardAssignment } from '@/features/dashboard/types'

const props = defineProps<{ assignment: DashboardAssignment }>()

const liveBarStyle = {
  width: `${props.assignment.progress}%`,
  background: 'linear-gradient(90deg, var(--emerald), var(--emerald-dark))',
}
</script>

<template>
  <section class="card p-5">
    <SectionHeader title="Schedule" gradient="linear-gradient(var(--emerald), var(--indigo))">
      <template #action>
        <a
          href="#"
          class="text-[13px] font-semibold text-indigo-ink flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          Full view <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </template>
    </SectionHeader>

    <div
      class="rounded-2xl border border-emerald/40 bg-gradient-to-br from-emerald/[.12] to-emerald/[.02] p-5"
    >
      <div class="flex items-center justify-between">
        <span
          class="inline-flex items-center gap-2 text-[11.5px] font-bold tracking-wide text-emerald-ink uppercase"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-emerald pulse-dot"></span> Live now
        </span>
        <span class="text-[12.5px] font-medium text-muted">8:00 AM – 11:59 PM</span>
      </div>
      <p class="font-display font-bold text-[18px] text-ink mt-2.5">{{ assignment.title }}</p>
      <div class="flex items-center gap-3 mt-4">
        <div class="flex-1 h-2.5 rounded-full bg-emerald/15 overflow-hidden">
          <div class="bar-fill h-full rounded-full" :style="liveBarStyle"></div>
        </div>
        <span class="text-[13px] font-bold text-emerald-ink">{{ assignment.progress }}%</span>
      </div>
    </div>

    <!-- Upcoming slot -->
    <div class="mt-4 space-y-2.5">
      <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition">
        <div class="text-center w-12 shrink-0">
          <p class="text-[11px] text-muted">Later</p>
          <p class="text-[13px] font-bold text-ink">—</p>
        </div>
        <div class="h-9 w-1 rounded-full bg-indigo/30"></div>
        <div class="flex-1">
          <p class="text-[14px] font-semibold text-ink">No more classes today</p>
          <p class="text-[12px] text-muted">Enjoy a calm afternoon 🌿</p>
        </div>
        <Coffee class="h-5 w-5 text-muted" />
      </div>
    </div>
  </section>
</template>
