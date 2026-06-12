<script setup lang="ts">
import { MessageCircleOff } from 'lucide-vue-next'

import ConversationList from '@/features/groups/components/ConversationList.vue'
import ChatHeader from '@/features/groups/components/ChatHeader.vue'
import MessageThread from '@/features/groups/components/MessageThread.vue'
import MessageComposer from '@/features/groups/components/MessageComposer.vue'
import GroupInfoPanel from '@/features/groups/components/GroupInfoPanel.vue'

import { useGroupChat } from '@/features/groups/composables/useGroupChat'

const {
  tab,
  search,
  showInfo,
  activeId,
  generalCount,
  archiveCount,
  pinnedConversations,
  recentConversations,
  activeConversation,
  typingMember,
  selectConversation,
  setTab,
  send,
} = useGroupChat()
</script>

<template>
  <!-- One framed surface that fills the content area, split into 3 panes. -->
  <div
    class="flex rounded-2xl border border-border bg-white overflow-hidden shadow-sm h-[calc(100vh-8.5rem)] min-h-[560px]"
  >
    <ConversationList
      v-model:search="search"
      :pinned="pinnedConversations"
      :recent="recentConversations"
      :active-id="activeId"
      :tab="tab"
      :general-count="generalCount"
      :archive-count="archiveCount"
      class="hidden sm:flex"
      @select="selectConversation"
      @update:tab="setTab"
    />

    <!-- Chat panel -->
    <main class="flex-1 flex flex-col min-w-0 chat-bg">
      <template v-if="activeConversation">
        <ChatHeader :conversation="activeConversation" @toggle-info="showInfo = !showInfo" />
        <MessageThread :conversation="activeConversation" :typing-member="typingMember" />
        <MessageComposer @send="send" />
      </template>

      <div v-else class="flex-1 grid place-items-center text-center text-muted">
        <div>
          <MessageCircleOff class="h-9 w-9 mx-auto mb-3 opacity-60" />
          <p class="text-[14px] font-medium">Select a conversation to start chatting.</p>
        </div>
      </div>
    </main>

    <!-- Group info -->
    <GroupInfoPanel
      v-if="showInfo && activeConversation"
      :conversation="activeConversation"
      class="hidden xl:flex"
      @close="showInfo = false"
    />
  </div>
</template>
