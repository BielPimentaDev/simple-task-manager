import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import supertest from 'supertest'
import { JsonTaskRepository } from '../../../src/infrastructure/persistence/task/JsonTaskRepository'
import { JsonCategoryRepository } from '../../../src/infrastructure/persistence/category/JsonCategoryRepository'
import { CreateCategoryUseCase } from '../../../src/application/usecases/category/CreateCategoryUseCase'
import { ListCategoriesUseCase } from '../../../src/application/usecases/category/ListCategoriesUseCase'
import { GetCategoryUseCase } from '../../../src/application/usecases/category/GetCategoryUseCase'
import { UpdateCategoryUseCase } from '../../../src/application/usecases/category/UpdateCategoryUseCase'
import { DeleteCategoryUseCase } from '../../../src/application/usecases/category/DeleteCategoryUseCase'
import { CategoryController } from '../../../src/infrastructure/controllers/category/CategoryController'
import { CategoryRoutes } from '../../../src/infrastructure/controllers/category/CategoryRoutes'
import { CreateTaskUseCase } from '../../../src/application/usecases/task/CreateTaskUseCase'
import { ListTasksUseCase } from '../../../src/application/usecases/task/ListTasksUseCase'
import { GetTaskUseCase } from '../../../src/application/usecases/task/GetTaskUseCase'
import { UpdateTaskUseCase } from '../../../src/application/usecases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '../../../src/application/usecases/task/DeleteTaskUseCase'
import { AddCategoryToTaskUseCase } from '../../../src/application/usecases/task/AddCategoryToTaskUseCase'
import { RemoveCategoryFromTaskUseCase } from '../../../src/application/usecases/task/RemoveCategoryFromTaskUseCase'
import { TaskController } from '../../../src/infrastructure/controllers/task/TaskController'
import { TaskCategoryController } from '../../../src/infrastructure/controllers/task/TaskCategoryController'
import { TaskRoutes } from '../../../src/infrastructure/controllers/task/TaskRoutes'
import { createServer } from '../../../src/infrastructure/server'

const makeTmpFile = (prefix: string) =>
  path.join(os.tmpdir(), `${prefix}-e2e-${Date.now()}-${Math.random()}.json`)

const makeTestApp = (taskFile: string, categoryFile: string) => {
  const taskRepo = new JsonTaskRepository(taskFile)
  const categoryRepo = new JsonCategoryRepository(categoryFile)

  const categoryController = new CategoryController(
    new CreateCategoryUseCase(categoryRepo),
    new ListCategoriesUseCase(categoryRepo),
    new GetCategoryUseCase(categoryRepo),
    new UpdateCategoryUseCase(categoryRepo),
    new DeleteCategoryUseCase(categoryRepo, taskRepo),
  )

  const taskController = new TaskController(
    new CreateTaskUseCase(taskRepo),
    new ListTasksUseCase(taskRepo, categoryRepo),
    new GetTaskUseCase(taskRepo, categoryRepo),
    new UpdateTaskUseCase(taskRepo, categoryRepo),
    new DeleteTaskUseCase(taskRepo),
  )

  const taskCategoryController = new TaskCategoryController(
    new AddCategoryToTaskUseCase(taskRepo, categoryRepo),
    new RemoveCategoryFromTaskUseCase(taskRepo, categoryRepo),
    new GetTaskUseCase(taskRepo, categoryRepo),
  )

  return createServer(TaskRoutes(taskController, taskCategoryController), CategoryRoutes(categoryController))
}

describe('TaskCategoryRoutes (e2e)', () => {
  let taskFile: string
  let categoryFile: string
  let app: ReturnType<typeof makeTestApp>

  beforeEach(() => {
    taskFile = makeTmpFile('tasks')
    categoryFile = makeTmpFile('categories')
    app = makeTestApp(taskFile, categoryFile)
  })

  afterEach(() => {
    if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile)
    if (fs.existsSync(categoryFile)) fs.unlinkSync(categoryFile)
  })

  describe('POST /tasks/:taskId/categories/:categoryName', () => {
    it('links a category to a task and returns 200 with TaskOutput', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })

      const res = await supertest(app)
        .post(`/tasks/${taskRes.body.id}/categories/Health`)

      expect(res.status).toBe(200)
      expect(res.body.categories).toHaveLength(1)
      expect(res.body.categories[0].name).toBe('Health')
      expect(res.body.categories[0].color).toBe('green')
    })

    it('is idempotent when category is already linked', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })
      await supertest(app).post(`/tasks/${taskRes.body.id}/categories/Health`)

      const res = await supertest(app)
        .post(`/tasks/${taskRes.body.id}/categories/Health`)

      expect(res.status).toBe(200)
      expect(res.body.categories).toHaveLength(1)
    })

    it('returns 404 when task does not exist', async () => {
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })

      const res = await supertest(app).post('/tasks/nonexistent/categories/Health')

      expect(res.status).toBe(404)
    })

    it('returns 404 when category does not exist', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })

      const res = await supertest(app)
        .post(`/tasks/${taskRes.body.id}/categories/NonExistent`)

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /tasks/:taskId/categories/:categoryName', () => {
    it('unlinks a category from a task and returns 200 with TaskOutput', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })
      await supertest(app).post(`/tasks/${taskRes.body.id}/categories/Health`)

      const res = await supertest(app)
        .delete(`/tasks/${taskRes.body.id}/categories/Health`)

      expect(res.status).toBe(200)
      expect(res.body.categories).toHaveLength(0)
    })

    it('is idempotent when category is not linked', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })

      const res = await supertest(app)
        .delete(`/tasks/${taskRes.body.id}/categories/Health`)

      expect(res.status).toBe(200)
      expect(res.body.categories).toHaveLength(0)
    })

    it('returns 404 when task does not exist', async () => {
      const res = await supertest(app).delete('/tasks/nonexistent/categories/Health')

      expect(res.status).toBe(404)
    })
  })

  describe('GET /tasks/:taskId/categories', () => {
    it('returns the categories of a task', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })
      await supertest(app).post(`/tasks/${taskRes.body.id}/categories/Health`)

      const res = await supertest(app).get(`/tasks/${taskRes.body.id}/categories`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('Health')
    })

    it('returns empty array when task has no categories', async () => {
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Run' })

      const res = await supertest(app).get(`/tasks/${taskRes.body.id}/categories`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns 404 when task does not exist', async () => {
      const res = await supertest(app).get('/tasks/nonexistent/categories')

      expect(res.status).toBe(404)
    })
  })

  describe('GET /tasks includes categories', () => {
    it('returns tasks with full category objects', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Meeting' })
      await supertest(app).post(`/tasks/${taskRes.body.id}/categories/Work`)

      const res = await supertest(app).get('/tasks')

      expect(res.status).toBe(200)
      expect(res.body[0].categories).toEqual([{ name: 'Work', color: 'blue' }])
    })
  })
})
