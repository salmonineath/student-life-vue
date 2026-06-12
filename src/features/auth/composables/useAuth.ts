import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/features/auth/store/useAuthStore'

/**
 * Thin composable exposing auth state/actions to components without them
 * reaching into the store directly. Keeps components decoupled from Pinia.
 */
export function useAuth() {
  const store = useAuthStore()
  const { user, isAuthenticated } = storeToRefs(store)

  return {
    user,
    isAuthenticated,
    login: store.login,
    logout: store.logout,
  }
}
