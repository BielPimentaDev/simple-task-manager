import { Request, Response } from 'express'
import { AppError } from '../../../domain/errors/AppError'
import { CreateCategoryUseCase } from '../../../application/usecases/category/CreateCategoryUseCase'
import { ListCategoriesUseCase } from '../../../application/usecases/category/ListCategoriesUseCase'
import { GetCategoryUseCase } from '../../../application/usecases/category/GetCategoryUseCase'
import { UpdateCategoryUseCase } from '../../../application/usecases/category/UpdateCategoryUseCase'
import { DeleteCategoryUseCase } from '../../../application/usecases/category/DeleteCategoryUseCase'

export class CategoryController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createCategory.execute({
        name: req.body.name,
        color: req.body.color,
      })
      res.status(201).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listCategories.execute()
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async getByName(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getCategory.execute({ name: req.params['name'] as string })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateCategory.execute({
        name: req.params['name'] as string,
        newName: req.body.newName,
        color: req.body.color,
      })
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteCategory.execute({ name: req.params['name'] as string })
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
