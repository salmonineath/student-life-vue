import type { RouteRecordRaw } from 'vue-router'

export const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: 'notifications',
    name: 'notifications',
    component: () => import('@/features/notifications/views/NotificationsView.vue'),
  },
]
