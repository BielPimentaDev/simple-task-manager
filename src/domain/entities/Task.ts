export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export const VALID_PRIORITIES: readonly Priority[] = ['LOW', 'MEDIUM', 'HIGH']

export interface Task {
  readonly id: string
  readonly title: string
  readonly done: boolean
  readonly createdAt: string
  readonly updatedAt: string
}
