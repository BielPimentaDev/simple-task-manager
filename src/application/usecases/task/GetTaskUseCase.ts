import { Task } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'

export interface GetTaskInput {
  id: string
}

export type GetTaskOutput = Task

export class GetTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: GetTaskInput): Promise<GetTaskOutput> {
    const task = await this.repository.findById(input.id)
    if (!task) throw new TaskNotFoundError(input.id)
    return task
  }
}
