import { Category } from '../../../domain/entities/Category'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { CategoryNotFoundError } from '../../../domain/errors/CategoryNotFoundError'
import { InvalidCategoryNameError } from '../../../domain/errors/InvalidCategoryNameError'
import { InvalidCategoryColorError } from '../../../domain/errors/InvalidCategoryColorError'
import { isValidCssColor } from '../../../domain/validators/colorValidator'

export interface UpdateCategoryInput {
  name: string
  newName?: string
  color?: string
}

export type UpdateCategoryOutput = Category

export class UpdateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const existing = await this.repository.findByName(input.name)
    if (!existing) throw new CategoryNotFoundError(input.name)

    if (input.color !== undefined && !isValidCssColor(input.color)) {
      throw new InvalidCategoryColorError(input.color)
    }

    const newName = input.newName !== undefined ? input.newName.trim() : undefined

    if (newName !== undefined && newName.toLowerCase() !== existing.name.toLowerCase()) {
      const conflict = await this.repository.existsByName(newName)
      if (conflict) throw new InvalidCategoryNameError()
    }

    const updated: Category = {
      name: newName ?? existing.name,
      color: input.color ?? existing.color,
    }

    await this.repository.delete(existing.name)
    await this.repository.save(updated)
    return updated
  }
}
