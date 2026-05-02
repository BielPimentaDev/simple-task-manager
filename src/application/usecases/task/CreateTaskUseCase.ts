import { randomUUID } from 'crypto'
import { Task, Priority, VALID_PRIORITIES } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { InvalidTaskTitleError } from '../../../domain/errors/InvalidTaskTitleError'
import { InvalidTaskPriorityError } from '../../../domain/errors/InvalidTaskPriorityError'

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: string
}

export type CreateTaskOutput = Task

export class CreateTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    if (!input.title.trim()) {
      throw new InvalidTaskTitleError()
    }

    const priority = this.resolvePriority(input.priority)
    const description = this.normalizeDescription(input.description)

    const now = new Date().toISOString()
    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      done: false,
      description,
      priority,
      createdAt: now,
      updatedAt: now,
    }

    await this.repository.save(task)
    return task
  }

  private resolvePriority(priority?: string): Priority {
    if (priority === undefined) return 'MEDIUM'
    if (!(VALID_PRIORITIES as readonly string[]).includes(priority)) {
      throw new InvalidTaskPriorityError(priority)
    }
    return priority as Priority
  }

  private normalizeDescription(description?: string): string | null {
    if (description === undefined) return null
    const trimmed = description.trim()
    return trimmed.length === 0 ? null : trimmed
  }
}
