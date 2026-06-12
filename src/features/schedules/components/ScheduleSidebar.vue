<script setup lang="ts">
import { computed } from 'vue'
import { CalendarClock, ChartNoAxesColumn, MapPin, Star } from 'lucide-vue-next'

import MiniCalendar from './MiniCalendar.vue'
import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import { CATEGORY_META, formatTime, parseDate, isToday } from '@/features/schedules/helpers'

const emit = defineEmits<{ open: [id: number] }>()

const store = useScheduleStore()

const upcomingDateLabel = computed(() => {
  const e = store.upcoming
  if (!e) return ''
  const d = parseDate(e.date)
  return isToday(d) ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

// Breakdown bars scaled against the busiest category.
const maxMinutes = computed(() => Math.max(1, ...store.weekBreakdown.map((b) => b.minutes)))
function hours(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Upcoming event -->
    <section class="card p-5">
      <p class="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-muted uppercase mb-3">
        <CalendarClock class="h-4 w-4 text-emerald" /> Upcoming event
      </p>

      <button
        v-if="store.upcoming"
        type="button"
        class="w-full text-left rounded-2xl border p-4 transition hover:shadow-md hover:-translate-y-0.5"
        :class="CATEGORY_META[store.upcoming.category].block"
        :style="{ borderLeftWidth: '4px', borderLeftColor: CATEGORY_META[store.upcoming.category].dot }"
        @click="emit('open', store.upcoming.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wide opacity-80">
            {{ CATEGORY_META[store.upcoming.category].label }}
          </span>
          <Star v-if="store.upcoming.important" class="h-3.5 w-3.5 fill-current" />
        </div>
        <p class="font-display font-bold text-[15.5px] text-ink mt-1.5 leading-snug">
          {{ store.upcoming.title }}
        </p>
        <div class="flex items-center gap-3 mt-2 text-[12px] text-muted">
          <span class="font-semibold">{{ upcomingDateLabel }}</span>
          <span>{{ formatTime(store.upcoming.start) }} – {{ formatTime(store.upcoming.end) }}</span>
        </div>
        <p v-if="store.upcoming.location" class="flex items-center gap-1 mt-1 text-[12px] text-muted">
          <MapPin class="h-3.5 w-3.5" /> {{ store.upcoming.location }}
        </p>
      </button>

      <div v-else class="rounded-2xl border-2 border-dashed border-border/70 py-8 text-center text-muted">
        <p class="text-[12.5px] font-medium">Nothing coming up — enjoy the calm 🌿</p>
      </div>
    </section>

    <!-- Mini calendar -->
    <section class="card p-5">
      <MiniCalendar />
    </section>

    <!-- Week breakdown -->
    <section class="card p-5">
      <p class="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-muted uppercase mb-4">
        <ChartNoAxesColumn class="h-4 w-4 text-indigo" /> This week's time
      </p>

      <div v-if="store.weekBreakdown.length" class="space-y-3">
        <div v-for="b in store.weekBreakdown" :key="b.category" class="flex items-center gap-3">
          <span class="w-16 shrink-0 text-[12px] font-medium text-ink flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full" :style="{ background: CATEGORY_META[b.category].bar }"></span>
            {{ CATEGORY_META[b.category].label }}
          </span>
          <div class="flex-1 h-2.5 rounded-full bg-bg overflow-hidden">
            <div
              class="h-full rounded-full bar-fill"
              :style="{ width: `${(b.minutes / maxMinutes) * 100}%`, background: CATEGORY_META[b.category].bar }"
            ></div>
          </div>
          <span class="w-12 text-right text-[11.5px] font-semibold text-muted">{{ hours(b.minutes) }}</span>
        </div>
      </div>
      <p v-else class="text-[12.5px] text-muted text-center py-3">No events scheduled this week.</p>
    </section>
  </div>
</template>
