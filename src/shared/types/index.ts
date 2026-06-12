/**
 * Cross-feature TypeScript types. Keep only types used by more than one
 * feature here; feature-specific types belong in `features/<x>/types`.
 */

export type ID = string | number

/** Standard wrapper many REST endpoints return. Adjust to match your API. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Common shape for paginated list endpoints. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
