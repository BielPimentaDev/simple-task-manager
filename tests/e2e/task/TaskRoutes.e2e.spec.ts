import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import supertest from 'supertest'
import { JsonTaskRepository } from '../../../src/infrastructure/persistence/task/JsonTaskRepository'
import { CreateTaskUseCase } from '../../../src/application/usecases/task/CreateTaskUseCase'
import { ListTasksUseCase } from '../../../src/application/usecases/task/ListTasksUseCase'
import { GetTaskUseCase } from '../../../src/application/usecases/task/GetTaskUseCase'
import { UpdateTaskUseCase } from '../../../src/application/usecases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '../../../src/application/usecases/task/DeleteTaskUseCase'
import { TaskController } from '../../../src/infrastructure/controllers/task/TaskController'
import { TaskRoutes } from '../../../src/infrastructure/controllers/task/TaskRoutes'
import { createServer } from '../../../src/infrastructure/server'

const makeTmpFile = () =>
  path.join(os.tmpdir(), `tasks-e2e-${Date.now()}-${Math.random()}.json`)

const makeTestApp = (tmpFile: string) => {
  const repository = new JsonTaskRepository(tmpFile)
  const controller = new TaskController(
    new CreateTaskUseCase(repository),
    new ListTasksUseCase(repository),
    new GetTaskUseCase(repository),
    new UpdateTaskUseCase(repository),
    new DeleteTaskUseCase(repository),
  )
  return createServer(TaskRoutes(controller))
}

describe('TaskRoutes (e2e)', () => {
  let tmpFile: string
  let app: ReturnType<typeof makeTestApp>

  beforeEach(() => {
    tmpFile = makeTmpFile()
    app = makeTestApp(tmpFile)
  })

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
  })

  describe('POST /tasks', () => {
    it('creates a task and returns 201', async () => {
      const res = await supertest(app)
        .post('/tasks')
        .send({ title: 'Treinar às 7h' })

      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Treinar às 7h')
      expect(res.body.done).toBe(false)
      expect(res.body.id).toBeDefined()
    })

    it('returns description as null and priority as MEDIUM when not provided', async () => {
      const res = await supertest(app)
        .post('/tasks')
        .send({ title: 'Simple task' })

      expect(res.status).toBe(201)
      expect(res.body.description).toBeNull()
      expect(res.body.priority).toBe('MEDIUM')
    })

    it('stores description and priority when provided', async () => {
      const res = await supertest(app)
        .post('/tasks')
        .send({ title: 'Task with details', description: 'Do this carefully', priority: 'HIGH' })

      expect(res.status).toBe(201)
      expect(res.body.description).toBe('Do this carefully')
      expect(res.body.priority).toBe('HIGH')
    })

    it('returns 400 when priority is invalid', async () => {
      const res = await supertest(app)
        .post('/tasks')
        .send({ title: 'Task', priority: 'URGENT' })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('URGENT')
    })

    it('returns 400 when title is empty', async () => {
      const res = await supertest(app)
        .post('/tasks')
        .send({ title: '' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })
  })

  describe('GET /tasks', () => {
    it('returns 200 with an empty array when there are no tasks', async () => {
      const res = await supertest(app).get('/tasks')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns all tasks', async () => {
      await supertest(app).post('/tasks').send({ title: 'Task 1' })
      await supertest(app).post('/tasks').send({ title: 'Task 2' })

      const res = await supertest(app).get('/tasks')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('returns description and priority on each task', async () => {
      await supertest(app).post('/tasks').send({ title: 'Task', description: 'Detail', priority: 'LOW' })

      const res = await supertest(app).get('/tasks')

      expect(res.body[0].description).toBe('Detail')
      expect(res.body[0].priority).toBe('LOW')
    })
  })

  describe('GET /tasks/:id', () => {
    it('returns 200 with the task when it exists', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Buy groceries' })

      const res = await supertest(app).get(`/tasks/${created.body.id}`)

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Buy groceries')
    })

    it('returns 404 when task does not exist', async () => {
      const res = await supertest(app).get('/tasks/nonexistent-id')

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /tasks/:id', () => {
    it('updates the task title and returns 200', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Old title' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ title: 'New title' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('New title')
    })

    it('marks a task as done', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Run' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ done: true })

      expect(res.status).toBe(200)
      expect(res.body.done).toBe(true)
    })

    it('reopens a completed task', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Run' })
      await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ done: true })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ done: false })

      expect(res.status).toBe(200)
      expect(res.body.done).toBe(false)
    })

    it('returns 404 when task does not exist', async () => {
      const res = await supertest(app)
        .patch('/tasks/nonexistent-id')
        .send({ title: 'New' })

      expect(res.status).toBe(404)
    })

    it('returns 400 when updated title is empty', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Valid' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ title: '' })

      expect(res.status).toBe(400)
    })

    it('updates description and priority', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Task' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ description: 'Added detail', priority: 'HIGH' })

      expect(res.status).toBe(200)
      expect(res.body.description).toBe('Added detail')
      expect(res.body.priority).toBe('HIGH')
    })

    it('clears description when null is sent', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Task', description: 'To be removed' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ description: null })

      expect(res.status).toBe(200)
      expect(res.body.description).toBeNull()
    })

    it('returns 400 when updated priority is invalid', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Task' })

      const res = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ priority: 'CRITICAL' })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('deletes a task and returns 204', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'To delete' })

      const res = await supertest(app).delete(`/tasks/${created.body.id}`)

      expect(res.status).toBe(204)
    })

    it('returns 404 when task does not exist', async () => {
      const res = await supertest(app).delete('/tasks/nonexistent-id')

      expect(res.status).toBe(404)
    })

    it('full flow: create, list, get, update, delete', async () => {
      const created = await supertest(app)
        .post('/tasks')
        .send({ title: 'Full flow task' })
      expect(created.status).toBe(201)

      const listed = await supertest(app).get('/tasks')
      expect(listed.body).toHaveLength(1)

      const fetched = await supertest(app).get(`/tasks/${created.body.id}`)
      expect(fetched.body.title).toBe('Full flow task')

      const updated = await supertest(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ done: true })
      expect(updated.body.done).toBe(true)

      const deleted = await supertest(app).delete(`/tasks/${created.body.id}`)
      expect(deleted.status).toBe(204)

      const empty = await supertest(app).get('/tasks')
      expect(empty.body).toHaveLength(0)
    })
  })
})
