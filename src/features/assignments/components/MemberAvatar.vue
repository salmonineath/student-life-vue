<script setup lang="ts">
import { computed } from 'vue'

import type { Member } from '@/features/assignments/types'

const props = withDefaults(defineProps<{ member: Member; size?: number; ring?: boolean }>(), {
  size: 28,
  ring: true,
})

const style = computed(() => ({
  background: props.member.color,
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.36)}px`,
}))
</script>

<template>
  <span
    class="rounded-full grid place-items-center text-white font-bold shrink-0"
    :class="ring ? 'ring-2 ring-white' : ''"
    :style="style"
    :title="member.name"
  >
    {{ member.initials }}
  </span>
</template>
