import { apiClient } from '@/api/client'
import type { ApiEnvelope, Credentials, LoginResponse, RegisterCredentials, RegisterResponse } from '@/features/auth/types'

// Unlike auth.api.ts, these calls expect responses wrapped in the backend's
// standard { status, success, message, data } envelope, so each call unwraps
// `.data.data` to get the actual payload.
export const authRequest = {
  async login(credentials: Credentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', credentials)
    return data.data
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const { data } = await apiClient.post<ApiEnvelope<RegisterResponse>>('/auth/register', credentials)
    return data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },
}
