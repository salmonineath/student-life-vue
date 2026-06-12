import type { RouteRecordRaw } from 'vue-router'

export const assignmentsRoutes: RouteRecordRaw[] = [
  {
    path: 'assignments',
    name: 'assignments',
    component: () => import('@/features/assignments/views/AssignmentsView.vue'),
  },
]
