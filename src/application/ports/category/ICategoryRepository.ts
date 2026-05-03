import { Category } from '../../../domain/entities/Category'

export interface ICategoryRepository {
  save(category: Category): Promise<void>
  findByName(name: string): Promise<Category | null>
  findAll(): Promise<Category[]>
  update(category: Category): Promise<void>
  delete(name: string): Promise<void>
  existsByName(name: string): Promise<boolean>
}
