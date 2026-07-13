import { onBeforeUnmount, ref } from 'vue'

import type { Assignment } from '@/features/assignments/types'
import { buildStudyPlan, type PlanStep } from '@/features/assignments/composables/useStudyPlan'

export type PlanPhase = 'idle' | 'thinking' | 'plan'

/**
 * Drives the AI study-planner "reveal" animation: a thinking pause, then the
 * intro types out character by character, then the steps pop in one at a time.
 *
 * Shared by the planner modal and the detail-page panel so the animation only
 * lives in one place. Timers are cleaned up on unmount.
 */
export function usePlanReveal() {
  const phase = ref<PlanPhase>('idle')
  const introHtml = ref('')
  const typedText = ref('')
  const typingDone = ref(false)
  const visibleSteps = ref<PlanStep[]>([])
  const lastSteps = ref<PlanStep[]>([])

  let timers: ReturnType<typeof setTimeout>[] = []
  let typer: ReturnType<typeof setInterval> | null = null

  function clearTimers(): void {
    timers.forEach((t) => clearTimeout(t))
    timers = []
    if (typer) {
      clearInterval(typer)
      typer = null
    }
  }

  function reset(): void {
    clearTimers()
    phase.value = 'idle'
    introHtml.value = ''
    typedText.value = ''
    typingDone.value = false
    visibleSteps.value = []
    lastSteps.value = []
  }

  /** Strip tags to get the plain text we "type" out char by char. */
  function plainText(html: string): string {
    return html.replace(/<[^>]+>/g, '')
  }

  function typeIntro(html: string, done: () => void): void {
    const text = plainText(html)
    let i = 0
    typingDone.value = false
    typedText.value = ''
    // 2 chars per 16ms tick (~120 chars/sec) reads as a natural typing speed
    // without needing a timer per character.
    typer = setInterval(() => {
      i += 2
      typedText.value = text.slice(0, i)
      if (i >= text.length) {
        if (typer) clearInterval(typer)
        typer = null
        typingDone.value = true
        done()
      }
    }, 16)
  }

  function revealSteps(steps: PlanStep[]): void {
    // Stagger each step's appearance by 260ms so they pop in one at a time
    // rather than all at once.
    steps.forEach((step, idx) => {
      timers.push(
        setTimeout(() => {
          visibleSteps.value.push(step)
        }, idx * 260),
      )
    })
  }

  /** Generate and animate a plan for the given assignment. */
  function generate(assignment: Assignment): void {
    reset()
    phase.value = 'thinking'
    // Artificial 1.1s "thinking" delay before the (instantly-computed) plan
    // appears, so the AI planner reads as deliberating rather than instant.
    timers.push(
      setTimeout(() => {
        const plan = buildStudyPlan(assignment)
        introHtml.value = plan.intro
        lastSteps.value = plan.steps
        phase.value = 'plan'
        typeIntro(plan.intro, () => revealSteps(plan.steps))
      }, 1100),
    )
  }

  onBeforeUnmount(clearTimers)

  return { phase, introHtml, typedText, typingDone, visibleSteps, lastSteps, generate, reset }
}
