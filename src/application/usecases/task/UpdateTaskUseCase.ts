import { Task, Priority, VALID_PRIORITIES } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'
import { InvalidTaskTitleError } from '../../../domain/errors/InvalidTaskTitleError'
import { InvalidTaskPriorityError } from '../../../domain/errors/InvalidTaskPriorityError'

export interface UpdateTaskInput {
  id: string
  title?: string
  done?: boolean
  description?: string | null
  priority?: string
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

    if (input.priority !== undefined) {
      if (!(VALID_PRIORITIES as readonly string[]).includes(input.priority)) {
        throw new InvalidTaskPriorityError(input.priority)
      }
    }

    const description = input.description !== undefined
      ? this.normalizeDescription(input.description)
      : task.description

    const updated: Task = {
      ...task,
      title: input.title !== undefined ? input.title.trim() : task.title,
      done: input.done !== undefined ? input.done : task.done,
      description,
      priority: input.priority !== undefined ? (input.priority as Priority) : task.priority,
      updatedAt: new Date().toISOString(),
    }

    await this.repository.update(updated)
    return updated
  }

  private normalizeDescription(description: string | null): string | null {
    if (description === null) return null
    const trimmed = description.trim()
    return trimmed.length === 0 ? null : trimmed
  }
}
