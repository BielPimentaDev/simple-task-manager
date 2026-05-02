import { AppError } from './AppError'

export class TaskNotFoundError extends AppError {
  constructor(id: string) {
    super(`Task ${id} not found`, 404)
  }
}
