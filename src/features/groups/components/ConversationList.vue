<script setup lang="ts">
import { Pin, PenSquare, Search } from 'lucide-vue-next'

import ConversationRow from './ConversationRow.vue'
import type { Conversation, ConversationTab } from '@/features/groups/types'

defineProps<{
  pinned: Conversation[]
  recent: Conversation[]
  activeId: number
  tab: ConversationTab
  generalCount: number
  archiveCount: number
}>()

const search = defineModel<string>('search', { required: true })

defineEmits<{ select: [id: number]; 'update:tab': [tab: ConversationTab] }>()
</script>

<template>
  <section class="flex flex-col w-full sm:w-[320px] shrink-0 border-r border-border bg-white slide-left d1">
    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-extrabold text-[20px] text-ink">Messages</h2>
        <button
          type="button"
          class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
        >
          <PenSquare class="h-[18px] w-[18px]" />
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <Search class="h-[18px] w-[18px] text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          type="text"
          placeholder="Search messages, people…"
          class="w-full h-11 pl-11 pr-4 rounded-xl bg-bg border border-border text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald/50 transition"
        />
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-2 mt-4 p-1 bg-bg rounded-xl">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition"
          :class="tab === 'general' ? 'text-white shadow-lg shadow-emerald/30' : 'text-muted hover:text-ink'"
          :style="tab === 'general' ? { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))' } : undefined"
          @click="$emit('update:tab', 'general')"
        >
          General
          <span
            class="text-[11px] px-1.5 rounded-md"
            :class="tab === 'general' ? 'bg-white/25' : 'bg-slate-200 text-muted'"
          >
            {{ generalCount }}
          </span>
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition"
          :class="tab === 'archive' ? 'text-white shadow-lg shadow-emerald/30' : 'text-muted hover:text-ink'"
          :style="tab === 'archive' ? { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))' } : undefined"
          @click="$emit('update:tab', 'archive')"
        >
          Archive
          <span
            class="text-[11px] px-1.5 rounded-md"
            :class="tab === 'archive' ? 'bg-white/25' : 'bg-slate-200 text-muted'"
          >
            {{ archiveCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
      <template v-if="pinned.length">
        <p class="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted/70 flex items-center gap-1">
          <Pin class="h-3 w-3" /> Pinned
        </p>
        <ConversationRow
          v-for="c in pinned"
          :key="c.id"
          class="rise d2"
          :conversation="c"
          :active="c.id === activeId"
          @select="$emit('select', $event)"
        />
      </template>

      <p
        v-if="recent.length"
        class="px-3 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted/70"
      >
        Recent
      </p>
      <ConversationRow
        v-for="c in recent"
        :key="c.id"
        :conversation="c"
        :active="c.id === activeId"
        @select="$emit('select', $event)"
      />

      <div
        v-if="!pinned.length && !recent.length"
        class="px-4 py-12 text-center text-muted text-[13px]"
      >
        No conversations found.
      </div>
    </div>
  </section>
</template>
