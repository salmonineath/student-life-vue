<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AlignLeft, Bell, Clock, MapPin, Star, Tag, Trash2, X } from 'lucide-vue-next'

import type { EventCategory, ScheduleEvent, ScheduleEventDraft } from '@/features/schedules/types'
import { CATEGORY_META, CATEGORY_ORDER, todayISO } from '@/features/schedules/helpers'
import { useConfirm } from '@/shared/composables/useConfirm'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  /** Event being edited, or null when creating. */
  editing: ScheduleEvent | null
  /** Prefilled values when creating from a clicked slot. */
  defaults: Partial<ScheduleEventDraft> | null
}>()

const emit = defineEmits<{ submit: [draft: ScheduleEventDraft]; remove: [id: number] }>()

const title = ref('')
const category = ref<EventCategory>('class')
const date = ref('')
const start = ref('09:00')
const end = ref('10:00')
const location = ref('')
const notes = ref('')
const important = ref(false)

const titleError = ref(false)
const timeError = ref(false)

const isEdit = computed(() => props.editing !== null)

/* ---- Notification (Google Calendar-style: value + unit, one reminder) ---- */
type ReminderUnit = 'minutes' | 'hours' | 'days'
const UNIT_MINUTES: Record<ReminderUnit, number> = { minutes: 1, hours: 60, days: 1440 }

const hasReminder = ref(false)
const reminderValue = ref(10)
const reminderUnit = ref<ReminderUnit>('minutes')

/** Split stored minutes into the largest clean unit for display. */
function loadReminder(minutes: number | null): void {
  hasReminder.value = minutes !== null
  if (minutes === null) {
    reminderValue.value = 10
    reminderUnit.value = 'minutes'
  } else if (minutes % 1440 === 0 && minutes > 0) {
    reminderValue.value = minutes / 1440
    reminderUnit.value = 'days'
  } else if (minutes % 60 === 0 && minutes > 0) {
    reminderValue.value = minutes / 60
    reminderUnit.value = 'hours'
  } else {
    reminderValue.value = minutes
    reminderUnit.value = 'minutes'
  }
}

const reminderMinutes = computed<number | null>(() =>
  hasReminder.value ? Math.max(0, Math.round(reminderValue.value)) * UNIT_MINUTES[reminderUnit.value] : null,
)

watch(open, (isOpen) => {
  if (!isOpen) return
  titleError.value = false
  timeError.value = false
  const e = props.editing
  const d = props.defaults
  title.value = e?.title ?? ''
  category.value = e?.category ?? 'class'
  date.value = e?.date ?? d?.date ?? todayISO()
  start.value = e?.start ?? d?.start ?? '09:00'
  end.value = e?.end ?? d?.end ?? '10:00'
  location.value = e?.location ?? ''
  notes.value = e?.notes ?? ''
  important.value = e?.important ?? false
  loadReminder(e?.reminderMinutes ?? null)
})

function close(): void {
  open.value = false
}

function submit(): void {
  if (!title.value.trim()) {
    titleError.value = true
    return
  }
  if (start.value >= end.value) {
    timeError.value = true
    return
  }
  emit('submit', {
    title: title.value.trim(),
    category: category.value,
    date: date.value,
    start: start.value,
    end: end.value,
    location: location.value.trim(),
    notes: notes.value.trim(),
    important: important.value,
    reminderMinutes: reminderMinutes.value,
  })
  close()
}

const { confirm } = useConfirm()

