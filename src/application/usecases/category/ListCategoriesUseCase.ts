import { Category } from '../../../domain/entities/Category'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'

export type ListCategoriesOutput = Category[]

export class ListCategoriesUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(): Promise<ListCategoriesOutput> {
    return this.repository.findAll()
  }
}
