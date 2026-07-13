import type { RouteRecordRaw } from 'vue-router'

/**
 * Auth routes. Auth provides its own centered layout.
 */
// No route guard here (e.g. redirecting an already-authenticated user away
// from /login, or blocking unauthenticated access to protected routes) —
// there's currently no global navigation guard in the app at all, so access
// control is effectively enforced only by the API (401s) rather than routing.
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
      {
        path: 'register',
        name: 'auth-register',
        component: () => import('@/features/auth/views/RegisterView.vue'),
      },
    ],
  },
]