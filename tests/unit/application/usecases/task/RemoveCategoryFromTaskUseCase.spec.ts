import { RemoveCategoryFromTaskUseCase } from '../../../../../src/application/usecases/task/RemoveCategoryFromTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'

describe('RemoveCategoryFromTaskUseCase', () => {
  describe('execute', () => {
    it('unlinks a category from a task and returns updated TaskOutput', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new RemoveCategoryFromTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1', categoryNames: ['Work'] }))
      await categoryRepo.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      expect(result.categories).toHaveLength(0)
    })

    it('persists the removal', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new RemoveCategoryFromTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1', categoryNames: ['Work'] }))
      await categoryRepo.save({ name: 'Work', color: 'blue' })

      await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      const task = await taskRepo.findById('task-1')
      expect(task?.categoryNames).not.toContain('Work')
    })

    it('is idempotent when category is not linked — returns task without error', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new RemoveCategoryFromTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1' }))

      const result = await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      expect(result.categories).toHaveLength(0)
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new RemoveCategoryFromTaskUseCase(taskRepo, categoryRepo)

      await expect(useCase.execute({ taskId: 'nonexistent', categoryName: 'Work' }))
        .rejects.toThrow(TaskNotFoundError)
    })
  })
})
