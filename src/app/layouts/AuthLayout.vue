<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- Soft ambient backdrop; auth views render as a centered card -->
  <div class="auth-bg min-h-dvh flex items-center justify-center p-4 sm:p-8">
    <RouterView />
  </div>
</template>

<style scoped>
.auth-bg {
  background-color: #f8fafc;
  background-image:
    radial-gradient(42rem 42rem at 8% -8%, rgba(16, 185, 129, 0.14), transparent 60%),
    radial-gradient(46rem 46rem at 108% 112%, rgba(124, 58, 237, 0.14), transparent 60%),
    radial-gradient(38rem 38rem at 92% -4%, rgba(79, 70, 229, 0.1), transparent 55%);
}
</style>
