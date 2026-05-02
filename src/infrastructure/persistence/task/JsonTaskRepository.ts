import * as fs from 'fs'
import * as path from 'path'
import { ITaskRepository } from '../../../application/ports/task/ITaskRepository'
import { Task } from '../../../domain/entities/Task'

export class JsonTaskRepository implements ITaskRepository {
  private readonly filePath: string

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.resolve(process.cwd(), 'data', 'tasks.json')
    this.ensureFile()
  }

  private ensureFile(): void {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8')
    }
  }

  private read(): Task[] {
    const content = fs.readFileSync(this.filePath, 'utf-8')
    return JSON.parse(content) as Task[]
  }

  private write(tasks: Task[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(tasks, null, 2), 'utf-8')
  }

  async save(task: Task): Promise<void> {
    const tasks = this.read()
    tasks.push(task)
    this.write(tasks)
  }

  async findById(id: string): Promise<Task | null> {
    const tasks = this.read()
    return tasks.find(t => t.id === id) ?? null
  }

  async findAll(): Promise<Task[]> {
    return this.read()
  }

  async update(task: Task): Promise<void> {
    const tasks = this.read()
    const index = tasks.findIndex(t => t.id === task.id)
    if (index >= 0) tasks[index] = task
    this.write(tasks)
  }

  async delete(id: string): Promise<void> {
    const tasks = this.read()
    this.write(tasks.filter(t => t.id !== id))
  }
}
