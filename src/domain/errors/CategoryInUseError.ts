import { AppError } from './AppError'

export class CategoryInUseError extends AppError {
  constructor(name: string) {
    super(`Category "${name}" is in use and cannot be deleted`, 409)
  }
}
