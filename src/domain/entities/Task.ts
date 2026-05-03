export interface Task {
  readonly id: string
  readonly title: string
  readonly done: boolean
  readonly categoryNames: readonly string[]
  readonly createdAt: string
  readonly updatedAt: string
}
