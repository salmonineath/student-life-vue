import type { RouteRecordRaw } from 'vue-router'

export const groupsRoutes: RouteRecordRaw[] = [
  {
    path: 'groups',
    name: 'groups',
    meta: { title: 'Study Groups' },
    component: () => import('@/features/groups/views/GroupsView.vue'),
  },
]
