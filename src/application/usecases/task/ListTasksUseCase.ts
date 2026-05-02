import { Task } from '../../../domain/entities/Task'
import { ITaskRepository } from '../../ports/task/ITaskRepository'

export type ListTasksOutput = Task[]

export class ListTasksUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(): Promise<ListTasksOutput> {
    return this.repository.findAll()
  }
}
