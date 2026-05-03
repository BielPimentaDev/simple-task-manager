import { DeleteCategoryUseCase } from '../../../../../src/application/usecases/category/DeleteCategoryUseCase'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { CategoryNotFoundError } from '../../../../../src/domain/errors/CategoryNotFoundError'
import { CategoryInUseError } from '../../../../../src/domain/errors/CategoryInUseError'

describe('DeleteCategoryUseCase', () => {
  describe('execute', () => {
    it('deletes the category when it is not in use', async () => {
      const categoryRepository = new InMemoryCategoryRepository()
      const taskRepository = new InMemoryTaskRepository()
      const useCase = new DeleteCategoryUseCase(categoryRepository, taskRepository)

      await categoryRepository.save({ name: 'Work', color: 'blue' })

      await useCase.execute({ name: 'Work' })

      const remaining = await categoryRepository.findAll()
      expect(remaining).toHaveLength(0)
    })

    it('throws CategoryNotFoundError when category does not exist', async () => {
      const categoryRepository = new InMemoryCategoryRepository()
      const taskRepository = new InMemoryTaskRepository()
      const useCase = new DeleteCategoryUseCase(categoryRepository, taskRepository)

      await expect(useCase.execute({ name: 'NonExistent' }))
        .rejects.toThrow(CategoryNotFoundError)
    })

    it('throws CategoryInUseError when category is linked to a task', async () => {
      const categoryRepository = new InMemoryCategoryRepository()
      const taskRepository = new InMemoryTaskRepository()
      const useCase = new DeleteCategoryUseCase(categoryRepository, taskRepository)

      await categoryRepository.save({ name: 'Work', color: 'blue' })
      await taskRepository.save(makeTask({ id: 'task-1', categoryNames: ['Work'] }))

      await expect(useCase.execute({ name: 'Work' }))
        .rejects.toThrow(CategoryInUseError)
    })
  })
})
