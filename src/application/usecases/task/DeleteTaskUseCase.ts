import { ITaskRepository } from '../../ports/task/ITaskRepository'
import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError'

export interface DeleteTaskInput {
  id: string
}

export class DeleteTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    const task = await this.repository.findById(input.id)
    if (!task) throw new TaskNotFoundError(input.id)
    await this.repository.delete(input.id)
  }
}
