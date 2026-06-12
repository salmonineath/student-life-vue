<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'

import type { Assignment, AssignmentDraft } from '@/features/assignments/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  /** The assignment being edited, or null when creating. */
  editing: Assignment | null
}>()

const emit = defineEmits<{ submit: [draft: AssignmentDraft] }>()

const title = ref('')
const subject = ref('')
const deadline = ref('')
const desc = ref('')
const progress = ref(0)

const titleError = ref(false)
const deadlineError = ref(false)

const isEdit = computed(() => props.editing !== null)

// Repopulate the form each time the modal opens.
watch(open, (isOpen) => {
  if (!isOpen) return
  titleError.value = false
  deadlineError.value = false
  const e = props.editing
  title.value = e?.title ?? ''
  subject.value = e?.subject ?? ''
  deadline.value = e?.deadline ?? ''
  desc.value = e?.desc ?? ''
  progress.value = e?.progress ?? 0
})

function close(): void {
  open.value = false
}

function submit(): void {
  if (!title.value.trim()) {
    flash('title')
    return
  }
  if (!deadline.value) {
    flash('deadline')
    return
  }
  emit('submit', {
    title: title.value.trim(),
    subject: subject.value.trim() || 'General',
    deadline: deadline.value,
    desc: desc.value.trim(),
    progress: Number(progress.value),
  })
  close()
}

function flash(field: 'title' | 'deadline'): void {
  const flag = field === 'title' ? titleError : deadlineError
  flag.value = true
  window.setTimeout(() => {
    flag.value = false
  }, 1500)
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
  <div
    v-if="open"
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="modal-panel bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
      <div
        class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-white rounded-t-3xl"
      >
        <h3 class="font-display font-extrabold text-[20px] text-ink">
          {{ isEdit ? 'Edit Assignment' : 'New Assignment' }}
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
            placeholder="e.g. Database normalization report"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[12.5px] font-semibold text-ink">Subject</label>
            <input
              v-model="subject"
              :class="[fieldBase, 'border-border']"
              placeholder="e.g. IT"
            />
          </div>
          <div>
            <label class="text-[12.5px] font-semibold text-ink">
              Deadline <span class="text-danger">*</span>
            </label>
            <input
              v-model="deadline"
              type="date"
              :class="[fieldBase, deadlineError ? 'border-danger' : 'border-border']"
            />
          </div>
        </div>

        <div>
          <label class="text-[12.5px] font-semibold text-ink">Description</label>
          <textarea
            v-model="desc"
            rows="3"
            :class="[fieldBase, 'border-border resize-none']"
            placeholder="What needs to be done?"
          ></textarea>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label class="text-[12.5px] font-semibold text-ink">Progress</label>
            <span class="text-[13px] font-bold text-emerald-ink">{{ progress }}%</span>
          </div>
          <input
            v-model.number="progress"
            type="range"
            min="0"
            max="100"
            class="prog w-full mt-3"
          />
        </div>
      </div>

      <div class="px-6 pb-6 pt-2 flex items-center gap-3">
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
          <Check class="h-4 w-4" /> {{ isEdit ? 'Save changes' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>