async function onDelete(): Promise<void> {
  if (!props.editing) return
  const ok = await confirm({
    title: 'Delete event?',
    message: `"${props.editing.title}" will be permanently removed from your schedule.`,
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return
  emit('remove', props.editing.id)
  close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}
watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="close"
    >
      <div class="modal-panel bg-white rounded-3xl w-full max-w-xl my-auto shadow-2xl">
        <!-- Slim header: just the close control, Google Calendar-style -->
        <div class="flex items-center justify-end px-4 pt-4">
          <button
            type="button"
            class="h-9 w-9 grid place-items-center rounded-full text-muted hover:bg-bg transition"
            aria-label="Close"
            @click="close"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="px-7 pb-6">
          <!-- Title: big, borderless, underline focus -->
          <div class="gc-row items-start">
            <span class="gc-ico"></span>
            <div class="min-w-0 flex-1">
              <input
                v-model="title"
                class="gc-title"
                :class="titleError ? 'gc-title-error' : ''"
                placeholder="Add title"
                aria-label="Event title"
                @input="titleError = false"
              />
              <p v-if="titleError" class="mt-1.5 text-[12px] text-danger-ink">
                Give the event a title.
              </p>
            </div>
          </div>

          <!-- Date & time pills -->
          <div class="gc-row mt-4">
            <span class="gc-ico"><Clock class="h-4.5 w-4.5" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center flex-wrap gap-1.5">
                <input v-model="date" type="date" class="gc-pill" aria-label="Date" />
                <input
                  v-model="start"
                  type="time"
                  class="gc-pill"
                  :class="timeError ? 'gc-pill-error' : ''"
                  aria-label="Start time"
                  @input="timeError = false"
                />
                <span class="text-[13px] text-muted">–</span>
                <input
                  v-model="end"
                  type="time"
                  class="gc-pill"
                  :class="timeError ? 'gc-pill-error' : ''"
                  aria-label="End time"
                  @input="timeError = false"
                />
              </div>
              <p v-if="timeError" class="mt-1.5 text-[12px] text-danger-ink">
                End time must be after the start time.
              </p>
            </div>
          </div>

          <!-- Category -->
          <div class="gc-row mt-3">
            <span class="gc-ico"><Tag class="h-4.5 w-4.5" /></span>
            <div class="flex items-center flex-wrap gap-1.5 flex-1">
              <button
                v-for="c in CATEGORY_ORDER"
                :key="c"
                type="button"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition cursor-pointer"
                :class="category === c ? CATEGORY_META[c].block + ' border' : 'text-muted hover:bg-bg border border-transparent'"
                :aria-pressed="category === c"
                @click="category = c"
              >
                <span class="h-2.5 w-2.5 rounded-full" :style="{ background: CATEGORY_META[c].dot }"></span>
                {{ CATEGORY_META[c].label }}
              </button>
            </div>
          </div>

          <!-- Location -->
          <div class="gc-row mt-3">
            <span class="gc-ico"><MapPin class="h-4.5 w-4.5" /></span>
            <input
              v-model="location"
              class="gc-field flex-1"
              placeholder="Add location"
              aria-label="Location"
            />
          </div>

          <!-- Notification (Google Calendar-style reminder row) -->
          <div class="gc-row mt-3">
            <span class="gc-ico"><Bell class="h-4.5 w-4.5" /></span>
            <div class="flex-1">
              <button
                v-if="!hasReminder"
                type="button"
                class="text-[13.5px] font-semibold text-emerald-ink hover:text-emerald-dark px-3 py-2 -ml-3 rounded-lg hover:bg-emerald/5 transition cursor-pointer"
                @click="hasReminder = true"
              >
                Add notification
              </button>
              <div v-else class="flex items-center flex-wrap gap-1.5">
                <span class="text-[13.5px] text-ink">Notify</span>
                <input
                  v-model.number="reminderValue"
                  type="number"
                  min="0"
                  class="gc-pill w-16 text-center"
                  aria-label="Notification amount"
                />
                <select v-model="reminderUnit" class="gc-pill cursor-pointer" aria-label="Notification unit">
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <span class="text-[13.5px] text-ink">before</span>
                <button
                  type="button"
                  class="h-7 w-7 grid place-items-center rounded-full text-muted hover:bg-bg hover:text-ink transition"
                  title="Remove notification"
                  @click="hasReminder = false"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="gc-row mt-3 items-start">
            <span class="gc-ico mt-2"><AlignLeft class="h-4.5 w-4.5" /></span>
            <textarea
              v-model="notes"
              rows="2"
              class="gc-field flex-1 resize-none"
              placeholder="Add description"
              aria-label="Notes"
            ></textarea>
          </div>

          <!-- Important -->
          <div class="gc-row mt-3">
            <span class="gc-ico"><Star class="h-4.5 w-4.5" :class="important ? 'fill-amber text-amber' : ''" /></span>
            <button
              type="button"
              class="flex items-center justify-between flex-1 px-3 py-2 -ml-3 rounded-lg hover:bg-bg transition cursor-pointer"
              :aria-pressed="important"
              @click="important = !important"
            >
              <span class="text-[13.5px] font-medium" :class="important ? 'text-amber-ink' : 'text-ink'">
                Mark as important
              </span>
              <span class="h-5 w-9 rounded-full transition relative" :class="important ? 'bg-amber' : 'bg-border'">
                <span
                  class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                  :class="important ? 'left-4' : 'left-0.5'"
                ></span>
              </span>
            </button>
          </div>
        </div>

        <!-- Footer: Save as a Google-style pill, right-aligned -->
        <div class="flex items-center gap-2 px-7 pb-7">
          <button
            v-if="isEdit"
            type="button"
            title="Delete event"
            class="h-10 w-10 grid place-items-center rounded-full border border-danger/30 text-danger-ink hover:bg-danger/10 transition"
            @click="onDelete"
          >
            <Trash2 class="h-4.5 w-4.5" />
          </button>
          <div class="flex-1"></div>
          <button
            type="button"
            class="px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-ink hover:bg-bg transition"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-7 py-2.5 rounded-full text-white text-[13.5px] font-semibold shadow-lg shadow-emerald/25 hover:-translate-y-0.5 transition"
            style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
            @click="submit"
          >
            {{ isEdit ? 'Save' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Icon rail + row: Google Calendar's signature layout */
.gc-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.gc-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  flex-shrink: 0;
  color: #9ca3af;
}

/* Big borderless title with an underline that sweeps on focus */
.gc-title {
  width: 100%;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  background: transparent;
  border: 0;
  border-bottom: 2px solid #e5e7eb;
  padding: 0.375rem 0;
  outline: none;
  transition: border-color 0.25s ease;
}
.gc-title::placeholder {
  color: #9ca3af;
  font-weight: 600;
}
.gc-title:focus {
  border-bottom-color: var(--emerald);
}
.gc-title-error {
  border-bottom-color: var(--color-danger, #ef4444);
}

/* Quiet grey pills for date/time/unit controls */
.gc-pill {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.8rem;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.gc-pill:hover {
  background: #e8edf3;
}
.gc-pill:focus {
  border-color: var(--emerald);
  background: #fff;
}
.gc-pill-error {
  border-color: var(--color-danger, #ef4444);
}

/* Borderless text fields that reveal their surface on hover/focus */
.gc-field {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  padding: 0.5rem 0.75rem;
  margin-left: -0.75rem;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.gc-field::placeholder {
  color: #9ca3af;
}
.gc-field:hover {
  background: #f8fafc;
}
.gc-field:focus {
  background: #f8fafc;
  border-color: var(--emerald);
}
</style>
