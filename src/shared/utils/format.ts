/** Generic formatting helpers reused across features. */

/** Formats an ISO date string into a locale date. Returns '' for empty input. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString()
}
