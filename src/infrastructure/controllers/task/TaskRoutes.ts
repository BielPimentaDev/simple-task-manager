import { Router } from 'express'
import { TaskController } from './TaskController'

export const TaskRoutes = (controller: TaskController): Router => {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.remove(req, res))

  return router
}
