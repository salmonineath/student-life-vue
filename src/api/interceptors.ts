import type { AxiosInstance } from 'axios'

import { useAuthStore } from '@/features/auth/store/auth.reducer'

/**
 * Attaches request/response interceptors to an Axios instance.
 *
 * Centralizing interceptors here keeps cross-cutting concerns (auth token
 * injection, error normalization, refresh logic) out of individual features.
 */
export function setupInterceptors(client: AxiosInstance): void {
  // --- Request: attach auth token from the auth store, if present ---
  client.interceptors.request.use((config) => {
    // Resolved lazily per request, so Pinia is guaranteed to be active.
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  })

  // --- Response: pass through, normalize errors ---
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // TODO: hook in global error handling / 401 refresh here.
      return Promise.reject(error)
    },
  )
}
