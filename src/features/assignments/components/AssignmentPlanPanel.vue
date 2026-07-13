<script setup lang="ts">
import { computed } from 'vue'
import { ListPlus, Sparkles, WandSparkles } from 'lucide-vue-next'

import type { Assignment } from '@/features/assignments/types'
import { usePlanReveal } from '@/features/assignments/composables/usePlanReveal'

const props = defineProps<{ assignment: Assignment }>()

const emit = defineEmits<{ addTasks: [titles: string[]] }>()

const { phase, introHtml, typedText, typingDone, visibleSteps, lastSteps, generate } = usePlanReveal()

// Show "add as tasks" only once the steps have finished revealing. visibleSteps
// fills in one-by-one via a timer in usePlanReveal, so comparing its length to
// the full lastSteps list is how we detect the reveal animation has completed.
const allRevealed = computed(
  () => phase.value === 'plan' && visibleSteps.value.length === lastSteps.value.length && lastSteps.value.length > 0,
)

function addAsTasks(): void {
  emit('addTasks', lastSteps.value.map((s) => s.title))
}
</script>

<template>
  <section class="card p-5">
    <div class="flex items-center gap-3 mb-4">
      <div
        class="h-10 w-10 rounded-2xl grid place-items-center text-white shadow-lg shadow-indigo/30"
        style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
      >
        <Sparkles class="h-5 w-5" />
      </div>
      <div>
        <h3 class="font-display font-bold text-[16px] text-ink leading-none">AI Study Planner</h3>
        <p class="text-[12px] text-muted mt-1">A day-by-day plan you can turn into tasks</p>
      </div>
    </div>

    <button
      type="button"
      class="w-full py-3 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo/25 hover:-translate-y-0.5 transition ai-btn"
      style="background: linear-gradient(135deg, var(--indigo), #7c3aed)"
      @click="generate(assignment)"
    >
      <WandSparkles class="h-4.5 w-4.5" />
      {{ phase === 'idle' ? 'Generate study plan' : 'Regenerate plan' }}
    </button>

    <div v-if="phase !== 'idle'" class="mt-5 rounded-2xl border border-indigo/20 bg-indigo/[.04] p-4 space-y-3">
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

        <button
          v-if="allRevealed"
          type="button"
          class="pop-in w-full mt-1 py-2.5 rounded-xl border border-indigo/30 text-indigo-ink text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-indigo/10 transition"
          @click="addAsTasks"
        >
          <ListPlus class="h-4 w-4" /> Add these steps as tasks
        </button>
      </template>
    </div>
  </section>
</template>
