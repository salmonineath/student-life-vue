<script setup lang="ts">
defineProps<{
  title: string
  /** CSS background for the accent bar, e.g. a linear-gradient. */
  gradient: string
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-display font-bold text-[17px] flex items-center gap-2.5 text-ink">
      <span class="h-5 w-1.5 rounded-full" :style="{ background: gradient }"></span>
      {{ title }}
    </h3>
    <slot name="action" />
  </div>
</template>
