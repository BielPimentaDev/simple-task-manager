export interface CategoryOutput {
  name: string
  color: string
}

export interface TaskOutput {
  id: string
  title: string
  done: boolean
  categories: CategoryOutput[]
  createdAt: string
  updatedAt: string
}
