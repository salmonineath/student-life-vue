import { ref } from 'vue'

export interface ConfirmOptions {
  title: string
  /** Optional supporting line under the title. */
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Style the confirm action as destructive (red). */
  danger?: boolean
}

interface ActiveConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

const active = ref<ActiveConfirm | null>(null)

/**
 * Global confirm dialog.
 *
 * Like useToasts, state lives at module scope and is rendered once by
 * <ConfirmDialog> in the layout, so any feature can await a confirmation
 * without mounting its own modal:
 *
 *   const ok = await confirm({ title: 'Delete event?', danger: true })
 */
export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    // A second request supersedes a pending one rather than stacking.
    active.value?.resolve(false)
    return new Promise((resolve) => {
      active.value = { ...options, resolve }
    })
  }

  /** Resolve the pending dialog. Called by <ConfirmDialog> only. */
  function settle(ok: boolean): void {
    active.value?.resolve(ok)
    active.value = null
  }

  return { active, confirm, settle }
}
