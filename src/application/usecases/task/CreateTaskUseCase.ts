import { randomUUID } from 'crypto'
import { Task } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { InvalidTaskTitleError } from '../../../domain/errors/InvalidTaskTitleError'

export interface CreateTaskInput {
  title: string
}

export type CreateTaskOutput = Task

export class CreateTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    if (!input.title.trim()) {
      throw new InvalidTaskTitleError()
    }

    const now = new Date().toISOString()
    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      done: false,
      categoryNames: [],
      createdAt: now,
      updatedAt: now,
    }

    await this.repository.save(task)
    return task
  }
}
