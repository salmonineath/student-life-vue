/** Auth feature types. */

export interface Credentials {
  email_or_username: string
  password: string
}

export interface AuthUser {
  id: string | number
  email: string
  username: string
  name: string
  roles: string[]
}

export interface AuthSession {
  user: AuthUser
  token: string
}

/** Universal response envelope from the API. */
export interface ApiEnvelope<T> {
  status: number
  success: boolean
  message: string
  data: T
}

/** Raw shape inside `data` for POST /api/v1/auth/login */
export interface LoginResponse {
  accessToken: string
}

export interface RegisterCredentials {
  fullname: string
  username: string
  email: string
  password: string
}

// email/username are optional here because the register endpoint doesn't
// always echo them back — auth.action.ts falls back to the submitted form
// values when building the stored AuthUser.
export interface RegisterUser {
  id: number | string
  fullname: string
  username?: string
  email?: string
  roles: string[]
}

/** Raw shape inside `data` for POST /api/v1/auth/register */
export interface RegisterResponse {
  accessToken: string
  user: RegisterUser
}
