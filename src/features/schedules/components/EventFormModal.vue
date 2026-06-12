<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Clock, Star, Trash2, X } from 'lucide-vue-next'

import type { EventCategory, ScheduleEvent, ScheduleEventDraft } from '@/features/schedules/types'
import { CATEGORY_META, CATEGORY_ORDER, todayISO } from '@/features/schedules/helpers'

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
  })
  close()
}

function onDelete(): void {
  if (props.editing) emit('remove', props.editing.id)
  close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}
watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

const fieldBase =
  'mt-1.5 w-full bg-bg border rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition'
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      @click.self="close"
    >
      <div class="modal-panel bg-white rounded-3xl w-full max-w-lg my-6 shadow-2xl">
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h3 class="font-display font-extrabold text-[20px] text-ink">
            {{ isEdit ? 'Edit event' : 'New event' }}
          </h3>
          <button
            type="button"
            class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
            @click="close"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="text-[12.5px] font-semibold text-ink">
              Title <span class="text-danger">*</span>
            </label>
            <input
              v-model="title"
              :class="[fieldBase, titleError ? 'border-danger' : 'border-border']"
              placeholder="e.g. Data Structures Lecture"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="text-[12.5px] font-semibold text-ink">Category</label>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="c in CATEGORY_ORDER"
                :key="c"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12.5px] font-semibold transition"
                :class="category === c ? 'border-ink/20 bg-bg' : 'border-border text-muted hover:bg-bg'"
                @click="category = c"
              >
                <span class="h-2.5 w-2.5 rounded-full" :style="{ background: CATEGORY_META[c].dot }"></span>
                {{ CATEGORY_META[c].label }}
                <Check v-if="category === c" class="h-3.5 w-3.5 text-emerald-ink" />
              </button>
            </div>
          </div>

          <!-- Date -->
          <div>
            <label class="text-[12.5px] font-semibold text-ink">Date</label>
            <input v-model="date" type="date" :class="[fieldBase, 'border-border']" />
          </div>

          <!-- Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[12.5px] font-semibold text-ink">Start</label>
              <input
                v-model="start"
                type="time"
                :class="[fieldBase, timeError ? 'border-danger' : 'border-border']"
              />
            </div>
            <div>
              <label class="text-[12.5px] font-semibold text-ink">End</label>
              <input
                v-model="end"
                type="time"
                :class="[fieldBase, timeError ? 'border-danger' : 'border-border']"
              />
            </div>
          </div>
          <p v-if="timeError" class="text-[12px] text-danger-ink flex items-center gap-1.5 -mt-2">
            <Clock class="h-3.5 w-3.5" /> End time must be after the start time.
          </p>

          <!-- Location -->
          <div>
            <label class="text-[12.5px] font-semibold text-ink">Location</label>
            <input
              v-model="location"
              :class="[fieldBase, 'border-border']"
              placeholder="e.g. Room B204 / Online"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="text-[12.5px] font-semibold text-ink">Notes</label>
            <textarea
              v-model="notes"
              rows="2"
              :class="[fieldBase, 'border-border resize-none']"
              placeholder="Anything to remember?"
            ></textarea>
          </div>

          <!-- Important -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition"
            :class="important ? 'border-amber/40 bg-amber/10' : 'border-border hover:bg-bg'"
            @click="important = !important"
          >
            <span class="flex items-center gap-2 text-[13.5px] font-semibold" :class="important ? 'text-amber-ink' : 'text-ink'">
              <Star class="h-4 w-4" :class="important ? 'fill-current' : ''" /> Mark as important
            </span>
            <span
              class="h-5 w-9 rounded-full transition relative"
              :class="important ? 'bg-amber' : 'bg-border'"
            >
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                :class="important ? 'left-4' : 'left-0.5'"
              ></span>
            </span>
          </button>
        </div>

        <div class="px-6 pb-6 pt-2 flex items-center gap-3">
          <button
            v-if="isEdit"
            type="button"
            title="Delete event"
            class="h-12 w-12 shrink-0 grid place-items-center rounded-xl border border-danger/30 text-danger-ink hover:bg-danger/10 transition"
            @click="onDelete"
          >
            <Trash2 class="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            class="flex-1 py-3 rounded-xl border border-border text-ink text-[14px] font-semibold hover:bg-bg transition"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 py-3 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald/25 hover:-translate-y-0.5 transition"
            style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
            @click="submit"
          >
            <Check class="h-4 w-4" /> {{ isEdit ? 'Save changes' : 'Create event' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
