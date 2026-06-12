import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ID } from '@/shared/types'
import type { AppNotification } from '@/features/notifications/types'

/**
 * Notification store.
 *
 * Notifications are global: the unread badge appears in the app shell while
 * the full list is shown on the notifications page — i.e. shared across more
 * than one feature, which is exactly when Pinia is warranted. The list is
 * server-driven, so it is NOT persisted; refetch on load instead.
 */
export const useNotificationStore = defineStore('notifications', () => {
  // --- State ---
  const notifications = ref<AppNotification[]>([])

  // --- Getters ---
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length,
  )
  const hasUnread = computed(() => unreadCount.value > 0)

  // --- Actions ---
  /** Replace the list, e.g. after fetching from the API. */
  function setNotifications(items: AppNotification[]): void {
    notifications.value = items
  }

  function add(notification: AppNotification): void {
    notifications.value.unshift(notification)
  }

  function markAsRead(id: ID): void {
    const target = notifications.value.find((n) => n.id === id)
    if (target) target.read = true
  }

  function markAllAsRead(): void {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  function remove(id: ID): void {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clear(): void {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    setNotifications,
    add,
    markAsRead,
    markAllAsRead,
    remove,
    clear,
  }
})
