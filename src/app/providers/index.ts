import { watch } from 'vue'
import type { App } from 'vue'
import type { Pinia } from 'pinia'

import { useAppStore } from '@/app/stores/useAppStore'

/**
 * Application-level providers.
 *
 * Runs outside component setup, so stores must receive the pinia instance
 * explicitly rather than relying on the module-global "active pinia" (which
 * HMR can reset). Currently it reflects the global theme onto the document
 * root so the persisted `theme` preference takes effect on load and on every
 * change.
 */
export function registerProviders(_app: App, pinia: Pinia): void {
  const appStore = useAppStore(pinia)

  const applyTheme = (dark: boolean): void => {
    document.documentElement.classList.toggle('dark', dark)
  }

  applyTheme(appStore.isDark)
  watch(() => appStore.isDark, applyTheme)
}
