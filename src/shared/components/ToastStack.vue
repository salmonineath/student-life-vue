<script setup lang="ts">
import {
  AlarmClock,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  PartyPopper,
  Sparkles,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-vue-next'

import { useToasts, type ToastColor, type ToastIcon } from '@/shared/composables/useToasts'

const { toasts, dismiss } = useToasts()

const ICONS: Record<ToastIcon, LucideIcon> = {
  check: Check,
  'check-check': CheckCheck,
  sparkles: Sparkles,
  trash: Trash2,
  party: PartyPopper,
  alarm: AlarmClock,
  clock: Clock,
  calendar: Calendar,
  star: Star,
}

const COLORS: Record<ToastColor, string> = {
  emerald: '#10B981',
  indigo: '#4F46E5',
  amber: '#F59E0B',
  danger: '#EF4444',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-20 right-5 z-[60] flex flex-col gap-3 w-[330px] max-w-[calc(100vw-2.5rem)]">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast bg-white border border-border rounded-2xl shadow-xl p-3.5 flex items-center gap-3"
        :class="{ out: t.leaving }"
      >
        <span
          class="h-9 w-9 shrink-0 grid place-items-center rounded-xl text-white"
          :style="{ background: COLORS[t.color] }"
        >
          <component :is="ICONS[t.icon]" class="h-[18px] w-[18px]" />
        </span>
        <!-- msg may contain inline <b> emphasis from reminders -->
        <p class="text-[13px] font-medium text-ink flex-1" v-html="t.msg"></p>
        <button
          type="button"
          class="text-muted hover:text-ink transition"
          aria-label="Dismiss"
          @click="dismiss(t.id)"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
