import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { JsonTaskRepository } from '../../../src/infrastructure/persistence/task/JsonTaskRepository'
import { makeTask } from '../../builders/task/makeTask'

const makeTmpFile = () => path.join(os.tmpdir(), `tasks-test-${Date.now()}-${Math.random()}.json`)

describe('JsonTaskRepository', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = makeTmpFile()
  })

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
  })

  describe('save', () => {
    it('persists a task to the JSON file', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      const task = makeTask({ id: 'task-1', title: 'Buy milk' })

      await repository.save(task)
      const content = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'))

      expect(content).toHaveLength(1)
      expect(content[0].id).toBe('task-1')
    })
  })

  describe('findAll', () => {
    it('returns all saved tasks', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      await repository.save(makeTask({ id: 'id-1' }))
      await repository.save(makeTask({ id: 'id-2' }))

      const result = await repository.findAll()

      expect(result).toHaveLength(2)
    })

    it('returns empty array when file is empty', async () => {
      const repository = new JsonTaskRepository(tmpFile)

      const result = await repository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns the task when it exists', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      await repository.save(makeTask({ id: 'task-1', title: 'Run' }))

      const result = await repository.findById('task-1')

      expect(result?.title).toBe('Run')
    })

    it('returns null when the task does not exist', async () => {
      const repository = new JsonTaskRepository(tmpFile)

      const result = await repository.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('overwrites the task in the file', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      await repository.save(makeTask({ id: 'task-1', title: 'Old' }))

      await repository.update(makeTask({ id: 'task-1', title: 'New', done: true }))
      const result = await repository.findById('task-1')

      expect(result?.title).toBe('New')
      expect(result?.done).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes the task from the file', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      await repository.save(makeTask({ id: 'task-1' }))
      await repository.save(makeTask({ id: 'task-2' }))

      await repository.delete('task-1')
      const result = await repository.findAll()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('task-2')
    })
  })

  describe('retrocompatibility', () => {
    it('defaults description to null when field is absent in JSON', async () => {
      const legacy = [{ id: 'old-1', title: 'Legacy', done: false, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
      fs.writeFileSync(tmpFile, JSON.stringify(legacy), 'utf-8')
      const repository = new JsonTaskRepository(tmpFile)

      const result = await repository.findById('old-1')

      expect(result?.description).toBeNull()
    })

    it('defaults priority to MEDIUM when field is absent in JSON', async () => {
      const legacy = [{ id: 'old-1', title: 'Legacy', done: false, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
      fs.writeFileSync(tmpFile, JSON.stringify(legacy), 'utf-8')
      const repository = new JsonTaskRepository(tmpFile)

      const result = await repository.findById('old-1')

      expect(result?.priority).toBe('MEDIUM')
    })

    it('preserves description and priority when present in JSON', async () => {
      const repository = new JsonTaskRepository(tmpFile)
      await repository.save(makeTask({ id: 'task-1', description: 'Details', priority: 'HIGH' }))

      const result = await repository.findById('task-1')

      expect(result?.description).toBe('Details')
      expect(result?.priority).toBe('HIGH')
    })
  })
})
