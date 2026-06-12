import type { RouteRecordRaw } from 'vue-router'

export const schedulesRoutes: RouteRecordRaw[] = [
  {
    path: 'schedules',
    name: 'schedules',
    component: () => import('@/features/schedules/views/SchedulesView.vue'),
  },
]
