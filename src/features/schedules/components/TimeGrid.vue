<script setup lang="ts">
import { computed } from 'vue'

import EventBlock from './EventBlock.vue'
import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import type { ScheduleEventDraft } from '@/features/schedules/types'
import {
  END_HOUR,
  HOUR_PX,
  HOURS,
  START_HOUR,
  formatHourLabel,
  isToday,
  layoutDayEvents,
  timeToMinutes,
  toISO,
} from '@/features/schedules/helpers'

const props = defineProps<{ days: Date[] }>()

const emit = defineEmits<{
  open: [id: number]
  create: [draft: Partial<ScheduleEventDraft>]
}>()

const store = useScheduleStore()

const gridTemplate = computed(() => `60px repeat(${props.days.length}, minmax(0, 1fr))`)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Absolute position for one laid-out event. */
function blockStyle(start: string, end: string, lane: number, lanes: number) {
  const top = ((timeToMinutes(start) - START_HOUR * 60) / 60) * HOUR_PX
  const height = ((timeToMinutes(end) - timeToMinutes(start)) / 60) * HOUR_PX
  return {
    top: `${top}px`,
    height: `${Math.max(height - 3, 18)}px`,
    left: `calc(${(lane / lanes) * 100}% + 2px)`,
    width: `calc(${100 / lanes}% - 4px)`,
  }
}

function laidOut(d: Date) {
  return layoutDayEvents(store.eventsOnDay(d))
}

/** Current-time indicator offset (px from grid top), or null if off-grid. */
const nowOffset = computed<number | null>(() => {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (mins < START_HOUR * 60 || mins > END_HOUR * 60) return null
  return ((mins - START_HOUR * 60) / 60) * HOUR_PX
})

function onColumnClick(d: Date, e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const y = e.clientY - rect.top
  const rawMin = START_HOUR * 60 + (y / HOUR_PX) * 60
  const snapped = Math.max(START_HOUR * 60, Math.min(Math.round(rawMin / 30) * 30, (END_HOUR - 1) * 60))
  const start = `${`${Math.floor(snapped / 60)}`.padStart(2, '0')}:${`${snapped % 60}`.padStart(2, '0')}`
  const endMin = snapped + 60
  const end = `${`${Math.floor(endMin / 60)}`.padStart(2, '0')}:${`${endMin % 60}`.padStart(2, '0')}`
  emit('create', { date: toISO(d), start, end })
}
</script>

<template>
  <div class="rounded-2xl border border-border overflow-hidden bg-white">
    <!-- Day headers -->
    <div class="grid border-b border-border bg-bg/60" :style="{ gridTemplateColumns: gridTemplate }">
      <div></div>
      <div
        v-for="d in days"
        :key="d.toISOString()"
        class="px-2 py-2.5 text-center border-l border-border"
      >
        <p class="text-[10.5px] font-semibold tracking-wide text-muted uppercase">
          {{ WEEKDAYS[d.getDay()] }}
        </p>
        <p
          class="mt-0.5 inline-grid place-items-center h-7 w-7 rounded-full text-[13.5px] font-bold mx-auto"
          :class="isToday(d) ? 'bg-emerald text-white' : 'text-ink'"
        >
          {{ d.getDate() }}
        </p>
      </div>
    </div>

    <!-- Scrollable time body -->
    <div class="overflow-y-auto" style="max-height: calc(100vh - 320px)">
      <div class="grid relative" :style="{ gridTemplateColumns: gridTemplate }">
        <!-- Hour gutter -->
        <div>
          <div
            v-for="h in HOURS"
            :key="h"
            class="relative text-right pr-2"
            :style="{ height: `${HOUR_PX}px` }"
          >
            <span class="absolute -top-2 right-2 text-[10.5px] font-medium text-muted">
              {{ formatHourLabel(h) }}
            </span>
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="d in days"
          :key="d.toISOString()"
          class="relative border-l border-border cursor-copy"
          @click="onColumnClick(d, $event)"
        >
          <!-- hour cells (grid lines) -->
          <div
            v-for="h in HOURS"
            :key="h"
            class="border-t border-border/50"
            :style="{ height: `${HOUR_PX}px` }"
          ></div>

          <!-- now indicator -->
          <div
            v-if="nowOffset !== null && isToday(d)"
            class="absolute left-0 right-0 z-10 pointer-events-none"
            :style="{ top: `${nowOffset}px` }"
          >
            <div class="h-0.5 bg-danger"></div>
            <div class="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-danger"></div>
          </div>

          <!-- events -->
          <div
            v-for="item in laidOut(d)"
            :key="item.event.id"
            class="absolute"
            :style="blockStyle(item.event.start, item.event.end, item.lane, item.lanes)"
          >
            <EventBlock :event="item.event" :dense="days.length > 1" @open="emit('open', $event)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
