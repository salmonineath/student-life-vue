import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/features/auth/store/auth.reducer'
import { loginAction, logoutAction, registerAction } from '@/features/auth/store/auth.action'

export function useAuth() {
  const store = useAuthStore()
  // storeToRefs keeps these reactive when destructured (plain destructuring
  // off a Pinia store would lose reactivity). Views currently track their
  // own local loading/error state and don't consume these, but they're
  // exposed here for any consumer that wants the store's canonical state.
  const { user, isAuthenticated, loading, error } = storeToRefs(store)

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
  }
}
