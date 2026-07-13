<script setup lang="ts">
import { computed } from 'vue'
import { Check, CheckCheck, Play } from 'lucide-vue-next'

import GroupAvatar from './GroupAvatar.vue'
import type { Member, Message } from '@/features/groups/types'

const props = defineProps<{
  sender: Member
  outgoing: boolean
  messages: Message[]
}>()

// Decorative per-sender name color, cycled through the brand accents.
const NAME_COLORS = ['text-indigo-ink', 'text-amber-ink', 'text-emerald-ink']
const nameColor = computed(() => NAME_COLORS[props.sender.id % NAME_COLORS.length])

// Staggered animation-delay values (seconds) for the voice-message waveform bars.
const WAVE = Array.from({ length: 11 }, (_, i) => i * 0.1)
</script>

<template>
  <div
    class="flex items-end gap-2.5 max-w-[78%] bubble"
    :class="outgoing ? 'ml-auto flex-row-reverse' : ''"
  >
    <GroupAvatar :avatar="sender.avatar" :initials="sender.initials" :color="sender.color" :name="sender.name" :size="32" />

    <div class="min-w-0" :class="outgoing ? 'flex flex-col items-end' : ''">
      <p v-if="!outgoing" class="text-[11.5px] font-semibold mb-1 ml-1" :class="nameColor">
        {{ sender.name }}
      </p>

      <div class="space-y-1.5" :class="outgoing ? 'flex flex-col items-end' : ''">
        <div v-for="m in messages" :key="m.id" :class="outgoing ? 'flex flex-col items-end' : ''">
          <!-- TEXT -->
          <div
            v-if="m.kind === 'text'"
            class="px-4 py-2.5 shadow-sm rounded-2xl text-[13.5px] leading-relaxed"
            :class="outgoing
              ? 'text-white rounded-br-md shadow-emerald/20'
              : 'bg-white border border-border text-ink rounded-bl-md'"
            :style="outgoing ? { background: 'linear-gradient(135deg, var(--emerald), var(--indigo))' } : undefined"
          >
            {{ m.text }}
          </div>

          <!-- IMAGE -->
          <div
            v-else-if="m.kind === 'image'"
            class="bg-white border border-border rounded-2xl rounded-bl-md p-1.5 shadow-sm w-[300px] max-w-full"
          >
            <img :src="m.image" :alt="m.text || 'shared image'" class="rounded-xl w-full h-[170px] object-cover" />
            <p v-if="m.text" class="text-[13px] text-ink leading-relaxed px-2 py-1.5">{{ m.text }}</p>
          </div>

          <!-- VOICE -->
          <div
            v-else
            class="bg-white border border-border rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm flex items-center gap-3 w-[240px]"
          >
            <button
              type="button"
              class="h-9 w-9 rounded-full text-white grid place-items-center shrink-0 send-btn"
              style="background: linear-gradient(135deg, var(--emerald), var(--indigo))"
            >
              <Play class="h-4 w-4 ml-0.5" />
            </button>
            <div class="flex items-center gap-[2px] h-5 text-emerald flex-1">
              <span v-for="d in WAVE" :key="d" class="wave-bar" :style="{ animationDelay: `${d}s` }"></span>
            </div>
            <span class="text-[11px] text-muted font-medium shrink-0">{{ m.duration }}</span>
          </div>

          <!-- META -->
          <div
            class="flex items-center gap-1.5 mt-1"
            :class="outgoing ? 'mr-1 flex-row-reverse' : 'ml-1'"
          >
            <span class="text-[11px] text-muted">{{ m.time }}</span>
            <CheckCheck v-if="outgoing && m.status === 'read'" class="h-3.5 w-3.5 text-emerald" />
            <Check v-else-if="outgoing" class="h-3.5 w-3.5 text-muted" />
            <span
              v-for="r in m.reactions"
              :key="r.emoji"
              class="inline-flex items-center gap-1 text-[11px] bg-white border border-border rounded-full px-1.5 py-0.5"
            >
              {{ r.emoji }} <span class="text-muted font-medium">{{ r.count }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
