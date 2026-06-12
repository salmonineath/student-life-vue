import { computed, ref } from 'vue'

import { ME, PEOPLE, seedConversations } from '@/features/groups/data'
import type { Conversation, ConversationTab, Member } from '@/features/groups/types'

/**
 * Study-group chat state.
 *
 * View-local (only the Groups page consumes it), so it's a composable rather
 * than a Pinia store — matching the dashboard's rationale. Not persisted: the
 * thread is curated demo data.
 */
export function useGroupChat() {
  const conversations = ref<Conversation[]>(seedConversations())
  const tab = ref<ConversationTab>('general')
  const search = ref('')
  const showInfo = ref(true)
  const activeId = ref<number>(conversations.value[0]?.id ?? 0)

  let messageSeq = 1000

  const generalCount = computed(() => conversations.value.filter((c) => !c.archived).length)
  const archiveCount = computed(() => conversations.value.filter((c) => c.archived).length)

  /** Conversations for the active tab, filtered by the search box. */
  const visibleConversations = computed(() => {
    const q = search.value.toLowerCase().trim()
    return conversations.value.filter((c) => {
      if (tab.value === 'archive' ? !c.archived : c.archived) return false
      if (!q) return true
      return `${c.name} ${c.subtitle ?? ''} ${c.preview ?? ''}`.toLowerCase().includes(q)
    })
  })

  const pinnedConversations = computed(() => visibleConversations.value.filter((c) => c.pinned))
  const recentConversations = computed(() => visibleConversations.value.filter((c) => !c.pinned))

  const activeConversation = computed(
    () => conversations.value.find((c) => c.id === activeId.value) ?? null,
  )

  /** Resolve a sender id to a member (for avatars/names in the thread). */
  function memberOf(conversation: Conversation, senderId: number): Member {
    return (
      conversation.members.find((m) => m.id === senderId) ??
      Object.values(PEOPLE).find((p) => p.id === senderId) ?? { id: senderId, name: 'Member' }
    )
  }

  const typingMember = computed<Member | null>(() => {
    const c = activeConversation.value
    if (!c || c.typingMemberId == null) return null
    return memberOf(c, c.typingMemberId)
  })

  function selectConversation(id: number): void {
    activeId.value = id
    const c = conversations.value.find((x) => x.id === id)
    if (c) c.unread = 0
  }

  function setTab(t: ConversationTab): void {
    tab.value = t
  }

  /** Append an outgoing text message to the active conversation. */
  function send(text: string): void {
    const body = text.trim()
    const c = activeConversation.value
    if (!body || !c) return
    const now = new Date()
    const time = `${now.getHours()}:${`${now.getMinutes()}`.padStart(2, '0')}`
    c.messages.push({
      id: messageSeq++,
      senderId: ME,
      kind: 'text',
      outgoing: true,
      time,
      text: body,
      status: 'sent',
    })
    c.preview = body
    c.previewSender = undefined
    c.previewRead = true
    c.previewTyping = false
    c.lastTime = 'now'
    c.typingMemberId = undefined
  }

  return {
    conversations,
    tab,
    search,
    showInfo,
    activeId,
    generalCount,
    archiveCount,
    visibleConversations,
    pinnedConversations,
    recentConversations,
    activeConversation,
    typingMember,
    memberOf,
    selectConversation,
    setTab,
    send,
  }
}
