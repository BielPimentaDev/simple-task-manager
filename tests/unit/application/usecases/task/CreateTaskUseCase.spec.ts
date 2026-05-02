import { CreateTaskUseCase } from '../../../../../src/application/usecases/task/CreateTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { InvalidTaskTitleError } from '../../../../../src/domain/errors/InvalidTaskTitleError'
import { InvalidTaskPriorityError } from '../../../../../src/domain/errors/InvalidTaskPriorityError'

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

    it('sets description to null when not provided', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Task' })

      expect(result.description).toBeNull()
    })

    it('sets priority to MEDIUM when not provided', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Task' })

      expect(result.priority).toBe('MEDIUM')
    })

    it('stores the provided description', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Task', description: 'Some details' })

      expect(result.description).toBe('Some details')
    })

    it('stores the provided priority', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Task', priority: 'HIGH' })

      expect(result.priority).toBe('HIGH')
    })

    it('normalizes whitespace-only description to null', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      const result = await useCase.execute({ title: 'Task', description: '   ' })

      expect(result.description).toBeNull()
    })

    it('throws InvalidTaskPriorityError when priority is invalid', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      await expect(useCase.execute({ title: 'Task', priority: 'URGENT' }))
        .rejects.toThrow(InvalidTaskPriorityError)
    })

    it('accepts all valid priority values', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      for (const priority of ['LOW', 'MEDIUM', 'HIGH']) {
        const result = await useCase.execute({ title: 'Task', priority })
        expect(result.priority).toBe(priority)
      }
    })
  })
})
