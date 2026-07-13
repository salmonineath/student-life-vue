<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarClock,
  ClipboardList,
  Users,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  AtSign,
  ArrowRight,
} from 'lucide-vue-next'

import { useAuth } from '@/features/auth/composables/useAuth'
import type { RegisterCredentials } from '@/features/auth/types'
import logoUrl from '@/assets/logo.png'

const router = useRouter()
const { register } = useAuth()

const form = reactive<RegisterCredentials>({
  fullname: '',
  username: '',
  email: '',
  password: '',
})
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

// Matches the "Must be 8–64 characters" hint shown near the password field.
// Only the minimum is enforced client-side; the max (if any) is left to the
// backend to validate.
const MIN_PASSWORD_LENGTH = 8

// Only flags a mismatch once the user has typed something into "confirm" —
// avoids showing an error before they've had a chance to type anything.
const passwordMismatch = computed(
  () => confirmPassword.value.length > 0 && confirmPassword.value !== form.password,
)

const features = [
  { icon: CalendarClock, title: 'Smart Schedule', desc: 'Never miss a class or deadline' },
  { icon: ClipboardList, title: 'Assignments', desc: 'Stay on top of your coursework' },
  { icon: Users, title: 'Study Groups', desc: 'Collaborate with your peers' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Get instant homework help' },
]

async function onSubmit() {
  // Guard against double-submit from rapid repeated clicks/Enter presses.
  if (loading.value) return
  // Client-side validation runs before the request fires, so obviously
  // invalid submissions don't round-trip to the server.
  if (form.password.length < MIN_PASSWORD_LENGTH) {
    error.value = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    return
  }
  if (form.password !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // Spread into a plain object since `form` is a reactive proxy and
    // registerAction expects a plain RegisterCredentials value.
    await register({ ...form })
    router.push('/')
  } catch {
    // Kept generic/non-committal (rather than surfacing the raw backend
    // error) since the API may not distinguish "email taken" vs "username
    // taken" in a way that's safe to expose.
    error.value = 'Registration failed. Email or username may already be taken.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card-shell rise flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white sm:max-w-xl sm:rounded-3xl lg:max-w-4xl lg:flex-row">
    <!-- ══ Brand panel ══ -->
    <aside class="brand-panel relative hidden sm:flex flex-col gap-6 p-7 text-white overflow-hidden lg:w-[40%] lg:justify-between lg:gap-10 lg:p-9">
      <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald/15 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-indigo/20 blur-3xl" />

      <div class="relative slide-left">
        <div class="flex items-center gap-3">
          <img :src="logoUrl" alt="Student Life logo" class="h-11 w-11 rounded-full shadow-lg shadow-indigo/30 ring-1 ring-white/15" />
          <div>
            <p class="font-display text-[17px] font-bold leading-tight tracking-tight">Student Life</p>
            <p class="text-[10px] uppercase tracking-[0.22em] text-white/40">Academic companion</p>
          </div>
        </div>
      </div>

      <div class="relative">
        <h2 class="hidden lg:block font-display text-[22px] font-bold leading-snug tracking-tight slide-left d1">
          Everything your semester needs,
          <span class="grad-text">in one place.</span>
        </h2>
        <ul class="grid grid-cols-2 gap-1.5 lg:mt-6 lg:grid-cols-1">
          <li v-for="(f, i) in features" :key="f.title" :class="`feature-row slide-left d${i + 2}`">
            <span class="feature-ico">
              <component :is="f.icon" class="h-4 w-4" aria-hidden="true" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-white/90">{{ f.title }}</span>
              <span class="block truncate text-xs text-white/45 lg:whitespace-normal">{{ f.desc }}</span>
            </span>
          </li>
        </ul>
      </div>

      <p class="relative hidden lg:block text-[11px] text-white/30 slide-left d6">
        Built for students &middot; Your data stays yours
      </p>
    </aside>

    <!-- ══ Gradient seam ══ -->
    <div class="seam hidden sm:block shrink-0" aria-hidden="true" />

    <!-- ══ Form panel ══ -->
    <main class="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
      <div class="w-full max-w-sm">
        <!-- compact brand row (phones only) -->
        <div class="mb-8 flex items-center gap-3 sm:hidden rise">
          <img :src="logoUrl" alt="Student Life logo" class="h-10 w-10 rounded-full ring-1 ring-border" />
          <span class="font-display font-bold text-ink">Student Life</span>
        </div>

        <span class="welcome-pill rise d1">
          <span class="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden="true" />
          Get started
        </span>
        <h1 class="mt-4 font-display text-[26px] font-bold tracking-tight text-ink rise d2">
          Create your account
        </h1>
        <p class="mt-1.5 text-sm text-muted rise d2">Join thousands of students staying on track.</p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
          <!-- full name -->
          <div class="rise d3">
            <label for="fullname" class="field-label">Full name</label>
            <div class="field">
              <UserRound class="field-ico" aria-hidden="true" />
              <input
                id="fullname"
                v-model="form.fullname"
                type="text"
                name="fullname"
                autocomplete="name"
                required
                placeholder="Your full name"
                class="field-input"
              />
              <span class="field-line" aria-hidden="true" />
            </div>
          </div>

          <!-- username -->
          <div class="rise d3">
            <label for="username" class="field-label">Username</label>
            <div class="field">
              <AtSign class="field-ico" aria-hidden="true" />
              <input
                id="username"
                v-model="form.username"
                type="text"
                name="username"
                autocomplete="username"
                required
                placeholder="yourusername"
                class="field-input"
              />
              <span class="field-line" aria-hidden="true" />
            </div>
          </div>

          <!-- email -->
          <div class="rise d4">
            <label for="email" class="field-label">Email</label>
            <div class="field">
              <Mail class="field-ico" aria-hidden="true" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                required
                placeholder="you@university.edu"
                class="field-input"
              />
              <span class="field-line" aria-hidden="true" />
            </div>
          </div>

          <!-- password -->
          <div class="rise d4">
            <label for="password" class="field-label">Password</label>
            <div class="field">
              <Lock class="field-ico" aria-hidden="true" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="new-password"
                required
                placeholder="••••••••"
                class="field-input pr-9"
              />
              <button
                type="button"
                class="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted/60 hover:text-ink transition-colors cursor-pointer"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-[18px] w-[18px]" />
                <EyeOff v-else class="h-[18px] w-[18px]" />
              </button>
              <span class="field-line" aria-hidden="true" />
            </div>
            <p class="mt-1 text-[11px] text-muted">Must be 8–64 characters.</p>
          </div>

          <!-- confirm password -->
          <div class="rise d5">
            <label for="confirm-password" class="field-label">Confirm password</label>
            <div class="field">
              <Lock class="field-ico" aria-hidden="true" />
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                name="confirm-password"
                autocomplete="new-password"
                required
                placeholder="••••••••"
                class="field-input pr-9"
                :class="{ 'border-danger': passwordMismatch }"
              />
              <button
                type="button"
                class="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted/60 hover:text-ink transition-colors cursor-pointer"
                :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                @click="showConfirm = !showConfirm"
              >
                <Eye v-if="!showConfirm" class="h-[18px] w-[18px]" />
                <EyeOff v-else class="h-[18px] w-[18px]" />
              </button>
              <span class="field-line" :class="passwordMismatch ? 'mismatch' : ''" aria-hidden="true" />
            </div>
            <p v-if="passwordMismatch" class="mt-1 text-[11px] text-danger-ink">Passwords do not match.</p>
          </div>

          <p v-if="error" role="alert" class="text-sm text-danger-ink">{{ error }}</p>

          <!-- submit -->
          <button type="submit" :disabled="loading" class="cta rise d5">
            <span v-if="!loading" class="inline-flex items-center gap-2">
              Create account
              <ArrowRight class="cta-arrow h-4 w-4" aria-hidden="true" />
            </span>
            <span v-else class="inline-flex items-center gap-2.5">
              <span class="spinner" aria-hidden="true" />
              Creating account…
            </span>
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-muted rise d6">
          Already have an account?
          <RouterLink to="/login" class="font-semibold text-emerald-ink hover:text-emerald-dark transition-colors">
            Sign in
          </RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.card-shell {
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 24px 60px -24px rgba(15, 23, 42, 0.28);
}

.seam {
  height: 2px;
  width: 100%;
  background: linear-gradient(92deg, #10b981, #4f46e5 62%, #7c3aed);
}
@media (min-width: 1024px) {
  .seam {
    height: auto;
    width: 2px;
    align-self: stretch;
    background: linear-gradient(180deg, #10b981, #4f46e5 62%, #7c3aed);
  }
}

.brand-panel {
  background-color: #0f172a;
  background-image: radial-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 26px 26px;
}

.welcome-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #047857;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid transparent;
  border-radius: 0 0.75rem 0.75rem 0;
  transition: border-color 0.25s ease, background-color 0.25s ease;
}
@media (min-width: 1024px) {
  .feature-row { margin-left: -0.75rem; }
}
.feature-row:hover {
  border-left-color: var(--emerald);
  background: rgba(255, 255, 255, 0.04);
}
.feature-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.125rem;
  width: 2.125rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #4b5563;
  margin-bottom: 0.25rem;
}
.field { position: relative; }
.field-ico {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 17px;
  width: 17px;
  color: #9ca3af;
  transition: color 0.25s ease;
  pointer-events: none;
}
.field:focus-within .field-ico { color: var(--emerald); }
.field-input {
  width: 100%;
  padding: 0.75rem 0 0.75rem 1.75rem;
  font-size: 15px;
  color: #0f172a;
  background: transparent;
  border: 0;
  border-bottom: 2px solid #d7dce3;
  outline: none;
  transition: border-color 0.25s ease;
}
.field-input::placeholder { color: #9ca3af; }
.field-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(92deg, #10b981, #4f46e5, #7c3aed);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.field:focus-within .field-line { transform: scaleX(1); }
.field-line.mismatch {
  background: #ef4444;
  transform: scaleX(1);
}

.cta {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 0.875rem;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(92deg, #10b981, #4f46e5 62%, #7c3aed);
  background-size: 130% 100%;
  background-position: 0% 0;
  box-shadow: 0 14px 30px -12px rgba(79, 70, 229, 0.5);
  transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease;
}
.cta:hover:not(:disabled) {
  background-position: 100% 0;
  box-shadow: 0 18px 36px -12px rgba(79, 70, 229, 0.62);
  transform: translateY(-1px);
}
.cta:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.cta:disabled { opacity: 0.7; cursor: default; }
.cta:focus-visible { outline: 2px solid var(--indigo); outline-offset: 3px; }
.cta-arrow { transition: transform 0.25s ease; }
.cta:hover:not(:disabled) .cta-arrow { transform: translateX(3px); }

.spinner {
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
