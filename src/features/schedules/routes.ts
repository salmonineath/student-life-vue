import type { RouteRecordRaw } from 'vue-router'

export const schedulesRoutes: RouteRecordRaw[] = [
  {
    path: 'schedules',
    name: 'schedules',
    meta: { title: 'Schedule' },
    component: () => import('@/features/schedules/views/SchedulesView.vue'),
  },
]
