<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ScheduleSidebar from '@/features/schedules/components/ScheduleSidebar.vue'
import ScheduleToolbar from '@/features/schedules/components/ScheduleToolbar.vue'
import TimeGrid from '@/features/schedules/components/TimeGrid.vue'
import MonthGrid from '@/features/schedules/components/MonthGrid.vue'
import EventFormModal from '@/features/schedules/components/EventFormModal.vue'
import ToastStack from '@/shared/components/ToastStack.vue'

import { useScheduleStore } from '@/features/schedules/store/useScheduleStore'
import { useToasts } from '@/shared/composables/useToasts'
import { formatTime, parseDate, timeToMinutes, today } from '@/features/schedules/helpers'
import type { ScheduleEvent, ScheduleEventDraft } from '@/features/schedules/types'

const store = useScheduleStore()
const { push } = useToasts()

// Days passed to the time grid depend on the active view.
const gridDays = computed(() => (store.view === 'day' ? [store.focusDate] : store.visibleWeek))

// --- Event modal ---
const modalOpen = ref(false)
const editing = ref<ScheduleEvent | null>(null)
const defaults = ref<Partial<ScheduleEventDraft> | null>(null)

function openNew(prefill: Partial<ScheduleEventDraft> | null = null): void {
  editing.value = null
  defaults.value = prefill
  modalOpen.value = true
}

function openEdit(id: number): void {
  editing.value = store.find(id) ?? null
  defaults.value = null
  modalOpen.value = true
}

function onSubmit(draft: ScheduleEventDraft): void {
  if (editing.value) store.update(editing.value.id, draft)
  else store.create(draft)
}

function onRemove(id: number): void {
  store.remove(id)
}

// --- On-load briefing: today's agenda + next upcoming event ---
function showBriefing(): void {
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todays = store.eventsOnDay(today())

  // 1) What's happening today.
  if (todays.length) {
    const ongoing = todays.find(
      (e) => timeToMinutes(e.start) <= nowMin && timeToMinutes(e.end) > nowMin,
    )
    const nextUp = todays.find((e) => timeToMinutes(e.start) > nowMin)

    if (ongoing) {
      // Something is running right now.
      push(`Happening now: <b>${ongoing.title}</b> until ${formatTime(ongoing.end)}.`, 'calendar', 'emerald')
    } else if (nextUp) {
      // Still something to come today.
      push(`You have <b>${nextUp.title}</b> upcoming at ${formatTime(nextUp.start)}.`, 'calendar', 'indigo')
    } else {
      // Every event today has already finished.
      push(
        `All done for today 🎉 — ${todays.length} event${todays.length > 1 ? 's' : ''} completed.`,
        'check-check',
        'emerald',
      )
    }

    // Flag important items that haven't passed yet.
    const important = todays.filter((e) => e.important && timeToMinutes(e.end) >= nowMin)
    if (important.length) {
      window.setTimeout(
        () =>
          push(
            `⭐ Important today: <b>${important[0].title}</b> at ${formatTime(important[0].start)}.`,
            'star',
            'amber',
          ),
        450,
      )
    }
  } else {
    push("No events scheduled today — enjoy a clear day 🌿", 'calendar', 'emerald')
  }

  // 2) Next upcoming event on a future day.
  const todayD = today()
  const future = store.events
    .filter((e) => parseDate(e.date) > todayD)
    .sort(
      (a, b) =>
        parseDate(a.date).getTime() - parseDate(b.date).getTime() ||
        timeToMinutes(a.start) - timeToMinutes(b.start),
    )[0]
  if (future) {
    const label = parseDate(future.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    window.setTimeout(
      () => push(`Upcoming: <b>${future.title}</b> on ${label}, ${formatTime(future.start)}.`, 'clock', 'indigo'),
      900,
    )
  }
}

onMounted(() => {
  window.setTimeout(showBriefing, 600)
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-5">
    <!-- Sidebar -->
    <aside class="rise d2">
      <ScheduleSidebar @open="openEdit" />
    </aside>

    <!-- Main calendar -->
    <section class="rise d3 min-w-0">
      <ScheduleToolbar @new="openNew(null)" />

      <MonthGrid
        v-if="store.view === 'month'"
        @open="openEdit"
        @create="openNew"
      />
      <TimeGrid
        v-else
        :days="gridDays"
        @open="openEdit"
        @create="openNew"
      />
    </section>
  </div>

  <EventFormModal
    v-model:open="modalOpen"
    :editing="editing"
    :defaults="defaults"
    @submit="onSubmit"
    @remove="onRemove"
  />

  <ToastStack />
</template>
