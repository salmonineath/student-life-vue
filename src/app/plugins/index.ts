import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { router } from '@/app/router'
import { registerProviders } from '@/app/providers'

/**
 * Registers all global plugins on the Vue app instance.
 * Called once from `main.ts`.
 */
export function registerPlugins(app: App): void {
  const pinia = createPinia()
  // Opt-in persistence: stores enable it via their `persist` option.
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  app.use(router)

  // Providers run after pinia/router so they may safely use stores.
  registerProviders(app)
}
