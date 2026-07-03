<script setup lang="ts">
import { watch } from 'vue'
import { AlertTriangle, HelpCircle } from 'lucide-vue-next'

import { useConfirm } from '@/shared/composables/useConfirm'

const { active, settle } = useConfirm()

// Capture phase + stopPropagation so Escape/Enter settle only this dialog,
// not a modal open underneath (e.g. the event form's own Escape handler).
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.stopPropagation()
    settle(false)
  } else if (e.key === 'Enter') {
    e.stopPropagation()
    settle(true)
  }
}

watch(active, (a) => {
  if (a) window.addEventListener('keydown', onKeydown, { capture: true })
  else window.removeEventListener('keydown', onKeydown, { capture: true })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="active"
      class="modal-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      :aria-label="active.title"
      @click.self="settle(false)"
    >
      <div class="modal-panel bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
        <div class="flex items-start gap-3.5">
          <span
            class="h-11 w-11 shrink-0 grid place-items-center rounded-2xl"
            :class="active.danger ? 'bg-danger/10 text-danger-ink' : 'bg-emerald/10 text-emerald-ink'"
          >
            <component :is="active.danger ? AlertTriangle : HelpCircle" class="h-5 w-5" />
          </span>
          <div class="min-w-0 pt-0.5">
            <h2 class="text-[16px] font-bold text-ink" style="font-family: var(--font-display)">
              {{ active.title }}
            </h2>
            <p v-if="active.message" class="mt-1 text-[13.5px] text-muted leading-relaxed">
              {{ active.message }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-6">
          <button
            type="button"
            class="px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-ink hover:bg-bg transition"
            @click="settle(false)"
          >
            {{ active.cancelLabel ?? 'Cancel' }}
          </button>
          <button
            type="button"
            class="px-6 py-2.5 rounded-full text-white text-[13.5px] font-semibold shadow-lg hover:-translate-y-0.5 transition"
            :class="active.danger ? 'shadow-danger/25' : 'shadow-emerald/25'"
            :style="{
              background: active.danger
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))',
            }"
            @click="settle(true)"
          >
            {{ active.confirmLabel ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
