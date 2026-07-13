<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sparkles, WandSparkles, X } from 'lucide-vue-next'

import type { Assignment } from '@/features/assignments/types'
import { usePlanReveal } from '@/features/assignments/composables/usePlanReveal'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  assignments: Assignment[]
  /** Assignment to preselect when opened from a card. */
  preselectId: number | null
}>()

const selectedId = ref<number | null>(null)
const { phase, introHtml, typedText, typingDone, visibleSteps, generate, reset } = usePlanReveal()

// Reset on every open/close so a stale plan from a previous assignment never
// flashes before the new selection is made.
watch(open, (isOpen) => {
  reset()
  if (!isOpen) return
  selectedId.value =
    props.preselectId ?? (props.assignments.length ? props.assignments[0].id : null)
})

function close(): void {
  open.value = false
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}
watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

function onGenerate(): void {
  const a = props.assignments.find((x) => x.id === selectedId.value)
  if (a) generate(a)
}
</script>

<template>
  <div
    v-if="open"
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="modal-panel bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
      <div
        class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-white rounded-t-3xl"
      >
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-2xl grid place-items-center text-white shadow-lg shadow-indigo/30"
            style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
          >
            <Sparkles class="h-5 w-5" />
          </div>
          <div>
            <h3 class="font-display font-extrabold text-[19px] text-ink leading-none">
              AI Study Planner
            </h3>
            <p class="text-[12px] text-muted mt-1">Get a personalized, day-by-day plan</p>
          </div>
        </div>
        <button
          type="button"
          class="h-9 w-9 grid place-items-center rounded-xl border border-border text-muted hover:bg-bg transition"
          @click="close"
        >
          <X class="h-4.5 w-4.5" />
        </button>
      </div>

      <div class="px-6 py-5">
        <label class="text-[12.5px] font-semibold text-ink">Choose an assignment</label>
        <select
          v-model.number="selectedId"
          class="mt-1.5 w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition"
        >
          <option v-for="a in assignments" :key="a.id" :value="a.id">
            {{ a.title }} · {{ a.subject }}
          </option>
        </select>

        <button
          type="button"
          class="mt-4 w-full py-3 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo/25 hover:-translate-y-0.5 transition ai-btn"
          style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
          @click="onGenerate"
        >
          <WandSparkles class="h-4.5 w-4.5" /> Generate study plan
        </button>

        <div v-if="phase !== 'idle'" class="mt-5">
          <div class="rounded-2xl border border-indigo/20 bg-indigo/[.04] p-4 space-y-3">
            <div
              v-if="phase === 'thinking'"
              class="flex items-center gap-2 text-indigo-ink text-[13px] font-semibold py-2"
            >
              <span>Thinking</span>
              <span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>
            </div>

            <template v-else>
              <p class="text-[13px] text-ink leading-relaxed">
                <span v-if="typingDone" v-html="introHtml"></span>
                <template v-else>{{ typedText }}<span class="caret"></span></template>
              </p>

              <div class="space-y-2.5 pt-1">
                <div
                  v-for="(step, idx) in visibleSteps"
                  :key="idx"
                  class="pop-in flex items-start gap-3 bg-white rounded-xl border border-border p-3"
                >
                  <span
                    class="h-7 w-7 shrink-0 grid place-items-center rounded-lg text-white text-[12px] font-bold"
                    style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
                  >
                    {{ idx + 1 }}
                  </span>
                  <div>
                    <p class="text-[13px] font-bold text-ink">{{ step.title }}</p>
                    <p class="text-[12.5px] text-muted leading-snug mt-0.5">{{ step.detail }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
