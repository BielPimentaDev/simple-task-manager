import { Request, Response } from 'express'
import { AppError } from '../../../domain/errors/AppError'
import { AddCategoryToTaskUseCase } from '../../../application/usecases/task/AddCategoryToTaskUseCase'
import { RemoveCategoryFromTaskUseCase } from '../../../application/usecases/task/RemoveCategoryFromTaskUseCase'
import { GetTaskUseCase } from '../../../application/usecases/task/GetTaskUseCase'

export class TaskCategoryController {
  constructor(
    private readonly addCategory: AddCategoryToTaskUseCase,
    private readonly removeCategory: RemoveCategoryFromTaskUseCase,
    private readonly getTask: GetTaskUseCase,
  ) {}

  async add(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.addCategory.execute({
        taskId: req.params['taskId'] as string,
        categoryName: req.params['categoryName'] as string,
      })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.removeCategory.execute({
        taskId: req.params['taskId'] as string,
        categoryName: req.params['categoryName'] as string,
      })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.getTask.execute({ id: req.params['taskId'] as string })
      res.status(200).json(task.categories)
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
