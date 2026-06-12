import { watch } from 'vue'
import type { App } from 'vue'

import { useAppStore } from '@/app/stores/useAppStore'

/**
 * Application-level providers.
 *
 * Runs after Pinia is installed (see `plugins/index.ts`), so it may consume
 * stores. Currently it reflects the global theme onto the document root so the
 * persisted `theme` preference takes effect on load and on every change.
 */
export function registerProviders(_app: App): void {
  const appStore = useAppStore()

  const applyTheme = (dark: boolean): void => {
    document.documentElement.classList.toggle('dark', dark)
  }

  applyTheme(appStore.isDark)
  watch(() => appStore.isDark, applyTheme)
}
