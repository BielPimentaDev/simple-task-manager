import { Request, Response } from 'express'
import { AppError } from '../../../domain/errors/AppError'
import { CreateTaskUseCase } from '../../../application/usecases/task/CreateTaskUseCase'
import { ListTasksUseCase } from '../../../application/usecases/task/ListTasksUseCase'
import { GetTaskUseCase } from '../../../application/usecases/task/GetTaskUseCase'
import { UpdateTaskUseCase } from '../../../application/usecases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '../../../application/usecases/task/DeleteTaskUseCase'

export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly listTasks: ListTasksUseCase,
    private readonly getTask: GetTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTask.execute({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
      })
      res.status(201).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTasks.execute()
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTask.execute({ id: req.params['id'] as string })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateTask.execute({
        id: req.params['id'] as string,
        title: req.body.title,
        done: req.body.done,
        description: req.body.description,
        priority: req.body.priority,
      })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteTask.execute({ id: req.params['id'] as string })
      res.status(204).send()
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
