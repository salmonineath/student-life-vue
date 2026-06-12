<script setup lang="ts">
import { computed } from 'vue'
import { Phone, PanelRight, Search, Video } from 'lucide-vue-next'

import GroupAvatar from './GroupAvatar.vue'
import type { Conversation } from '@/features/groups/types'

const props = defineProps<{ conversation: Conversation }>()
defineEmits<{ toggleInfo: [] }>()

const isGroup = computed(() => props.conversation.memberCount != null)
const isOnline = computed(() =>
  isGroup.value ? (props.conversation.onlineCount ?? 0) > 0 : props.conversation.presence === 'online',
)
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-border slide-right d1">
    <div class="flex items-center gap-3 min-w-0">
      <GroupAvatar
        :avatar="conversation.avatar"
        :initials="conversation.initials"
        :color="conversation.color"
        :name="conversation.name"
        :square="isGroup"
        :size="48"
      />
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="font-display font-bold text-[17px] text-ink truncate">{{ conversation.name }}</h2>
          <span
            v-if="isOnline"
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-ink bg-emerald/10 px-2 py-0.5 rounded-full"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald pulse-dot"></span> Active now
          </span>
        </div>
        <p class="text-[12.5px] text-muted">
          <template v-if="isGroup">
            {{ conversation.memberCount }} members ·
            <span class="text-emerald-ink font-medium">{{ conversation.onlineCount }} online</span>
          </template>
          <template v-else>
            <span :class="conversation.presence === 'online' ? 'text-emerald-ink font-medium' : ''">
              {{ conversation.presence === 'online' ? 'Online' : 'Offline' }}
            </span>
          </template>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition">
        <Search class="h-[19px] w-[19px]" />
      </button>
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition">
        <Phone class="h-[19px] w-[19px]" />
      </button>
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition">
        <Video class="h-[19px] w-[19px]" />
      </button>
      <button
        type="button"
        class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition"
        title="Toggle group info"
        @click="$emit('toggleInfo')"
      >
        <PanelRight class="h-[19px] w-[19px]" />
      </button>
    </div>
  </header>
</template>
