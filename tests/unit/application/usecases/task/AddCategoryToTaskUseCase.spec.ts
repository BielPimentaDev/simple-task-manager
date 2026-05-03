import { AddCategoryToTaskUseCase } from '../../../../../src/application/usecases/task/AddCategoryToTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'
import { CategoryNotFoundError } from '../../../../../src/domain/errors/CategoryNotFoundError'

describe('AddCategoryToTaskUseCase', () => {
  describe('execute', () => {
    it('links a category to a task and returns updated TaskOutput', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new AddCategoryToTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1' }))
      await categoryRepo.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      expect(result.categories).toHaveLength(1)
      expect(result.categories[0].name).toBe('Work')
      expect(result.categories[0].color).toBe('blue')
    })

    it('is idempotent when category is already linked', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new AddCategoryToTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1', categoryNames: ['Work'] }))
      await categoryRepo.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      expect(result.categories).toHaveLength(1)
    })

    it('persists the category link', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new AddCategoryToTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1' }))
      await categoryRepo.save({ name: 'Work', color: 'blue' })

      await useCase.execute({ taskId: 'task-1', categoryName: 'Work' })

      const task = await taskRepo.findById('task-1')
      expect(task?.categoryNames).toContain('Work')
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new AddCategoryToTaskUseCase(taskRepo, categoryRepo)

      await categoryRepo.save({ name: 'Work', color: 'blue' })

      await expect(useCase.execute({ taskId: 'nonexistent', categoryName: 'Work' }))
        .rejects.toThrow(TaskNotFoundError)
    })

    it('throws CategoryNotFoundError when category does not exist', async () => {
      const taskRepo = new InMemoryTaskRepository()
      const categoryRepo = new InMemoryCategoryRepository()
      const useCase = new AddCategoryToTaskUseCase(taskRepo, categoryRepo)

      await taskRepo.save(makeTask({ id: 'task-1' }))

      await expect(useCase.execute({ taskId: 'task-1', categoryName: 'NonExistent' }))
        .rejects.toThrow(CategoryNotFoundError)
    })
  })
})
