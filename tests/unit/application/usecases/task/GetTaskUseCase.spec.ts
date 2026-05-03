import { GetTaskUseCase } from '../../../../../src/application/usecases/task/GetTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'

describe('GetTaskUseCase', () => {
  describe('execute', () => {
    it('returns the task when it exists', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new GetTaskUseCase(taskRepo, categoryRepo)
      await taskRepo.save(makeTask({ id: 'task-1', title: 'Buy groceries' }))

      const result = await useCase.execute({ id: 'task-1' })

      expect(result.id).toBe('task-1')
      expect(result.title).toBe('Buy groceries')
    })

    it('returns hydrated categories', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new GetTaskUseCase(taskRepo, categoryRepo)

      await categoryRepo.save({ name: 'Work', color: 'blue' })
      await taskRepo.save(makeTask({ id: 'task-1', categoryNames: ['Work'] }))

      const result = await useCase.execute({ id: 'task-1' })

      expect(result.categories).toEqual([{ name: 'Work', color: 'blue' }])
    })

    it('returns empty categories array when task has none', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new GetTaskUseCase(taskRepo, categoryRepo)
      await taskRepo.save(makeTask({ id: 'task-1' }))

      const result = await useCase.execute({ id: 'task-1' })

      expect(result.categories).toEqual([])
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new GetTaskUseCase(taskRepo, categoryRepo)

      await expect(useCase.execute({ id: 'nonexistent-id' }))
        .rejects.toThrow(TaskNotFoundError)
    })

    it('throws TaskNotFoundError with the task id in the message', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new GetTaskUseCase(taskRepo, categoryRepo)

      await expect(useCase.execute({ id: 'missing-id' }))
        .rejects.toThrow('missing-id')
    })
  })
})
