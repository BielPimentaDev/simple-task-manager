import { Router } from 'express'
import { CategoryController } from './CategoryController'

export const CategoryRoutes = (controller: CategoryController): Router => {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:name', (req, res) => controller.getByName(req, res))
  router.patch('/:name', (req, res) => controller.update(req, res))
  router.delete('/:name', (req, res) => controller.remove(req, res))

  return router
}
