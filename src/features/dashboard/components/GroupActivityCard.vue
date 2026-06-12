<script setup lang="ts">
import { Users, ArrowUpRight } from 'lucide-vue-next'

import SectionHeader from './SectionHeader.vue'
</script>

<template>
  <section class="card p-5 flex flex-col">
    <SectionHeader
      title="Group Activity"
      gradient="linear-gradient(var(--indigo), var(--emerald))"
    >
      <template #action>
        <span
          class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-ink bg-emerald/15 px-2.5 py-1 rounded-full"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald"></span> 1 group
        </span>
      </template>
    </SectionHeader>

    <div class="flex-1 flex items-center">
      <div class="w-full flex items-center gap-4 p-4 rounded-2xl border border-border">
        <div
          class="h-12 w-12 rounded-2xl grid place-items-center bg-indigo/10 text-indigo-ink shrink-0"
        >
          <Users class="h-6 w-6" />
        </div>
        <div class="flex-1">
          <p class="text-[14px] font-semibold text-ink">Your study groups are quiet for now</p>
          <p class="text-[12.5px] text-muted mt-0.5">Start a thread to get everyone moving 💬</p>
        </div>
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl border border-border text-[12.5px] font-semibold text-indigo-ink hover:bg-indigo/10 transition flex items-center gap-1.5 shrink-0"
        >
          Open <ArrowUpRight class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
</template>
