<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Mail, Send, X } from 'lucide-vue-next'

import { useAssignmentStore } from '@/features/assignments/store/useAssignmentStore'
import {
  sendInviteAction,
  revokeInviteAction,
} from '@/features/assignments/store/assignments.action'
import { useToasts } from '@/shared/composables/useToasts'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ assignmentId: number }>()

const store = useAssignmentStore()
const { push } = useToasts()

const assignment = computed(() => store.find(props.assignmentId))

const email = ref('')
const error = ref('')
const sending = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Reset the form each time the modal opens.
watch(open, (isOpen) => {
  if (!isOpen) return
  email.value = ''
  error.value = ''
})

async function send(): Promise<void> {
  const value = email.value.trim().toLowerCase()
  if (!EMAIL_RE.test(value)) {
    error.value = 'Enter a valid email address, e.g. teammate@university.edu'
    return
  }
  if (assignment.value?.invites.includes(value)) {
    error.value = 'That email has already been invited.'
    return
  }
  sending.value = true
  error.value = ''
  try {
    await sendInviteAction(props.assignmentId, value)
    push(`Invitation sent to <b>${value}</b>`, 'mail', 'indigo')
    email.value = ''
  } catch {
    error.value = 'Failed to send invitation. Please try again.'
  } finally {
    sending.value = false
  }
}

async function revokeInvite(inviteEmail: string): Promise<void> {
  try {
    await revokeInviteAction(props.assignmentId, inviteEmail)
  } catch {
    push('Failed to remove invite.', 'x', 'danger')
  }
}

function close(): void {
  open.value = false
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
      v-if="open && assignment"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <div class="modal-panel bg-white rounded-3xl w-full max-w-md shadow-2xl pb-6">
        <div class="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 class="font-display font-extrabold text-[19px] text-ink">Invite team member</h3>
          <button
            type="button"
            class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
            aria-label="Close"
            @click="close"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="px-6 pb-2">
          <label for="invite-email" class="block text-[11px] font-bold tracking-wide text-muted uppercase mb-2">
            Invite member
          </label>
          <form class="flex items-center gap-2" @submit.prevent="send">
            <div class="relative flex-1">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60 pointer-events-none" />
              <input
                id="invite-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="teammate@university.edu"
                class="w-full bg-bg border rounded-xl pl-10 pr-3.5 py-2.5 text-[14px] outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition"
                :class="error ? 'border-danger' : 'border-border'"
                @input="error = ''"
              />
            </div>
            <button
              type="submit"
              :disabled="sending"
              class="h-[42px] px-4 rounded-xl text-white text-[13.5px] font-semibold flex items-center gap-2 shadow-md shadow-indigo/25 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, var(--indigo), #4338ca)"
            >
              <Send class="h-4 w-4" /> {{ sending ? 'Sending…' : 'Send' }}
            </button>
          </form>
          <p v-if="error" role="alert" class="mt-2 text-[12.5px] text-danger-ink">{{ error }}</p>

          <!-- Already invited -->
          <div v-if="assignment.invites.length" class="mt-4">
            <p class="text-[11px] font-bold tracking-wide text-muted uppercase mb-2">
              Invited ({{ assignment.invites.length }})
            </p>
            <ul class="space-y-1.5 max-h-40 overflow-y-auto">
              <li
                v-for="invited in assignment.invites"
                :key="invited"
                class="flex items-center gap-2 text-[13px] text-ink bg-bg border border-border rounded-lg px-3 py-2"
              >
                <Mail class="h-3.5 w-3.5 shrink-0 text-muted" />
                <span class="truncate flex-1" :title="invited">{{ invited }}</span>
                <button
                  type="button"
                  class="text-muted hover:text-danger-ink transition shrink-0"
                  :title="`Remove ${invited}`"
                  @click="revokeInvite(invited)"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- <div class="px-6 pb-6 pt-4 flex justify-end">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl border border-border text-ink text-[13.5px] font-semibold hover:bg-bg transition"
            @click="close"
          >
            Cancel
          </button>
        </div> -->
      </div>
    </div>
  </Teleport>
</template>
