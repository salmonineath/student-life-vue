<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Star } from 'lucide-vue-next'

import type { ScheduleEvent } from '@/features/schedules/types'
import { CATEGORY_META, formatTime } from '@/features/schedules/helpers'

const props = defineProps<{ event: ScheduleEvent; dense?: boolean }>()
defineEmits<{ open: [id: number] }>()

const meta = computed(() => CATEGORY_META[props.event.category])
</script>

<template>
  <button
    type="button"
    class="h-full w-full text-left rounded-lg border overflow-hidden px-2 py-1 transition hover:shadow-md hover:-translate-y-px"
    :class="meta.block"
    :style="{ borderLeftWidth: '3px', borderLeftColor: meta.dot }"
    @click.stop="$emit('open', event.id)"
  >
    <p class="text-[10px] font-semibold opacity-80 leading-tight">
      {{ formatTime(event.start) }} – {{ formatTime(event.end) }}
    </p>
    <p class="text-[11.5px] font-bold leading-tight mt-0.5 flex items-start gap-1 line-clamp-2">
      <Star v-if="event.important" class="h-3 w-3 shrink-0 mt-px fill-current" />
      <span class="min-w-0">{{ event.title }}</span>
    </p>
    <p
      v-if="event.location && !dense"
      class="text-[10px] opacity-70 mt-0.5 flex items-center gap-0.5 truncate"
    >
      <MapPin class="h-2.5 w-2.5 shrink-0" /> {{ event.location }}
    </p>
  </button>
</template>
