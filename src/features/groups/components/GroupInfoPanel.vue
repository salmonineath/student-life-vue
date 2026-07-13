<script setup lang="ts">
import { computed } from 'vue'
import {
  BellOff,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  Mic,
  Phone,
  UserPlus,
  Video,
  X,
} from 'lucide-vue-next'

import GroupAvatar from './GroupAvatar.vue'
import type { Conversation } from '@/features/groups/types'

const props = defineProps<{ conversation: Conversation }>()
defineEmits<{ close: [] }>()

// memberCount is only populated for group chats, so its presence is used as
// the group/DM discriminator (see also ChatHeader.vue, ConversationRow.vue).
const isGroup = computed(() => props.conversation.memberCount != null)
// memberCount (when present) is the group's real roster size; `members` here
// may only hold a preview subset, so it's used as a fallback for DMs/small lists.
const memberTotal = computed(() => props.conversation.memberCount ?? props.conversation.members.length)

const PHOTOS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&q=60',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=120&q=60',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=60',
]

const FILE_ROWS = [
  { icon: Video, label: '13 videos', color: 'text-indigo-ink' },
  { icon: FileText, label: '47 documents', color: 'text-amber-ink' },
  { icon: LinkIcon, label: '21 shared links', color: 'text-emerald-ink' },
  { icon: Mic, label: '89 voice messages', color: 'text-danger-ink' },
]
</script>

<template>
  <aside class="flex flex-col w-[300px] shrink-0 bg-white border-l border-border slide-right d2 overflow-y-auto">
    <div class="flex items-center justify-between px-5 py-4 border-b border-border">
      <h3 class="font-display font-bold text-[16px] text-ink">Group Info</h3>
      <button
        type="button"
        class="h-8 w-8 grid place-items-center rounded-lg text-muted hover:bg-bg transition"
        @click="$emit('close')"
      >
        <X class="h-[18px] w-[18px]" />
      </button>
    </div>

    <!-- Identity -->
    <div class="flex flex-col items-center text-center px-5 py-6 border-b border-border">
      <GroupAvatar
        :avatar="conversation.avatar"
        :initials="conversation.initials"
        :color="conversation.color"
        :name="conversation.name"
        :square="isGroup"
        :size="64"
        class="mb-3"
      />
      <p class="font-display font-bold text-[16px] text-ink">{{ conversation.name }}</p>
      <p v-if="conversation.subtitle" class="text-[12.5px] text-muted mt-0.5">{{ conversation.subtitle }}</p>

      <div class="flex items-center gap-2 mt-4">
        <button class="h-9 w-9 grid place-items-center rounded-xl bg-bg border border-border text-emerald-ink hover:bg-emerald/10 transition">
          <Phone class="h-4 w-4" />
        </button>
        <button class="h-9 w-9 grid place-items-center rounded-xl bg-bg border border-border text-emerald-ink hover:bg-emerald/10 transition">
          <Video class="h-4 w-4" />
        </button>
        <button class="h-9 w-9 grid place-items-center rounded-xl bg-bg border border-border text-emerald-ink hover:bg-emerald/10 transition">
          <BellOff class="h-4 w-4" />
        </button>
        <button class="h-9 w-9 grid place-items-center rounded-xl bg-bg border border-border text-danger-ink hover:bg-danger/10 transition">
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Shared files -->
    <div class="px-5 py-4 border-b border-border">
      <div class="flex items-center justify-between mb-3">
        <p class="text-[13px] font-semibold text-ink">Shared Files</p>
        <button class="text-[12px] font-medium text-emerald-ink hover:underline">See all</button>
      </div>

      <div class="mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="flex items-center gap-2 text-[12.5px] text-muted">
            <ImageIcon class="h-4 w-4 text-emerald-ink" /> 128 photos
          </span>
          <ChevronUp class="h-4 w-4 text-muted/60" />
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <img :src="PHOTOS[0]" class="h-16 w-full rounded-lg object-cover" alt="" />
          <img :src="PHOTOS[1]" class="h-16 w-full rounded-lg object-cover" alt="" />
          <div class="relative">
            <img :src="PHOTOS[2]" class="h-16 w-full rounded-lg object-cover" alt="" />
            <div class="absolute inset-0 rounded-lg bg-ink/55 grid place-items-center text-white text-[12px] font-semibold">
              +124
            </div>
          </div>
        </div>
      </div>

      <button
        v-for="row in FILE_ROWS"
        :key="row.label"
        class="w-full flex items-center justify-between py-2.5 group"
      >
        <span class="flex items-center gap-2 text-[12.5px] text-muted">
          <component :is="row.icon" class="h-4 w-4" :class="row.color" /> {{ row.label }}
        </span>
        <ChevronDown class="h-4 w-4 text-muted/60 group-hover:text-ink transition" />
      </button>
    </div>

    <!-- Members -->
    <div class="px-5 py-4">
      <div class="flex items-center justify-between mb-3">
        <p class="text-[13px] font-semibold text-ink">{{ memberTotal }} members</p>
        <button class="h-7 w-7 grid place-items-center rounded-lg bg-emerald/10 text-emerald-ink hover:bg-emerald/20 transition">
          <UserPlus class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-1">
        <div
          v-for="m in conversation.members"
          :key="m.id"
          class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-bg transition"
        >
          <GroupAvatar
            :avatar="m.avatar"
            :initials="m.initials"
            :color="m.color"
            :name="m.name"
            :size="36"
            :presence="m.presence"
          />
          <p class="flex-1 min-w-0 text-[13.5px] font-medium text-ink truncate">{{ m.name }}</p>
          <span
            v-if="m.admin"
            class="text-[10px] font-semibold text-emerald-ink bg-emerald/10 px-2 py-0.5 rounded-full"
          >
            admin
          </span>
        </div>
      </div>

      <!-- Only show "view all" when the roster is larger than the preview list rendered above -->
      <button
        v-if="memberTotal > conversation.members.length"
        class="w-full mt-2 py-2.5 rounded-xl text-[13px] font-medium text-emerald-ink hover:bg-emerald/10 transition"
      >
        View all {{ memberTotal }} members
      </button>
    </div>
  </aside>
</template>
