<script setup lang="ts">
import { computed } from 'vue'

import type { Presence } from '@/features/groups/types'

const props = withDefaults(
  defineProps<{
    /** Image URL (people) — falls back to initials. */
    avatar?: string
    /** Initials shown when there's no image. */
    initials?: string
    /** Background (hex or CSS gradient) for the initials tile. */
    color?: string
    name?: string
    size?: number
    /** Rounded-2xl tile (groups) vs full circle (people). */
    square?: boolean
    presence?: Presence
  }>(),
  { size: 48, square: false },
)

const dimensions = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
const presenceColor: Record<Presence, string> = {
  online: '#10B981',
  away: '#F59E0B',
  offline: '#CBD5E1',
}
</script>

<template>
  <span class="relative inline-block shrink-0" :style="dimensions">
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="h-full w-full object-cover"
      :class="square ? 'rounded-2xl' : 'rounded-full'"
    />
    <span
      v-else
      class="h-full w-full grid place-items-center text-white font-display font-bold"
      :class="square ? 'rounded-2xl' : 'rounded-full'"
      :style="{ background: color || 'linear-gradient(135deg,#10B981,#4F46E5)', fontSize: `${Math.round(size * 0.32)}px` }"
    >
      {{ initials || (name ? name.slice(0, 2).toUpperCase() : '?') }}
    </span>

    <span
      v-if="presence"
      class="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white"
      :style="{ width: `${Math.max(size * 0.28, 10)}px`, height: `${Math.max(size * 0.28, 10)}px`, background: presenceColor[presence] }"
    ></span>
  </span>
</template>
