import { Task } from '../../../domain/entities/Task'
import { Category } from '../../../domain/entities/Category'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { TaskOutput } from './TaskOutput'

export interface GetTaskInput {
  id: string
}

export type GetTaskOutput = TaskOutput

export class GetTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: GetTaskInput): Promise<GetTaskOutput> {
    const task = await this.taskRepository.findById(input.id)
    if (!task) throw new TaskNotFoundError(input.id)
    return this.toOutput(task)
  }

  private async toOutput(task: Task): Promise<TaskOutput> {
    const categories = await Promise.all(
      task.categoryNames.map(name => this.categoryRepository.findByName(name)),
    )
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      categories: categories
        .filter((c): c is Category => c !== null)
        .map(c => ({ name: c.name, color: c.color })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
