<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppSidebar from '@/app/layouts/components/AppSidebar.vue'
import AppTopbar from '@/app/layouts/components/AppTopbar.vue'
import ToastStack from '@/shared/components/ToastStack.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import { useEventReminders } from '@/features/schedules/composables/useEventReminders'

// Frontend-only event reminders (no backend scheduling yet). Runs app-wide so
// a reminder fires no matter which page the student is on.
useEventReminders()
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

    <!-- Single global instances — views must not mount their own. -->
    <ToastStack />
    <ConfirmDialog />
  </div>
</template>
