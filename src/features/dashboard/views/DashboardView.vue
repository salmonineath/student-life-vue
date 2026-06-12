<script setup lang="ts">
import HeroSection from '@/features/dashboard/components/HeroSection.vue'
import ScheduleCard from '@/features/dashboard/components/ScheduleCard.vue'
import DeadlinesCard from '@/features/dashboard/components/DeadlinesCard.vue'
import GroupActivityCard from '@/features/dashboard/components/GroupActivityCard.vue'
import AssignmentsCard from '@/features/dashboard/components/AssignmentsCard.vue'
import ProgressCard from '@/features/dashboard/components/ProgressCard.vue'
import { useDashboardProgress } from '@/features/dashboard/composables/useDashboardProgress'
import type { DashboardAssignment } from '@/features/dashboard/types'

const { done, toggle, completionPct, counts } = useDashboardProgress()

// Static figures from the prototype.
const classesToday = 1
const assignment: DashboardAssignment = {
  title: 'My assignment',
  tag: 'IT',
  due: 'Due in 6 days',
  progress: 15,
}
</script>

<template>
  <HeroSection
    class="rise d2 mb-5"
    :classes-today="classesToday"
    :due-this-week="counts.upcoming + counts.done"
    :completion-pct="completionPct"
  />

  <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
    <!-- LEFT column -->
    <div class="xl:col-span-7 flex flex-col gap-5">
      <ScheduleCard class="rise d3" :assignment="assignment" />
      <DeadlinesCard class="rise d5" :assignment="assignment" />
      <GroupActivityCard class="rise d7 xl:flex-1" />
    </div>

    <!-- RIGHT column -->
    <div class="xl:col-span-5 flex flex-col gap-5">
      <AssignmentsCard
        class="rise d4"
        :assignment="assignment"
        :counts="counts"
        :done="done"
        @toggle="toggle"
      />
      <ProgressCard class="rise d6 xl:flex-1" :completion-pct="completionPct" :counts="counts" />
    </div>
  </div>
</template>
