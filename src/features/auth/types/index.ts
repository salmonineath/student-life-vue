/** Auth feature types. */

export interface Credentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string | number
  email: string
  name: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}
