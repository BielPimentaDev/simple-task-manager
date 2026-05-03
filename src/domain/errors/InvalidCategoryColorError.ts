import { AppError } from './AppError'

export class InvalidCategoryColorError extends AppError {
  constructor(color: string) {
    super(`"${color}" is not a valid CSS color`, 400)
  }
}
