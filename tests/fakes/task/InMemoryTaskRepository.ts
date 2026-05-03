import { ITaskRepository } from '../../../src/application/ports/task/ITaskRepository'
import { Task } from '../../../src/domain/entities/Task'

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = []

  async save(task: Task): Promise<void> {
    this.tasks.push(task)
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === id) ?? null
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks]
  }

  async update(task: Task): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === task.id)
    if (index >= 0) this.tasks[index] = task
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== id)
  }

  async existsTaskWithCategory(categoryName: string): Promise<boolean> {
    return this.tasks.some(t =>
      t.categoryNames.some(n => n.toLowerCase() === categoryName.toLowerCase()),
    )
  }
}
