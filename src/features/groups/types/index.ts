/** Online status shown as a small dot on avatars. */
export type Presence = 'online' | 'offline' | 'away'

/** A person in a conversation or member list. */
export interface Member {
  id: number
  name: string
  /** Avatar image URL (falls back to initials when absent). */
  avatar?: string
  /** Initials shown when there's no avatar image. */
  initials?: string
  /** Background color for the initials avatar (hex). */
  color?: string
  presence?: Presence
  admin?: boolean
}

/** Kinds of message rendered in the thread. */
export type MessageKind = 'text' | 'image' | 'voice'

/** Delivery state for outgoing messages (drives the tick icon). */
export type MessageStatus = 'sent' | 'read'

export interface Reaction {
  emoji: string
  count: number
}

export interface Message {
  id: number
  /** Sender member id; messages from the current user set `outgoing`. */
  senderId: number
  kind: MessageKind
  /** Whether the current user sent it (right-aligned, branded bubble). */
  outgoing: boolean
  time: string
  /** text/caption body. */
  text?: string
  /** image URL (kind === 'image'). */
  image?: string
  /** voice clip length, e.g. "0:15" (kind === 'voice'). */
  duration?: string
  reactions?: Reaction[]
  status?: MessageStatus
}

/** A study-group or direct conversation in the list. */
export interface Conversation {
  id: number
  name: string
  /** Group subtitle, e.g. course name. */
  subtitle?: string
  avatar?: string
  initials?: string
  /** Gradient/solid background for the group avatar (hex or CSS gradient). */
  color?: string
  pinned?: boolean
  archived?: boolean
  unread?: number
  lastTime?: string
  /** Last-message preview shown in the list. */
  preview?: string
  /** Sender label prefix for the preview, e.g. "Jasmin". */
  previewSender?: string
  /** Read receipt to show on the preview line. */
  previewRead?: boolean
  /** Whether the preview is a "typing…" placeholder. */
  previewTyping?: boolean
  /** For DMs: the other person's presence. */
  presence?: Presence
  memberCount?: number
  onlineCount?: number
  members: Member[]
  /** Name of someone currently typing in the thread (shows the indicator). */
  typingMemberId?: number
  messages: Message[]
}

/** Conversation-list filter tab. */
export type ConversationTab = 'general' | 'archive'
