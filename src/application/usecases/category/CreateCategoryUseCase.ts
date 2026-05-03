import { Category } from '../../../domain/entities/Category'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { InvalidCategoryNameError } from '../../../domain/errors/InvalidCategoryNameError'
import { InvalidCategoryColorError } from '../../../domain/errors/InvalidCategoryColorError'
import { isValidCssColor } from '../../../domain/validators/colorValidator'

export interface CreateCategoryInput {
  name: string
  color: string
}

export type CreateCategoryOutput = Category

export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const name = input.name.trim()
    if (!name) throw new InvalidCategoryNameError()

    if (!isValidCssColor(input.color)) throw new InvalidCategoryColorError(input.color)

    const exists = await this.repository.existsByName(name)
    if (exists) throw new InvalidCategoryNameError()

    const category: Category = { name, color: input.color }
    await this.repository.save(category)
    return category
  }
}
