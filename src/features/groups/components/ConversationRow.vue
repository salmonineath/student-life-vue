<script setup lang="ts">
import { computed } from 'vue'
import { CheckCheck } from 'lucide-vue-next'

import GroupAvatar from './GroupAvatar.vue'
import type { Conversation } from '@/features/groups/types'

const props = defineProps<{ conversation: Conversation; active: boolean }>()
defineEmits<{ select: [id: number] }>()

const isGroup = computed(() => props.conversation.memberCount != null)
</script>

<template>
  <button
    type="button"
    class="conv-row w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition"
    :class="active ? '' : 'hover:bg-bg'"
    :style="active ? { background: 'linear-gradient(90deg, rgba(16,185,129,.10), rgba(79,70,229,.05))' } : undefined"
    @click="$emit('select', conversation.id)"
  >
    <GroupAvatar
      :avatar="conversation.avatar"
      :initials="conversation.initials"
      :color="conversation.color"
      :name="conversation.name"
      :square="isGroup"
      :presence="isGroup ? undefined : conversation.presence"
      :size="48"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <p
          class="font-semibold text-[14.5px] truncate"
          :class="active ? 'text-emerald-ink' : 'text-ink'"
        >
          {{ conversation.name }}
        </p>
        <span class="text-[11px] shrink-0" :class="active ? 'text-emerald-ink font-medium' : 'text-muted'">
          {{ conversation.lastTime }}
        </span>
      </div>

      <p class="text-[12.5px] text-muted truncate flex items-center gap-1 mt-0.5">
        <span v-if="conversation.previewTyping" class="italic text-emerald-ink">typing…</span>
        <template v-else>
          <CheckCheck
            v-if="conversation.previewRead"
            class="h-3.5 w-3.5 shrink-0 text-emerald"
          />
          <span v-if="conversation.previewSender" class="font-medium text-slate-500">
            {{ conversation.previewSender }}:
          </span>
          <span class="truncate">{{ conversation.preview }}</span>
        </template>
      </p>
    </div>

    <span
      v-if="conversation.unread"
      class="h-5 min-w-5 px-1.5 rounded-full bg-emerald text-white grid place-items-center text-[11px] font-bold shrink-0"
    >
      {{ conversation.unread }}
    </span>
  </button>
</template>
