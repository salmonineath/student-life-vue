<script setup lang="ts">
import { Search } from 'lucide-vue-next'

import type { AssignmentFilter } from '@/features/assignments/types'

const search = defineModel<string>('search', { required: true })
const filter = defineModel<AssignmentFilter>('filter', { required: true })

const FILTERS: { value: AssignmentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
  { value: 'late', label: 'Late' },
]
</script>

<template>
  <section class="flex flex-col lg:flex-row gap-3 mb-6 rise d5">
    <div class="flex-1 flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-3 text-muted">
      <Search class="h-4.5 w-4.5" />
      <input
        v-model="search"
        class="bg-transparent outline-none text-[14px] w-full text-ink placeholder:text-muted/70"
        placeholder="Search by title, subject, or description…"
      />
    </div>

    <div class="flex items-center gap-1.5 bg-white border border-border rounded-xl p-1.5">
      <button
        v-for="f in FILTERS"
        :key="f.value"
        type="button"
        class="filter-btn px-4 py-2 rounded-lg text-[13px] font-semibold transition"
        :style="
          filter === f.value
            ? { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))', color: '#fff' }
            : { background: 'transparent', color: '#4B5563' }
        "
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>
  </section>
</template>
