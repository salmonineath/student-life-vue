import type { ID } from '@/shared/types'

/** A single in-app notification shown in the notification center/badge. */
export interface AppNotification {
  id: ID
  title: string
  message?: string
  read: boolean
  /** ISO timestamp. */
  createdAt: string
}
