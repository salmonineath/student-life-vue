<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calendar, Play, Plus } from 'lucide-vue-next'

import StatNumber from './StatNumber.vue'

defineProps<{
  classesToday: number
  dueThisWeek: number
  completionPct: number
}>()

// Reactive gradient swap for the primary button (was inline onmouseover/out).
const focusHover = ref(false)
const focusBg = computed(() =>
  focusHover.value
    ? 'linear-gradient(135deg, var(--emerald-dark), var(--emerald-dark))'
    : 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))',
)
</script>

<template>
  <section class="card relative overflow-hidden p-5 md:p-6">
    <!-- decorative blobs -->
    <div
      class="absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-20 blur-2xl"
      style="background: radial-gradient(circle, var(--emerald), transparent 70%)"
    ></div>
    <div
      class="absolute -bottom-20 right-40 h-48 w-48 rounded-full opacity-10 blur-2xl"
      style="background: radial-gradient(circle, var(--indigo), transparent 70%)"
    ></div>

    <div class="flex flex-col xl:flex-row xl:items-center gap-8 justify-between relative">
      <div>
        <p
          class="text-[12px] font-semibold tracking-[.14em] text-muted uppercase flex items-center gap-2"
        >
          <Calendar class="h-3.5 w-3.5 text-emerald" /> Friday, June 12
        </p>
        <h2
          class="font-display font-extrabold text-[30px] md:text-[36px] leading-tight mt-2 text-ink"
        >
          <span class="greet-word gw1">Good</span>
          <span class="greet-word gw2">morning,</span>
          <span class="greet-word gw3 grad-text">Student</span>
          <span class="wave text-[30px] md:text-[34px]">👋</span>
        </h2>
        <p class="text-[14.5px] text-muted mt-2">
          You have <span class="font-semibold text-amber-ink">{{ dueThisWeek }} deadline</span> this
          week — stay focused, you've got this.
        </p>

        <div class="flex flex-wrap gap-2.5 mt-5">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-white text-[13.5px] font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald/25 hover:-translate-y-0.5"
            :style="{ background: focusBg }"
            @mouseenter="focusHover = true"
            @mouseleave="focusHover = false"
          >
            <Play class="h-4 w-4" /> Start focus session
          </button>
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-white border border-border text-ink text-[13.5px] font-semibold flex items-center gap-2 hover:bg-bg transition"
          >
            <Plus class="h-4 w-4" /> Add task
          </button>
        </div>
      </div>

      <!-- Stat pills -->
      <div class="grid grid-cols-3 gap-3 shrink-0">
        <div class="stat-pill rounded-2xl border border-indigo/30 bg-indigo/10 p-4 w-[112px] text-center">
          <p class="text-[28px] font-display font-extrabold text-indigo-ink">
            <StatNumber :value="classesToday" />
          </p>
          <p class="text-[10.5px] font-semibold tracking-wide text-indigo-ink uppercase mt-1 leading-tight">
            Classes<br />today
          </p>
        </div>
        <div class="stat-pill rounded-2xl border border-amber/40 bg-amber/15 p-4 w-[112px] text-center">
          <p class="text-[28px] font-display font-extrabold text-amber-ink">
            <StatNumber :value="dueThisWeek" />
          </p>
          <p class="text-[10.5px] font-semibold tracking-wide text-amber-ink uppercase mt-1 leading-tight">
            Due this<br />week
          </p>
        </div>
        <div class="stat-pill rounded-2xl border border-emerald/40 bg-emerald/10 p-4 w-[112px] text-center">
          <p class="text-[28px] font-display font-extrabold text-emerald-ink">
            <StatNumber :value="completionPct" />%
          </p>
          <p class="text-[10.5px] font-semibold tracking-wide text-emerald-ink uppercase mt-1 leading-tight">
            Completion
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
