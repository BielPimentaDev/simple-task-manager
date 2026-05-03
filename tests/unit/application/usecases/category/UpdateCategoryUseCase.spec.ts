import { UpdateCategoryUseCase } from '../../../../../src/application/usecases/category/UpdateCategoryUseCase'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { CategoryNotFoundError } from '../../../../../src/domain/errors/CategoryNotFoundError'
import { InvalidCategoryNameError } from '../../../../../src/domain/errors/InvalidCategoryNameError'
import { InvalidCategoryColorError } from '../../../../../src/domain/errors/InvalidCategoryColorError'

describe('UpdateCategoryUseCase', () => {
  describe('execute', () => {
    it('updates the color of an existing category', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work', color: 'red' })

      expect(result.color).toBe('red')
    })

    it('updates the name of an existing category', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work', newName: 'Personal' })

      expect(result.name).toBe('Personal')
    })

    it('updates both name and color at once', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work', newName: 'Personal', color: 'green' })

      expect(result.name).toBe('Personal')
      expect(result.color).toBe('green')
    })

    it('keeps existing values when fields are omitted', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work' })

      expect(result.name).toBe('Work')
      expect(result.color).toBe('blue')
    })

    it('throws CategoryNotFoundError when category does not exist', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await expect(useCase.execute({ name: 'NonExistent', color: 'red' }))
        .rejects.toThrow(CategoryNotFoundError)
    })

    it('throws InvalidCategoryNameError when renaming to an existing name', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })
      await repository.save({ name: 'Personal', color: 'red' })

      await expect(useCase.execute({ name: 'Work', newName: 'personal' }))
        .rejects.toThrow(InvalidCategoryNameError)
    })

    it('allows keeping the same name (case-insensitive) without error', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      const result = await useCase.execute({ name: 'Work', newName: 'Work', color: 'red' })

      expect(result.name).toBe('Work')
      expect(result.color).toBe('red')
    })

    it('throws InvalidCategoryColorError when new color is invalid', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new UpdateCategoryUseCase(repository)

      await repository.save({ name: 'Work', color: 'blue' })

      await expect(useCase.execute({ name: 'Work', color: 'notacolor' }))
        .rejects.toThrow(InvalidCategoryColorError)
    })
  })
})
