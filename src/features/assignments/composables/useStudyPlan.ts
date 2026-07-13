import type { Assignment } from '@/features/assignments/types'
import { daysLeft } from '@/features/assignments/helpers'

/** A single titled step of a generated study plan. */
export interface PlanStep {
  title: string
  detail: string
}

export interface StudyPlan {
  /** Intro sentence (may contain inline <b> emphasis). */
  intro: string
  steps: PlanStep[]
}

/**
 * Build a deterministic, day-by-day study plan for an assignment.
 *
 * The shape of the plan depends on how much time is left: a tight turnaround
 * gets a triage-and-sprint plan, while a comfortable runway gets milestones
 * with a buffer day. Pure function — the modal handles the typing animation.
 */
export function buildStudyPlan(a: Assignment): StudyPlan {
  // Clamp to at least 1 day so overdue/due-today assignments still get a
  // (single-day, sprint-style) plan instead of dividing by zero/negative below.
  const dl = Math.max(daysLeft(a.deadline), 1)
  const remaining = 100 - a.progress
  const intro =
    `Here's a focused plan for <b>${a.title}</b> (${a.subject}). ` +
    `You have <b>${dl} day${dl > 1 ? 's' : ''}</b> and <b>${remaining}%</b> left to complete.`

  // Plan shape is tiered by runway: same-day/overdue gets a triage-and-sprint
  // plan, a short window gets a 2-3 day breakdown, anything longer gets
  // milestones with a review buffer day built in.
  let steps: PlanStep[]
  if (dl <= 1) {
    steps = [
      { title: 'Triage now', detail: 'List every remaining sub-task and rank by impact — finish must-haves first.' },
      { title: 'Deep work block', detail: 'Do a focused 90-minute sprint on the highest-value piece, phone away.' },
      { title: 'Draft & fill gaps', detail: 'Get a rough complete version down — done beats perfect under time pressure.' },
      { title: 'Polish & submit', detail: 'Proofread, check the brief, export, and submit with buffer time.' },
    ]
  } else if (dl <= 3) {
    steps = [
      { title: 'Day 1 — Plan & gather', detail: 'Break the work into chunks and collect all sources/material you need.' },
      { title: 'Day 1–2 — Core work', detail: 'Knock out the largest section while energy is high; aim for +40% progress.' },
      { title: 'Day 2 — Build out', detail: 'Complete the remaining sections and add supporting detail.' },
      { title: 'Final day — Review', detail: 'Edit, fact-check, format to the rubric, then submit early.' },
    ]
  } else {
    // Spread remaining progress over at most 6 study days (the last day is
    // reserved as a buffer below), so the per-day target doesn't get diluted
    // to near-zero on very long deadlines.
    const perDay = Math.ceil(remaining / Math.min(dl, 6))
    steps = [
      { title: 'Set milestones', detail: `Aim for about +${perDay}% each study day to stay comfortably ahead.` },
      { title: 'Research phase', detail: 'Spend the first sessions gathering and outlining — structure saves time later.' },
      { title: 'Build the body', detail: 'Write/solve the main content in daily focused blocks of 45–60 minutes.' },
      { title: 'Buffer day', detail: 'Reserve a day before the deadline purely for review and formatting.' },
      { title: 'Submit early', detail: 'Hand in a day ahead to avoid last-minute tech issues.' },
    ]
  }
  return { intro, steps }
}
