import { Task } from '../../../domain/entities/Task'
import { Category } from '../../../domain/entities/Category'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { ICategoryRepository } from '../../ports/category/ICategoryRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { InvalidTaskTitleError } from '../../../domain/errors/InvalidTaskTitleError'
import { TaskOutput } from './TaskOutput'

export interface UpdateTaskInput {
  id: string
  title?: string
  done?: boolean
}

export type UpdateTaskOutput = TaskOutput

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.taskRepository.findById(input.id)
    if (!task) throw new TaskNotFoundError(input.id)

    if (input.title !== undefined && !input.title.trim()) {
      throw new InvalidTaskTitleError()
    }

    const updated: Task = {
      ...task,
      title: input.title !== undefined ? input.title.trim() : task.title,
      done: input.done !== undefined ? input.done : task.done,
      updatedAt: new Date().toISOString(),
    }

    await this.taskRepository.update(updated)

    const categories = await Promise.all(
      updated.categoryNames.map(name => this.categoryRepository.findByName(name)),
    )

    return {
      id: updated.id,
      title: updated.title,
      done: updated.done,
      categories: categories
        .filter((c): c is Category => c !== null)
        .map(c => ({ name: c.name, color: c.color })),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }
  }
}
