import axios from 'axios'
import { setupInterceptors } from './interceptors'

/**
 * Shared Axios instance. Every feature's `*.api.ts` should import this
 * rather than constructing its own client, so base URL, headers, and
 * interceptors stay centralized.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

setupInterceptors(apiClient)
