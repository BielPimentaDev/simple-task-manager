import * as fs from 'fs'
import * as path from 'path'
import { ICategoryRepository } from '../../../application/ports/category/ICategoryRepository'
import { Category } from '../../../domain/entities/Category'

export class JsonCategoryRepository implements ICategoryRepository {
  private readonly filePath: string

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.resolve(process.cwd(), 'data', 'categories.json')
    this.ensureFile()
  }

  private ensureFile(): void {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8')
    }
  }

  private read(): Category[] {
    const content = fs.readFileSync(this.filePath, 'utf-8')
    return JSON.parse(content) as Category[]
  }

  private write(categories: Category[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(categories, null, 2), 'utf-8')
  }

  async save(category: Category): Promise<void> {
    const categories = this.read()
    categories.push(category)
    this.write(categories)
  }

  async findByName(name: string): Promise<Category | null> {
    const categories = this.read()
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null
  }

  async findAll(): Promise<Category[]> {
    return this.read()
  }

  async update(category: Category): Promise<void> {
    const categories = this.read()
    const index = categories.findIndex(c => c.name.toLowerCase() === category.name.toLowerCase())
    if (index >= 0) categories[index] = category
    this.write(categories)
  }

  async delete(name: string): Promise<void> {
    const categories = this.read()
    this.write(categories.filter(c => c.name.toLowerCase() !== name.toLowerCase()))
  }

  async existsByName(name: string): Promise<boolean> {
    const categories = this.read()
    return categories.some(c => c.name.toLowerCase() === name.toLowerCase())
  }
}
