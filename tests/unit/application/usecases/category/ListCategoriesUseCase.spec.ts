import { ListCategoriesUseCase } from '../../../../../src/application/usecases/category/ListCategoriesUseCase'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { Category } from '../../../../../src/domain/entities/Category'

describe('ListCategoriesUseCase', () => {
  describe('execute', () => {
    it('returns empty array when no categories exist', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new ListCategoriesUseCase(repository)

      const result = await useCase.execute()

      expect(result).toEqual([])
    })

    it('returns all persisted categories', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new ListCategoriesUseCase(repository)

      const work: Category = { name: 'Work', color: 'blue' }
      const health: Category = { name: 'Health', color: 'green' }
      await repository.save(work)
      await repository.save(health)

      const result = await useCase.execute()

      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining([work, health]))
    })
  })
})
