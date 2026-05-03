import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { CategoryNotFoundError } from '../../../domain/errors/CategoryNotFoundError'
import { TaskOutput } from './TaskOutput'
import { Category } from '../../../domain/entities/Category'
import { Task } from '../../../domain/entities/Task'

export interface AddCategoryToTaskInput {
  taskId: string
  categoryName: string
}

export class AddCategoryToTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: AddCategoryToTaskInput): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(input.taskId)
    if (!task) throw new TaskNotFoundError(input.taskId)

    const category = await this.categoryRepository.findByName(input.categoryName)
    if (!category) throw new CategoryNotFoundError(input.categoryName)

    const alreadyLinked = task.categoryNames.some(
      n => n.toLowerCase() === input.categoryName.toLowerCase(),
    )

    if (!alreadyLinked) {
      const updated: Task = {
        ...task,
        categoryNames: [...task.categoryNames, category.name],
        updatedAt: new Date().toISOString(),
      }
      await this.taskRepository.update(updated)
      return this.toOutput({ ...updated }, [
        ...await this.fetchCategories(task.categoryNames),
        category,
      ])
    }

    return this.toOutput(task, await this.fetchCategories(task.categoryNames))
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
