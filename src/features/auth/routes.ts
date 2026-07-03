import type { RouteRecordRaw } from 'vue-router'

/**
 * Auth routes. Auth provides its own centered layout.
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/',
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