<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Search, Bell, ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ title?: string }>(), { title: '' })

// Title falls back to the active route's meta title, then "Dashboard".
const route = useRoute()
const title = computed(() => props.title || (route.meta.title as string) || 'Dashboard')

// Reactive search state replaces the uncontrolled DOM input.
const search = ref('')
</script>

<template>
  <header
    class="sticky top-0 z-20 backdrop-blur bg-bg/80 border-b border-border px-5 md:px-8 py-4 flex items-center justify-between rise d1"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="lg:hidden h-9 w-9 grid place-items-center rounded-xl border border-border bg-white text-muted"
      >
        <Menu class="h-5 w-5" />
      </button>
      <h1 class="font-display font-bold text-xl text-ink">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-3 md:gap-4">
      <div
        class="hidden md:flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 text-muted w-64"
      >
        <Search class="h-4 w-4" />
        <input
          v-model="search"
          class="bg-transparent outline-none text-sm w-full placeholder:text-muted/70"
          placeholder="Search anything…"
        />
      </div>
      <button
        type="button"
        class="bell relative h-10 w-10 grid place-items-center rounded-xl border border-border bg-white text-ink hover:bg-bg transition"
      >
        <Bell class="bell-ico h-[18px] w-[18px]" />
        <span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white"></span>
      </button>
      <div class="flex items-center gap-2.5 pl-1">
        <div
          class="h-10 w-10 rounded-xl grid place-items-center text-white font-semibold text-sm shadow-md shadow-indigo/20"
          style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
        >
          SL
        </div>
        <div class="hidden sm:block leading-tight">
          <p class="text-[13.5px] font-semibold text-ink">Student Life Admin</p>
          <p class="text-[11.5px] text-muted">Student</p>
        </div>
        <ChevronDown class="h-4 w-4 text-muted hidden sm:block" />
      </div>
    </div>
  </header>
</template>
