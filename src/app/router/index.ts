import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import DefaultLayout from '@/app/layouts/DefaultLayout.vue'

import { dashboardRoutes } from '@/features/dashboard/routes'
import { authRoutes } from '@/features/auth/routes'
import { usersRoutes } from '@/features/users/routes'
import { assignmentsRoutes } from '@/features/assignments/routes'
import { schedulesRoutes } from '@/features/schedules/routes'
import { notificationsRoutes } from '@/features/notifications/routes'
import { groupsRoutes } from '@/features/groups/routes'
import { settingsRoutes } from '@/features/settings/routes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      // Dashboard is the home route.
      ...dashboardRoutes,
      // Feature routes rendered inside the default (authenticated) layout.
      ...usersRoutes,
      ...assignmentsRoutes,
      ...schedulesRoutes,
      ...notificationsRoutes,
      ...groupsRoutes,
      ...settingsRoutes,
    ],
  },
  // Auth feature brings its own layout (see features/auth/routes.ts).
  ...authRoutes,
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
