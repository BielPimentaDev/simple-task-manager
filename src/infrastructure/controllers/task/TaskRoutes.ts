import { Router } from 'express'
import { TaskController } from './TaskController'
import { TaskCategoryController } from './TaskCategoryController'

export const TaskRoutes = (
  controller: TaskController,
  categoryController?: TaskCategoryController,
): Router => {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.remove(req, res))

  if (categoryController) {
    router.post('/:taskId/categories/:categoryName', (req, res) =>
      categoryController.add(req, res),
    )
    router.delete('/:taskId/categories/:categoryName', (req, res) =>
      categoryController.remove(req, res),
    )
    router.get('/:taskId/categories', (req, res) =>
      categoryController.listCategories(req, res),
    )
  }

  return router
}
