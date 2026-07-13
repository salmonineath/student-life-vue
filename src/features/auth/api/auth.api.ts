import { apiClient } from '@/api/client'
import type { AuthSession, Credentials } from '@/features/auth/types'

/**
 * Auth API service. Wraps the shared Axios client so the store/composable
 * stay free of transport details. Endpoint paths are placeholders — adjust
 * to your backend.
 */
// NOTE: not currently imported anywhere — auth.action.ts uses
// `authRequest` (auth.request.ts) instead, which unwraps the API's
// { data: { ... } } envelope. Kept here in case a non-enveloped backend
// variant is needed later.
export const authApi = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/auth/login', credentials)
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },
}
