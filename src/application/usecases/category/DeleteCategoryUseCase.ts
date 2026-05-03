import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { CategoryNotFoundError } from '../../../domain/errors/CategoryNotFoundError'
import { CategoryInUseError } from '../../../domain/errors/CategoryInUseError'

export interface DeleteCategoryInput {
  name: string
}

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const exists = await this.categoryRepository.existsByName(input.name)
    if (!exists) throw new CategoryNotFoundError(input.name)

    const inUse = await this.taskRepository.existsTaskWithCategory(input.name)
    if (inUse) throw new CategoryInUseError(input.name)

    await this.categoryRepository.delete(input.name)
  }
}
