import { CreateCategoryUseCase } from '../../../../../src/application/usecases/category/CreateCategoryUseCase'
import { InMemoryCategoryRepository } from '../../../../fakes/category/InMemoryCategoryRepository'
import { InvalidCategoryNameError } from '../../../../../src/domain/errors/InvalidCategoryNameError'
import { InvalidCategoryColorError } from '../../../../../src/domain/errors/InvalidCategoryColorError'

describe('CreateCategoryUseCase', () => {
  describe('execute', () => {
    it('creates a category with the given name and color', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      const result = await useCase.execute({ name: 'Work', color: 'blue' })

      expect(result.name).toBe('Work')
      expect(result.color).toBe('blue')
    })

    it('trims whitespace from the name', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      const result = await useCase.execute({ name: '  Work  ', color: 'red' })

      expect(result.name).toBe('Work')
    })

    it('persists the category in the repository', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      await useCase.execute({ name: 'Work', color: 'blue' })
      const all = await repository.findAll()

      expect(all).toHaveLength(1)
    })

    it('throws InvalidCategoryNameError when name is empty', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      await expect(useCase.execute({ name: '', color: 'red' }))
        .rejects.toThrow(InvalidCategoryNameError)
    })

    it('throws InvalidCategoryNameError when name is only whitespace', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      await expect(useCase.execute({ name: '   ', color: 'red' }))
        .rejects.toThrow(InvalidCategoryNameError)
    })

    it('throws InvalidCategoryColorError when color is invalid', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      await expect(useCase.execute({ name: 'Work', color: 'notacolor' }))
        .rejects.toThrow(InvalidCategoryColorError)
    })

    it('throws InvalidCategoryNameError when name already exists (case-insensitive)', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      await useCase.execute({ name: 'Work', color: 'blue' })

      await expect(useCase.execute({ name: 'work', color: 'red' }))
        .rejects.toThrow(InvalidCategoryNameError)
    })

    it('accepts valid hex color', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      const result = await useCase.execute({ name: 'Work', color: '#ff0000' })

      expect(result.color).toBe('#ff0000')
    })

    it('accepts valid rgb color', async () => {
      const repository = new InMemoryCategoryRepository()
      const useCase = new CreateCategoryUseCase(repository)

      const result = await useCase.execute({ name: 'Work', color: 'rgb(0, 128, 255)' })

      expect(result.color).toBe('rgb(0, 128, 255)')
    })
  })
})
