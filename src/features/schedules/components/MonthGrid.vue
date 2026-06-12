<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import type { ScheduleEventDraft } from '@/features/schedules/types'
import { CATEGORY_META, formatTime, isToday, monthGridDates, toISO } from '@/features/schedules/helpers'

const emit = defineEmits<{
  open: [id: number]
  create: [draft: Partial<ScheduleEventDraft>]
}>()

const store = useScheduleStore()

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const cells = computed(() => monthGridDates(store.focusDate))
const focusMonth = computed(() => store.focusDate.getMonth())

function inMonth(d: Date): boolean {
  return d.getMonth() === focusMonth.value
}
</script>

<template>
  <div class="rounded-2xl border border-border overflow-hidden bg-white">
    <!-- weekday header -->
    <div class="grid grid-cols-7 border-b border-border bg-bg/60">
      <div
        v-for="w in WEEKDAYS"
        :key="w"
        class="px-2 py-2.5 text-center text-[10.5px] font-semibold tracking-wide text-muted uppercase"
      >
        {{ w }}
      </div>
    </div>

    <!-- 6-week grid -->
    <div class="grid grid-cols-7" style="grid-auto-rows: minmax(108px, 1fr)">
      <div
        v-for="d in cells"
        :key="d.toISOString()"
        class="border-l border-t border-border first:border-l-0 p-1.5 flex flex-col gap-1 cursor-copy transition hover:bg-bg/60"
        :class="inMonth(d) ? '' : 'bg-bg/40'"
        @click="emit('create', { date: toISO(d) })"
      >
        <div class="flex items-center justify-end">
          <span
            class="inline-grid place-items-center h-6 w-6 rounded-full text-[12px] font-bold"
            :class="isToday(d)
              ? 'bg-emerald text-white'
              : inMonth(d)
                ? 'text-ink'
                : 'text-muted/50'"
          >
            {{ d.getDate() }}
          </span>
        </div>

        <div class="flex flex-col gap-1 min-h-0">
          <button
            v-for="ev in store.eventsOnDay(d).slice(0, 3)"
            :key="ev.id"
            type="button"
            class="text-left rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold truncate flex items-center gap-1 hover:shadow-sm transition"
            :class="CATEGORY_META[ev.category].block"
            :style="{ borderLeftWidth: '3px', borderLeftColor: CATEGORY_META[ev.category].dot }"
            @click.stop="emit('open', ev.id)"
          >
            <Star v-if="ev.important" class="h-2.5 w-2.5 shrink-0 fill-current" />
            <span class="opacity-80">{{ formatTime(ev.start) }}</span>
            <span class="truncate">{{ ev.title }}</span>
          </button>

          <span
            v-if="store.eventsOnDay(d).length > 3"
            class="text-[10.5px] font-semibold text-muted pl-1"
          >
            +{{ store.eventsOnDay(d).length - 3 }} more
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
