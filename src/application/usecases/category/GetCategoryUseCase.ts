import { Category } from '../../../domain/entities/Category'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { CategoryNotFoundError } from '../../../domain/errors/CategoryNotFoundError'

export interface GetCategoryInput {
  name: string
}

export type GetCategoryOutput = Category

export class GetCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const category = await this.repository.findByName(input.name)
    if (!category) throw new CategoryNotFoundError(input.name)
    return category
  }
}
