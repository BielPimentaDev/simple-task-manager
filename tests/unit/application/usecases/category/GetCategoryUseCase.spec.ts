import { GetCategoryUseCase } from '../../../../../src/application/usecases/category/GetCategoryUseCase'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { CategoryNotFoundError } from '../../../../../src/domain/errors/CategoryNotFoundError'

describe('GetCategoryUseCase', () => {
  describe('execute', () => {
    it('returns the category when found', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new GetCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work' })

      expect(result.name).toBe('Work')
      expect(result.color).toBe('blue')
    })

    it('is case-insensitive when looking up by name', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new GetCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'work' })

      expect(result.name).toBe('Work')
    })

    it('throws CategoryNotFoundError when category does not exist', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new GetCategoryUseCase(repository)

      await expect(useCase.execute({ name: 'NonExistent' }))
        .rejects.toThrow(CategoryNotFoundError)
    })
  })
})
