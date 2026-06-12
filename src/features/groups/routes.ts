import type { RouteRecordRaw } from 'vue-router'

export const groupsRoutes: RouteRecordRaw[] = [
  {
    path: 'groups',
    name: 'groups',
    component: () => import('@/features/groups/views/GroupsView.vue'),
  },
]
