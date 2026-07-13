import { useAuthStore } from './auth.reducer'
import { authRequest } from '../api/auth.request'
import type { Credentials, RegisterCredentials } from '@/features/auth/types'

// Decodes a JWT payload without verifying its signature. The backend already
// validated the token before issuing it, so this is only used to read claims
// (userId, email, etc.) for populating the local user profile — never trust
// this for authorization decisions.
function parseJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]
  // JWTs are base64url-encoded; swap to standard base64 alphabet before atob.
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

export async function loginAction(credentials: Credentials): Promise<void> {
  const store = useAuthStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const { accessToken } = await authRequest.login(credentials)
    // Login response only returns a token, not a user object — so the user
    // profile is derived entirely from the JWT claims here.
    const claims = parseJwt(accessToken)
    store.setSession({
      token: accessToken,
      user: {
        id: claims.userId as string | number,
        email: claims.email as string,
        username: claims.username as string,
        // No display name claim from login; fall back to username.
        name: (claims.username as string) ?? '',
        roles: (claims.role as string[]) ?? [],
      },
    })
  } catch (err) {
    store.setError('Login failed. Check your credentials and try again.')
    throw err
  } finally {
    store.setLoading(false)
  }
}

export async function registerAction(credentials: RegisterCredentials): Promise<void> {
  const store = useAuthStore()
  store.setLoading(true)
  store.setError(null)
  try {
    const { accessToken, user } = await authRequest.register(credentials)
    // Unlike login, register returns a user object directly — but it may omit
    // email/username, so fall back to what was submitted in the form.
    store.setSession({
      token: accessToken,
      user: {
        id: user.id,
        email: credentials.email,
        username: credentials.username,
        name: user.fullname,
        roles: user.roles,
      },
    })
  } catch (err) {
    store.setError('Registration failed. Please try again.')
    throw err
  } finally {
    store.setLoading(false)
  }
}

export async function logoutAction(): Promise<void> {
  const store = useAuthStore()
  try {
    await authRequest.logout()
  } finally {
    // Always clear local session state even if the server call fails, so the
    // user isn't stuck "logged in" locally with a token the server rejected.
    store.reset()
  }
}
