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
import { createServer } from '../../../src/infrastructure/server'
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

describe('CategoryRoutes (e2e)', () => {
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

  describe('POST /categories', () => {
    it('creates a category and returns 201', async () => {
      const res = await supertest(app)
        .post('/categories')
        .send({ name: 'Work', color: 'blue' })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Work')
      expect(res.body.color).toBe('blue')
    })

    it('returns 400 when name is empty', async () => {
      const res = await supertest(app)
        .post('/categories')
        .send({ name: '', color: 'blue' })

      expect(res.status).toBe(400)
    })

    it('returns 400 when color is invalid', async () => {
      const res = await supertest(app)
        .post('/categories')
        .send({ name: 'Work', color: 'notacolor' })

      expect(res.status).toBe(400)
    })

    it('returns 400 when name already exists (case-insensitive)', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })

      const res = await supertest(app)
        .post('/categories')
        .send({ name: 'work', color: 'red' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /categories', () => {
    it('returns 200 with empty array when no categories', async () => {
      const res = await supertest(app).get('/categories')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns all categories', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })
      await supertest(app).post('/categories').send({ name: 'Health', color: 'green' })

      const res = await supertest(app).get('/categories')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })
  })

  describe('GET /categories/:name', () => {
    it('returns the category when it exists', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })

      const res = await supertest(app).get('/categories/Work')

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Work')
    })

    it('returns 404 when category does not exist', async () => {
      const res = await supertest(app).get('/categories/NonExistent')

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /categories/:name', () => {
    it('updates the color and returns 200', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })

      const res = await supertest(app)
        .patch('/categories/Work')
        .send({ color: 'red' })

      expect(res.status).toBe(200)
      expect(res.body.color).toBe('red')
    })

    it('updates the name', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })

      const res = await supertest(app)
        .patch('/categories/Work')
        .send({ newName: 'Personal' })

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Personal')
    })

    it('returns 404 when category does not exist', async () => {
      const res = await supertest(app)
        .patch('/categories/NonExistent')
        .send({ color: 'red' })

      expect(res.status).toBe(404)
    })

    it('returns 400 when renaming to existing name', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })
      await supertest(app).post('/categories').send({ name: 'Personal', color: 'red' })

      const res = await supertest(app)
        .patch('/categories/Work')
        .send({ newName: 'Personal' })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /categories/:name', () => {
    it('deletes a category and returns 204', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })

      const res = await supertest(app).delete('/categories/Work')

      expect(res.status).toBe(204)
    })

    it('returns 404 when category does not exist', async () => {
      const res = await supertest(app).delete('/categories/NonExistent')

      expect(res.status).toBe(404)
    })

    it('returns 409 when category is linked to a task', async () => {
      await supertest(app).post('/categories').send({ name: 'Work', color: 'blue' })
      const taskRes = await supertest(app).post('/tasks').send({ title: 'Some task' })
      await supertest(app).post(`/tasks/${taskRes.body.id}/categories/Work`)

      const res = await supertest(app).delete('/categories/Work')

      expect(res.status).toBe(409)
    })
  })
})
