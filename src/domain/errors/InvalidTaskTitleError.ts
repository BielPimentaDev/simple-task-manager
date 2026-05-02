import { AppError } from './AppError'

export class InvalidTaskTitleError extends AppError {
  constructor() {
    super('Task title cannot be empty', 400)
  }
}
