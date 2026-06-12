import type { Member } from '@/features/assignments/types'

/**
 * Static team roster used for task assignment. `id: 0` is the current user
 * ("You"); the rest are teammates. In a real app this would come from the API.
 */
export const MEMBERS: Member[] = [
  { id: 0, name: 'You', initials: 'SL', color: '#4F46E5' },
  { id: 1, name: 'Sok Dara', initials: 'SD', color: '#10B981' },
  { id: 2, name: 'Chan Lina', initials: 'CL', color: '#F59E0B' },
  { id: 3, name: 'Vibol Rin', initials: 'VR', color: '#EF4444' },
]

/** Look up a member by id. */
export function findMember(id: number): Member | undefined {
  return MEMBERS.find((m) => m.id === id)
}
