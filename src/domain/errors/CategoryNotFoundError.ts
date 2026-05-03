import { AppError } from './AppError'

export class CategoryNotFoundError extends AppError {
  constructor(name: string) {
    super(`Category "${name}" not found`, 404)
  }
}
