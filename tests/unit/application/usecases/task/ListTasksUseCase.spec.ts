import { ListTasksUseCase } from '../../../../../src/application/usecases/task/ListTasksUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { makeTask } from '../../../../builders/task/makeTask'

describe('ListTasksUseCase', () => {
  describe('execute', () => {
    it('returns an empty array when there are no tasks', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new ListTasksUseCase(taskRepo, categoryRepo)

      const result = await useCase.execute()

      expect(result).toEqual([])
    })

    it('returns all tasks with id and title', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new ListTasksUseCase(taskRepo, categoryRepo)
      await taskRepo.save(makeTask({ id: 'id-1', title: 'Task 1' }))
      await taskRepo.save(makeTask({ id: 'id-2', title: 'Task 2' }))

      const result = await useCase.execute()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('id-1')
      expect(result[1].id).toBe('id-2')
    })

    it('returns categories as full objects', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new ListTasksUseCase(taskRepo, categoryRepo)

      await categoryRepo.save({ name: 'Work', color: 'blue' })
      await taskRepo.save(makeTask({ id: 'id-1', categoryNames: ['Work'] }))

      const result = await useCase.execute()

      expect(result[0].categories).toEqual([{ name: 'Work', color: 'blue' }])
    })

    it('returns empty categories array when task has no categories', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new ListTasksUseCase(taskRepo, categoryRepo)
      await taskRepo.save(makeTask({ id: 'id-1' }))

      const result = await useCase.execute()

      expect(result[0].categories).toEqual([])
    })

    it('returns a copy and does not expose internal state', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new ListTasksUseCase(taskRepo, categoryRepo)
      await taskRepo.save(makeTask({ id: 'id-1' }))

      const result = await useCase.execute()
      result.pop()

      const resultAgain = await useCase.execute()
      expect(resultAgain).toHaveLength(1)
    })
  })
})
