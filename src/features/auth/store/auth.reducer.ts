import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'
import type { AuthUser } from '@/features/auth/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Auth state is derived solely from presence of a token — there's no
    // separate "logged in" flag to keep in sync.
    const isAuthenticated = computed(() => !!token.value)

    function setSession(payload: { user: AuthUser; token: string }): void {
      user.value = payload.user
      token.value = payload.token
    }

    function setLoading(val: boolean) {
      loading.value = val
    }

    function setError(msg: string | null) {
      error.value = msg
    }

    function reset() {
      user.value = null
      token.value = null
      loading.value = false
      error.value = null
    }

    return { user, token, loading, error, isAuthenticated, setSession, setLoading, setError, reset }
  },
  {
    // Persists only user/token to storage (not loading/error, which are
    // transient UI state and shouldn't survive a page reload).
    persist: {
      key: STORAGE_KEYS.auth,
      pick: ['user', 'token'],
    },
  },
)
