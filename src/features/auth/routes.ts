import type { RouteRecordRaw } from 'vue-router'

/**
 * Auth routes. Auth provides its own (centered) layout, so these are mounted
 * at the top level rather than as children of the default layout.
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/app/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'auth-login',
        component: () => import('@/features/auth/views/LoginView.vue'),
      },
    ],
  },
]
