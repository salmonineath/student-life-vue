import type { Conversation, Member } from './types'

/** Current user id (their messages render as outgoing). */
export const ME = 0

const AV = (n: number) => `https://i.pravatar.cc/96?img=${n}`

/** Shared people directory. */
export const PEOPLE: Record<string, Member> = {
  me: { id: ME, name: 'You', avatar: AV(47) },
  jasmin: { id: 1, name: 'Jasmin Lowery', avatar: AV(45) },
  alex: { id: 2, name: 'Alex Hunt', avatar: AV(8), presence: 'online' },
  jessie: { id: 3, name: 'Jessie Rollins', avatar: AV(12) },
  max: { id: 4, name: 'Max Padilla', avatar: AV(32) },
  tanisha: { id: 5, name: 'Tanisha Combs', avatar: AV(20), admin: true },
  albert: { id: 6, name: 'Prof. Albert Flores', avatar: AV(12), presence: 'online' },
  annette: { id: 7, name: 'Annette Black', avatar: AV(5), presence: 'offline' },
  jerome: { id: 8, name: 'Jerome Bell', avatar: AV(33) },
  wanda: { id: 9, name: 'Wanda Hall', avatar: AV(60) },
  victor: { id: 10, name: 'Victor Olson', avatar: AV(15) },
  steven: { id: 11, name: 'Steven Diaz', initials: 'SD', color: '#F59E0B' },
}

const BRAND = 'linear-gradient(135deg, #10B981, #4F46E5)'
const VIOLET = 'linear-gradient(135deg, #4F46E5, #7C3AED)'

