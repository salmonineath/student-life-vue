<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import GroupAvatar from './GroupAvatar.vue'
import MessageGroup from './MessageGroup.vue'
import { ME, PEOPLE } from '@/features/groups/data'
import type { Conversation, Member, Message } from '@/features/groups/types'

const props = defineProps<{ conversation: Conversation; typingMember: Member | null }>()

function resolve(senderId: number): Member {
  if (senderId === ME) return PEOPLE.me
  return (
    props.conversation.members.find((m) => m.id === senderId) ??
    Object.values(PEOPLE).find((p) => p.id === senderId) ?? { id: senderId, name: 'Member' }
  )
}

interface Group {
  senderId: number
  outgoing: boolean
  sender: Member
  messages: Message[]
}

// Collapse consecutive messages from the same sender into one visual group
// (single avatar/name, stacked bubbles) — only checks the immediately
// preceding message, so a sender re-appearing later starts a new group.
const groups = computed<Group[]>(() => {
  const out: Group[] = []
  for (const m of props.conversation.messages) {
    const last = out[out.length - 1]
    if (last && last.senderId === m.senderId) last.messages.push(m)
    else out.push({ senderId: m.senderId, outgoing: m.outgoing, sender: resolve(m.senderId), messages: [m] })
  }
  return out
})

const scroller = ref<HTMLElement | null>(null)
function scrollToBottom(): void {
  // Wait a tick so the DOM reflects the new message before measuring scrollHeight.
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

// Re-scroll to bottom both when switching conversations and when new
// messages arrive in the current one; `immediate` covers the initial mount.
watch(
  () => [props.conversation.id, props.conversation.messages.length],
  scrollToBottom,
  { immediate: true },
)
</script>

<template>
  <div ref="scroller" class="flex-1 overflow-y-auto px-6 py-6 space-y-5 chat-bg">
    <!-- Day divider -->
    <div class="flex items-center justify-center">
      <span class="text-[11px] font-semibold text-muted bg-white border border-border px-3 py-1 rounded-full shadow-sm">
        Today
      </span>
    </div>

    <MessageGroup
      v-for="(g, i) in groups"
      :key="i"
      :sender="g.sender"
      :outgoing="g.outgoing"
      :messages="g.messages"
    />

    <!-- Typing indicator -->
    <div v-if="typingMember" class="flex items-end gap-2.5 bubble">
      <GroupAvatar
        :avatar="typingMember.avatar"
        :initials="typingMember.initials"
        :color="typingMember.color"
        :name="typingMember.name"
        :size="32"
      />
      <div class="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div class="typing flex items-center"><span></span><span></span><span></span></div>
      </div>
    </div>
  </div>
</template>
