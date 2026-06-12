import type { RouteRecordRaw } from 'vue-router'

export const assignmentsRoutes: RouteRecordRaw[] = [
  {
    path: 'assignments',
    name: 'assignments',
    meta: { title: 'Assignments' },
    component: () => import('@/features/assignments/views/AssignmentsView.vue'),
  },
  {
    path: 'assignments/:id',
    name: 'assignment-detail',
    meta: { title: 'Assignment' },
    component: () => import('@/features/assignments/views/AssignmentDetailView.vue'),
  },
]
