<script setup lang="ts">
import { useSparks } from '@/features/assignments/composables/useSparks'

const { sparks } = useSparks()
</script>

<template>
  <span
    v-for="s in sparks"
    :key="s.id"
    class="spark"
    :style="{
      position: 'fixed',
      left: `${s.x}px`,
      top: `${s.y}px`,
      color: s.color,
      fontSize: `${s.size}px`,
      animationDelay: `${s.delay}s`,
      zIndex: 70,
    }"
  >
    {{ s.char }}
  </span>
</template>
