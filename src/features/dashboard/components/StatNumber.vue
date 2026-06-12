<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue'

import { useCountUp } from '@/features/dashboard/composables/useCountUp'

const props = withDefaults(
  defineProps<{
    /** The logical value to display. */
    value: number
    /** Count up from 0 when scrolled into view (default true). */
    animate?: boolean
  }>(),
  { animate: true },
)

const el = useTemplateRef<HTMLElement>('stat')
const { display } = useCountUp(toRef(props, 'value'), { el, enabled: props.animate })
</script>

<template>
  <span ref="stat">{{ display }}</span>
</template>
