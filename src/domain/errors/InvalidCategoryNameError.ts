import { AppError } from './AppError'

export class InvalidCategoryNameError extends AppError {
  constructor() {
    super('Category name must not be empty', 400)
  }
}
