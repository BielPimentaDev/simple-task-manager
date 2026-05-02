import { Task } from '../../../src/domain/entities/Task'
import { makeTask } from './makeTask'

export class TaskBuilder {
  private task: Task = makeTask()

  withId(id: string): this {
    this.task = { ...this.task, id }
    return this
  }

  withTitle(title: string): this {
    this.task = { ...this.task, title }
    return this
  }

  withDone(done: boolean): this {
    this.task = { ...this.task, done }
    return this
  }

  withCreatedAt(createdAt: string): this {
    this.task = { ...this.task, createdAt }
    return this
  }

  withUpdatedAt(updatedAt: string): this {
    this.task = { ...this.task, updatedAt }
    return this
  }

  build(): Task {
    return { ...this.task }
  }
}
