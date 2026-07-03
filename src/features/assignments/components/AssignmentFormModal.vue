<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Mail, Plus, X } from 'lucide-vue-next'

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
const invites = ref<string[]>([])
const inviteEmail = ref('')
const inviteError = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  invites.value = e ? [...e.invites] : []
  inviteEmail.value = ''
  inviteError.value = ''
})

function addInvite(): void {
  const value = inviteEmail.value.trim().toLowerCase()
  if (!value) return
  if (!EMAIL_RE.test(value)) {
    inviteError.value = 'Enter a valid email address.'
    return
  }
  if (invites.value.includes(value)) {
    inviteError.value = 'That email is already on the list.'
    return
  }
  invites.value.push(value)
  inviteEmail.value = ''
  inviteError.value = ''
}

function removeInvite(email: string): void {
  invites.value = invites.value.filter((e) => e !== email)
}

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
  // A typed-but-not-added email still counts — don't silently drop it.
  if (inviteEmail.value.trim()) {
    addInvite()
    if (inviteError.value) return
  }
  emit('submit', {
    title: title.value.trim(),
    subject: subject.value.trim() || 'General',
    deadline: deadline.value,
    desc: desc.value.trim(),
    // Progress is driven by tasks / marking complete, not by the form.
    progress: props.editing?.progress ?? 0,
    invites: [...invites.value],
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
          <label for="form-invite-email" class="text-[12.5px] font-semibold text-ink">
            Invite member <span class="text-muted font-normal">(optional)</span>
          </label>
          <div class="mt-1.5 flex items-center gap-2">
            <div class="relative flex-1">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60 pointer-events-none" />
              <input
                id="form-invite-email"
                v-model="inviteEmail"
                type="email"
                autocomplete="email"
                placeholder="teammate@university.edu"
                class="w-full bg-bg border rounded-xl pl-10 pr-3.5 py-2.5 text-[14px] outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition"
                :class="inviteError ? 'border-danger' : 'border-border'"
                @input="inviteError = ''"
                @keydown.enter.prevent="addInvite"
              />
            </div>
            <button
              type="button"
              class="h-[42px] px-3.5 rounded-xl border border-emerald/40 text-emerald-ink text-[13px] font-semibold flex items-center gap-1.5 hover:bg-emerald/10 transition"
              @click="addInvite"
            >
              <Plus class="h-4 w-4" /> Add
            </button>
          </div>
          <p v-if="inviteError" role="alert" class="mt-1.5 text-[12px] text-danger-ink">
            {{ inviteError }}
          </p>
          <p v-else class="mt-1.5 text-[12px] text-muted">
            You can also invite people later from the assignment's Share button.
          </p>

          <ul v-if="invites.length" class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="email in invites"
              :key="email"
              class="flex items-center gap-1.5 text-[12.5px] text-ink bg-bg border border-border rounded-full pl-3 pr-1.5 py-1"
            >
              <span class="truncate max-w-52" :title="email">{{ email }}</span>
              <button
                type="button"
                class="h-5 w-5 grid place-items-center rounded-full text-muted hover:text-danger-ink hover:bg-danger/10 transition"
                :title="`Remove ${email}`"
                @click="removeInvite(email)"
              >
                <X class="h-3 w-3" />
              </button>
            </li>
          </ul>
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
