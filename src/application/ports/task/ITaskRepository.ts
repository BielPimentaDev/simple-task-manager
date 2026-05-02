import { Task } from '../../../domain/entities/Task'

export interface ITaskRepository {
  save(task: Task): Promise<void>
  findById(id: string): Promise<Task | null>
  findAll(): Promise<Task[]>
  update(task: Task): Promise<void>
  delete(id: string): Promise<void>
}
