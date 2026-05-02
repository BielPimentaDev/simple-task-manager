import { AppError } from './AppError'

export class InvalidTaskPriorityError extends AppError {
  constructor(priority: string) {
    super(`Priority '${priority}' does not exist. Valid priorities are: LOW, MEDIUM, HIGH`, 400)
  }
}
