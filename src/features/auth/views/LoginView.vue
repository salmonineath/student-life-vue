<script setup lang="ts">
import { reactive } from 'vue'

import { useAuth } from '@/features/auth/composables/useAuth'
import type { Credentials } from '@/features/auth/types'

const { login } = useAuth()

const form = reactive<Credentials>({ email: '', password: '' })

async function onSubmit() {
  // Placeholder handler — wire navigation/error handling to your needs.
  await login({ ...form })
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <h1 class="text-lg font-semibold">Sign in</h1>
    <input v-model="form.email" type="email" placeholder="Email" class="border p-2 rounded" />
    <input v-model="form.password" type="password" placeholder="Password" class="border p-2 rounded" />
    <button type="submit" class="border p-2 rounded">Login</button>
  </form>
</template>
