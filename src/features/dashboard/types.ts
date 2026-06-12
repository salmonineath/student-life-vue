/** Static assignment shown on the dashboard (schedule, deadline, task row). */
export interface DashboardAssignment {
  title: string
  /** Short course/category tag, e.g. "IT". */
  tag: string
  /** Human-readable due label, e.g. "Due in 6 days". */
  due: string
  /** Live progress percentage (0–100). */
  progress: number
}