export function seedConversations(): Conversation[] {
  return [
    {
      id: 1,
      name: 'CS-204 Study Group',
      subtitle: 'Algorithms & Data Structures',
      initials: 'CS',
      color: BRAND,
      pinned: true,
      unread: 5,
      lastTime: '4m',
      previewSender: 'Jasmin',
      preview: 'I added the new flow diagrams…',
      memberCount: 23,
      onlineCount: 10,
      typingMemberId: PEOPLE.jasmin.id,
      members: [PEOPLE.tanisha, PEOPLE.alex, PEOPLE.jasmin, PEOPLE.max, PEOPLE.jessie],
      messages: [
        {
          id: 1,
          senderId: PEOPLE.jasmin.id,
          kind: 'text',
          outgoing: false,
          time: '09:20',
          text: 'I added the new flow diagrams to our design system. You can reuse them for the group project! 🎨',
          reactions: [{ emoji: '👍', count: 4 }],
        },
        {
          id: 2,
          senderId: PEOPLE.alex.id,
          kind: 'text',
          outgoing: false,
          time: '09:24',
          text: 'Hey everyone — important news! 📢',
        },
        {
          id: 3,
          senderId: PEOPLE.alex.id,
          kind: 'text',
          outgoing: false,
          time: '09:24',
          text: 'Our intern @jchurch just completed the probation review and is now officially part of the team! 🎉',
          reactions: [
            { emoji: '🔥', count: 5 },
            { emoji: '🎉', count: 4 },
          ],
        },
        {
          id: 4,
          senderId: ME,
          kind: 'text',
          outgoing: true,
          time: '09:27',
          status: 'read',
          text: "Congrats Jaden! 🥳 Glad to have you — let's crush this new project together.",
        },
        {
          id: 5,
          senderId: PEOPLE.jessie.id,
          kind: 'image',
          outgoing: false,
          time: '09:30',
          image:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=70',
          text: "Snap from yesterday's project kickoff 📸",
        },
        {
          id: 6,
          senderId: PEOPLE.max.id,
          kind: 'voice',
          outgoing: false,
          time: '09:31',
          duration: '0:15',
        },
      ],
    },
    {
      id: 2,
      name: 'Prof. Albert Flores',
      avatar: PEOPLE.albert.avatar,
      presence: 'online',
      lastTime: '10:37',
      preview: 'Office hours confirmed for Friday.',
      previewRead: true,
      members: [PEOPLE.albert],
      messages: [
        { id: 1, senderId: PEOPLE.albert.id, kind: 'text', outgoing: false, time: '10:31', text: 'Hi! Did you want to review your thesis outline this week?' },
        { id: 2, senderId: ME, kind: 'text', outgoing: true, time: '10:35', status: 'read', text: 'Yes please — are Friday office hours open?' },
        { id: 3, senderId: PEOPLE.albert.id, kind: 'text', outgoing: false, time: '10:37', text: 'Office hours confirmed for Friday.' },
      ],
    },
    {
      id: 3,
      name: 'Annette Black',
      avatar: PEOPLE.annette.avatar,
      presence: 'offline',
      lastTime: '9:15',
      previewTyping: true,
      members: [PEOPLE.annette],
      typingMemberId: PEOPLE.annette.id,
      messages: [
        { id: 1, senderId: PEOPLE.annette.id, kind: 'text', outgoing: false, time: '9:10', text: 'Did you finish the reading for chapter 6?' },
        { id: 2, senderId: ME, kind: 'text', outgoing: true, time: '9:14', status: 'read', text: 'Almost — two sections left.' },
      ],
    },
    {
      id: 4,
      name: 'Jerome Bell',
      avatar: PEOPLE.jerome.avatar,
      lastTime: 'Thu',
      preview: 'Got your lab report, thanks!',
      previewRead: true,
      members: [PEOPLE.jerome],
      messages: [
        { id: 1, senderId: ME, kind: 'text', outgoing: true, time: 'Thu', status: 'read', text: 'Sent over the lab report draft.' },
        { id: 2, senderId: PEOPLE.jerome.id, kind: 'text', outgoing: false, time: 'Thu', text: 'Got your lab report, thanks!' },
      ],
    },
    {
      id: 5,
      name: 'Math Lab Crew',
      subtitle: 'Calculus II support group',
      initials: 'ML',
      color: VIOLET,
      unread: 2,
      lastTime: 'Wed',
      previewSender: 'Steven',
      preview: 'Could you confirm the slot?',
      memberCount: 6,
      onlineCount: 2,
      members: [PEOPLE.steven, PEOPLE.wanda, PEOPLE.victor],
      messages: [
        { id: 1, senderId: PEOPLE.steven.id, kind: 'text', outgoing: false, time: 'Wed', text: 'Booked the study room for Thursday 4pm.' },
        { id: 2, senderId: PEOPLE.steven.id, kind: 'text', outgoing: false, time: 'Wed', text: 'Could you confirm the slot?' },
      ],
    },
    {
      id: 6,
      name: 'Wanda Hall',
      avatar: PEOPLE.wanda.avatar,
      lastTime: 'Wed',
      unread: 1,
      preview: 'Thanks for the notes — lifesaver!',
      members: [PEOPLE.wanda],
      messages: [
        { id: 1, senderId: ME, kind: 'text', outgoing: true, time: 'Wed', status: 'read', text: 'Shared my notes from today’s lecture.' },
        { id: 2, senderId: PEOPLE.wanda.id, kind: 'text', outgoing: false, time: 'Wed', text: 'Thanks for the notes — lifesaver!' },
      ],
    },
    {
      id: 7,
      name: 'Victor Olson',
      avatar: PEOPLE.victor.avatar,
      lastTime: 'Tue',
      preview: 'See you at the library!',
      previewRead: true,
      members: [PEOPLE.victor],
      messages: [
        { id: 1, senderId: PEOPLE.victor.id, kind: 'text', outgoing: false, time: 'Tue', text: 'Library at 3 to revise together?' },
        { id: 2, senderId: ME, kind: 'text', outgoing: true, time: 'Tue', status: 'read', text: 'See you at the library!' },
      ],
    },
    // --- Archived ---
    {
      id: 8,
      name: 'Physics 101 Group',
      subtitle: 'Mechanics & waves',
      initials: 'PH',
      color: VIOLET,
      archived: true,
      lastTime: 'Mar 2',
      preview: 'Final grades are posted 🎓',
      previewSender: 'Tanisha',
      memberCount: 14,
      onlineCount: 0,
      members: [PEOPLE.tanisha, PEOPLE.victor],
      messages: [
        { id: 1, senderId: PEOPLE.tanisha.id, kind: 'text', outgoing: false, time: 'Mar 2', text: 'Final grades are posted 🎓' },
      ],
    },
    {
      id: 9,
      name: 'Diane Cooper',
      avatar: AV(25),
      archived: true,
      lastTime: 'Feb 18',
      preview: 'Have a great summer break!',
      previewRead: true,
      members: [{ id: 12, name: 'Diane Cooper', avatar: AV(25) }],
      messages: [
        { id: 1, senderId: 12, kind: 'text', outgoing: false, time: 'Feb 18', text: 'Have a great summer break!' },
      ],
    },
  ]
}
