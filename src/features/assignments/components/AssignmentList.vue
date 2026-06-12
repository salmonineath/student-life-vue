<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'

import AssignmentCard from './AssignmentCard.vue'
import type { Assignment } from '@/features/assignments/types'

defineProps<{ assignments: Assignment[] }>()

defineEmits<{
  open: [id: number]
  toggle: [id: number]
  edit: [id: number]
  remove: [id: number]
  plan: [id: number]
}>()
</script>

<template>
  <section class="rise d6">
    <div
      v-if="assignments.length"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <AssignmentCard
        v-for="a in assignments"
        :key="a.id"
        :assignment="a"
        @open="$emit('open', $event)"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
        @plan="$emit('plan', $event)"
      />
    </div>

    <div
      v-else
      class="rounded-2xl border-2 border-dashed border-border/70 grid place-items-center py-16 text-center text-muted"
    >
      <ClipboardList class="h-8 w-8 mb-2 opacity-60" />
      <p class="text-[13.5px] font-medium">No assignments match your search</p>
    </div>
  </section>
</template>
