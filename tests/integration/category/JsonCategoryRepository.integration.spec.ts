import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { JsonCategoryRepository } from '../../../src/infrastructure/persistence/category/JsonCategoryRepository'

const makeTmpFile = () =>
  path.join(os.tmpdir(), `categories-test-${Date.now()}-${Math.random()}.json`)

describe('JsonCategoryRepository', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = makeTmpFile()
  })

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
  })

  describe('save', () => {
    it('persists a category to the JSON file', async () => {
      const repository = new JsonCategoryRepository(tmpFile)

      await repository.save({ name: 'Work', color: 'blue' })
      const content = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'))

      expect(content).toHaveLength(1)
      expect(content[0].name).toBe('Work')
    })
  })

  describe('findAll', () => {
    it('returns all saved categories', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })
      await repository.save({ name: 'Health', color: 'green' })

      const result = await repository.findAll()

      expect(result).toHaveLength(2)
    })

    it('returns empty array when file has no categories', async () => {
      const repository = new JsonCategoryRepository(tmpFile)

      const result = await repository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findByName', () => {
    it('returns the category when it exists', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      const result = await repository.findByName('Work')

      expect(result?.name).toBe('Work')
      expect(result?.color).toBe('blue')
    })

    it('is case-insensitive', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      const result = await repository.findByName('work')

      expect(result?.name).toBe('Work')
    })

    it('returns null when category does not exist', async () => {
      const repository = new JsonCategoryRepository(tmpFile)

      const result = await repository.findByName('NonExistent')

      expect(result).toBeNull()
    })
  })

  describe('existsByName', () => {
    it('returns true when category exists', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      const result = await repository.existsByName('Work')

      expect(result).toBe(true)
    })

    it('is case-insensitive', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      const result = await repository.existsByName('WORK')

      expect(result).toBe(true)
    })

    it('returns false when category does not exist', async () => {
      const repository = new JsonCategoryRepository(tmpFile)

      const result = await repository.existsByName('NonExistent')

      expect(result).toBe(false)
    })
  })

  describe('update', () => {
    it('replaces the category in the file', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      await repository.update({ name: 'Work', color: 'red' })
      const result = await repository.findByName('Work')

      expect(result?.color).toBe('red')
    })
  })

  describe('delete', () => {
    it('removes the category from the file', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })
      await repository.save({ name: 'Health', color: 'green' })

      await repository.delete('Work')
      const result = await repository.findAll()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Health')
    })

    it('is case-insensitive', async () => {
      const repository = new JsonCategoryRepository(tmpFile)
      await repository.save({ name: 'Work', color: 'blue' })

      await repository.delete('WORK')
      const result = await repository.findAll()

      expect(result).toHaveLength(0)
    })
  })
})
