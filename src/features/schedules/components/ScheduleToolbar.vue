<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'

import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import type { ScheduleView } from '@/features/schedules/types'
import { formatLongDate, formatMonthYear } from '@/features/schedules/helpers'

const emit = defineEmits<{ new: [] }>()

const store = useScheduleStore()

const heading = computed(() =>
  store.view === 'day' ? formatLongDate(store.focusDate) : formatMonthYear(store.focusDate),
)

const VIEWS: { value: ScheduleView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
    <h2 class="font-display font-extrabold text-[22px] md:text-[26px] text-ink">{{ heading }}</h2>

    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- View toggle -->
      <div class="flex items-center gap-1 bg-white border border-border rounded-xl p-1">
        <button
          v-for="v in VIEWS"
          :key="v.value"
          type="button"
          class="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition"
          :style="
            store.view === v.value
              ? { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))', color: '#fff' }
              : { color: '#4B5563' }
          "
          @click="store.setView(v.value)"
        >
          {{ v.label }}
        </button>
      </div>

      <!-- Nav -->
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl bg-white border border-border text-ink text-[13px] font-semibold hover:bg-bg transition"
          @click="store.goToday()"
        >
          Today
        </button>
        <button
          type="button"
          class="h-9 w-9 grid place-items-center rounded-xl bg-white border border-border text-muted hover:bg-bg transition"
          aria-label="Previous"
          @click="store.step(-1)"
        >
          <ChevronLeft class="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          class="h-9 w-9 grid place-items-center rounded-xl bg-white border border-border text-muted hover:bg-bg transition"
          aria-label="Next"
          @click="store.step(1)"
        >
          <ChevronRight class="h-4.5 w-4.5" />
        </button>
      </div>

      <button
        type="button"
        class="px-4 py-2.5 rounded-xl text-white text-[13.5px] font-semibold flex items-center gap-2 shadow-lg shadow-emerald/25 hover:-translate-y-0.5 transition"
        style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
        @click="emit('new')"
      >
        <Plus class="h-4 w-4" /> New event
      </button>
    </div>
  </div>
</template>
