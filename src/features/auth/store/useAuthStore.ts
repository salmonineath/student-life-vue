import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '@/features/auth/api/auth.api'
import { STORAGE_KEYS } from '@/shared/constants'
import type { AuthUser, Credentials } from '@/features/auth/types'

/**
 * Auth store (Pinia setup syntax).
 *
 * Holds the authenticated user and access token — true global state, since
 * routing guards, the API client, and many features all read it. Persistence
 * is handled by `pinia-plugin-persistedstate` (no manual localStorage), so a
 * page refresh keeps the user signed in.
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    async function login(credentials: Credentials): Promise<void> {
      const session = await authApi.login(credentials)
      user.value = session.user
      token.value = session.token
    }

    async function logout(): Promise<void> {
      await authApi.logout()
      $reset()
    }

    /** Clears all auth state (persisted copy is updated automatically). */
    function $reset(): void {
      user.value = null
      token.value = null
    }

    return { user, token, isAuthenticated, login, logout, $reset }
  },
  {
    persist: {
      key: STORAGE_KEYS.auth,
      pick: ['user', 'token'],
    },
  },
)
