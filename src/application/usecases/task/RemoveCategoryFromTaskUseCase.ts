import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { TaskOutput } from './TaskOutput'
import { Category } from '../../../domain/entities/Category'
import { Task } from '../../../domain/entities/Task'

export interface RemoveCategoryFromTaskInput {
  taskId: string
  categoryName: string
}

export class RemoveCategoryFromTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: RemoveCategoryFromTaskInput): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(input.taskId)
    if (!task) throw new TaskNotFoundError(input.taskId)

    const isLinked = task.categoryNames.some(
      n => n.toLowerCase() === input.categoryName.toLowerCase(),
    )

    if (isLinked) {
      const updated: Task = {
        ...task,
        categoryNames: task.categoryNames.filter(
          n => n.toLowerCase() !== input.categoryName.toLowerCase(),
        ),
        updatedAt: new Date().toISOString(),
      }
      await this.taskRepository.update(updated)
      const categories = await this.fetchCategories(updated.categoryNames)
      return this.toOutput(updated, categories)
    }

    const categories = await this.fetchCategories(task.categoryNames)
    return this.toOutput(task, categories)
  }

  private async fetchCategories(names: readonly string[]): Promise<Category[]> {
    const results = await Promise.all(names.map(n => this.categoryRepository.findByName(n)))
    return results.filter((c): c is Category => c !== null)
  }

  private toOutput(task: Task, categories: Category[]): TaskOutput {
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      categories: categories.map(c => ({ name: c.name, color: c.color })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
