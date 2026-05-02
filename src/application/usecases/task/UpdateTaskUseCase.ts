import { Task } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { InvalidTaskTitleError } from '../../../domain/errors/InvalidTaskTitleError'

export interface UpdateTaskInput {
  id: string
  title?: string
  done?: boolean
}

export type UpdateTaskOutput = Task

export class UpdateTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.repository.findById(input.id)
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

    await this.repository.update(updated)
    return updated
  }
}
