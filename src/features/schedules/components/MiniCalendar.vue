<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import {
  addMonths,
  formatMonthYear,
  isSameDay,
  isToday,
  monthGridDates,
} from '@/features/schedules/helpers'

const store = useScheduleStore()

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const cursor = ref<Date>(store.focusDate)

// Follow the main calendar when its focus changes.
watch(
  () => store.focusISO,
  () => {
    cursor.value = store.focusDate
  },
)

function hasEvents(d: Date): boolean {
  return store.eventsOnDay(d).length > 0
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <p class="font-display font-bold text-[14px] text-ink">{{ formatMonthYear(cursor) }}</p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="h-7 w-7 grid place-items-center rounded-lg border border-border text-muted hover:bg-bg transition"
          @click="cursor = addMonths(cursor, -1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="h-7 w-7 grid place-items-center rounded-lg border border-border text-muted hover:bg-bg transition"
          @click="cursor = addMonths(cursor, 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-y-1 text-center">
      <span v-for="(w, i) in WEEKDAYS" :key="i" class="text-[10.5px] font-semibold text-muted">
        {{ w }}
      </span>
      <button
        v-for="d in monthGridDates(cursor)"
        :key="d.toISOString()"
        type="button"
        class="relative h-7 w-7 mx-auto grid place-items-center rounded-full text-[12px] transition"
        :class="[
          isSameDay(d, store.focusDate)
            ? 'bg-emerald text-white font-bold'
            : isToday(d)
              ? 'text-emerald-ink font-bold'
              : d.getMonth() === cursor.getMonth()
                ? 'text-ink hover:bg-bg'
                : 'text-muted/40 hover:bg-bg',
        ]"
        @click="store.selectDate(d)"
      >
        {{ d.getDate() }}
        <span
          v-if="hasEvents(d) && !isSameDay(d, store.focusDate)"
          class="absolute bottom-0.5 h-1 w-1 rounded-full bg-indigo"
        ></span>
      </button>
    </div>
  </div>
</template>
