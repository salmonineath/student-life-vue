import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORAGE_KEYS } from '@/shared/constants'

export type Theme = 'light' | 'dark' | 'system'

/** General, app-wide settings that aren't worth their own store (yet). */
export interface AppSettings {
  /** BCP-47 locale, e.g. 'en', 'km'. */
  locale: string
}

/**
 * Global application UI/shell state — cross-cutting concerns shared by the
 * layout and many features (loading overlay, sidebar, theme, settings).
 *
 * Lives in `app/stores` rather than a feature folder because it belongs to no
 * single feature. `isLoading` is intentionally NOT persisted (transient);
 * theme/sidebar/settings are persisted so the shell looks the same on reload.
 */
export const useAppStore = defineStore(
  'app',
  () => {
    // --- State ---
    const isLoading = ref(false)
    const sidebarCollapsed = ref(false)
    const theme = ref<Theme>('system')
    const settings = ref<AppSettings>({ locale: 'en' })

    // --- Getters ---
    const isDark = computed(() => {
      if (theme.value === 'system') {
        // Guard against SSR/non-browser environments where `window` and
        // matchMedia don't exist; 'system' theme falls back to light there.
        return (
          typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-color-scheme: dark)').matches
        )
      }
      return theme.value === 'dark'
    })

    // --- Actions ---
    function setLoading(value: boolean): void {
      isLoading.value = value
    }

    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setSidebar(collapsed: boolean): void {
      sidebarCollapsed.value = collapsed
    }

    function setTheme(value: Theme): void {
      theme.value = value
    }

    function updateSettings(partial: Partial<AppSettings>): void {
      settings.value = { ...settings.value, ...partial }
    }

    return {
      isLoading,
      sidebarCollapsed,
      theme,
      settings,
      isDark,
      setLoading,
      toggleSidebar,
      setSidebar,
      setTheme,
      updateSettings,
    }
  },
  {
    persist: {
      key: STORAGE_KEYS.app,
      // Persist user preferences only — never the transient loading flag.
      pick: ['theme', 'sidebarCollapsed', 'settings'],
    },
  },
)
