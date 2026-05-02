import { CreateTaskUseCase } from '../../../../../src/application/usecases/task/CreateTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InvalidTaskTitleError } from '../../../../../src/domain/errors/InvalidTaskTitleError'

describe('CreateTaskUseCase', () => {
  describe('execute', () => {
    it('creates a task with the given title', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Treinar às 7h' })

      expect(result.title).toBe('Treinar às 7h')
    })

    it('creates a task with done set to false by default', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Treinar às 7h' })

      expect(result.done).toBe(false)
    })

    it('creates a task with a generated id', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Treinar às 7h' })

      expect(result.id).toBeDefined()
      expect(result.id.length).toBeGreaterThan(0)
    })

    it('creates a task with createdAt and updatedAt timestamps', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Treinar às 7h' })

      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.createdAt).toBe(result.updatedAt)
    })

    it('trims whitespace from the title', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: '  Treinar às 7h  ' })

      expect(result.title).toBe('Treinar às 7h')
    })

    it('persists the task in the repository', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      await useCase.execute({ title: 'Treinar às 7h' })
      const all = await repository.findAll()

      expect(all).toHaveLength(1)
      expect(all[0].title).toBe('Treinar às 7h')
    })

    it('throws InvalidTaskTitleError when title is empty', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      await expect(useCase.execute({ title: '' }))
        .rejects.toThrow(InvalidTaskTitleError)
    })

    it('throws InvalidTaskTitleError when title is only whitespace', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      await expect(useCase.execute({ title: '   ' }))
        .rejects.toThrow(InvalidTaskTitleError)
    })

    it('accepts a title with a single character', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'X' })

      expect(result.title).toBe('X')
    })
  })
})
