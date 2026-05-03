import { ICategoryRepository } from '../../../src/application/ports/category/ICategoryRepository'
import { Category } from '../../../src/domain/entities/Category'

export class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Category[] = []

  async save(category: Category): Promise<void> {
    this.categories.push(category)
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categories.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories]
  }

  async update(category: Category): Promise<void> {
    const index = this.categories.findIndex(c => c.name.toLowerCase() === category.name.toLowerCase())
    if (index >= 0) this.categories[index] = category
  }

  async delete(name: string): Promise<void> {
    this.categories = this.categories.filter(c => c.name.toLowerCase() !== name.toLowerCase())
  }

  async existsByName(name: string): Promise<boolean> {
    return this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())
  }
}
