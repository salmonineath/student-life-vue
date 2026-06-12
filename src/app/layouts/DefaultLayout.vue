<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppSidebar from '@/app/layouts/components/AppSidebar.vue'
import AppTopbar from '@/app/layouts/components/AppTopbar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <AppSidebar />

    <main class="flex-1 min-w-0">
      <AppTopbar />

      <div class="px-5 md:px-7 py-5">
        <RouterView />

        <footer class="text-center text-[12px] text-muted mt-6 pb-3">
          Student Life · Designed to keep your day calm &amp; productive 🌿
        </footer>
      </div>
    </main>
  </div>
</template>
