import { UpdateTaskUseCase } from '../../../../../src/application/usecases/task/UpdateTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'
import { InvalidTaskTitleError } from '../../../../../src/domain/errors/InvalidTaskTitleError'

describe('UpdateTaskUseCase', () => {
  describe('execute', () => {
    it('updates the title when provided', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', title: 'Old title' }))

      const result = await useCase.execute({ id: 'task-1', title: 'New title' })

      expect(result.title).toBe('New title')
    })

    it('updates done to true', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', done: false }))

      const result = await useCase.execute({ id: 'task-1', done: true })

      expect(result.done).toBe(true)
    })

    it('reopens a completed task by setting done to false', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', done: true }))

      const result = await useCase.execute({ id: 'task-1', done: false })

      expect(result.done).toBe(false)
    })

    it('updates both title and done at once', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', title: 'Old', done: false }))

      const result = await useCase.execute({ id: 'task-1', title: 'New', done: true })

      expect(result.title).toBe('New')
      expect(result.done).toBe(true)
    })

    it('updates the updatedAt timestamp', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', updatedAt: '2024-01-01T00:00:00.000Z' }))

      const result = await useCase.execute({ id: 'task-1', title: 'Updated' })

      expect(result.updatedAt).not.toBe('2024-01-01T00:00:00.000Z')
    })

    it('does not change title when title is not provided', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', title: 'Original' }))

      const result = await useCase.execute({ id: 'task-1', done: true })

      expect(result.title).toBe('Original')
    })

    it('does not change done when done is not provided', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', done: false }))

      const result = await useCase.execute({ id: 'task-1', title: 'Updated title' })

      expect(result.done).toBe(false)
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)

      await expect(useCase.execute({ id: 'nonexistent', title: 'New' }))
        .rejects.toThrow(TaskNotFoundError)
    })

    it('throws InvalidTaskTitleError when title is empty string', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1' }))

      await expect(useCase.execute({ id: 'task-1', title: '' }))
        .rejects.toThrow(InvalidTaskTitleError)
    })

    it('throws InvalidTaskTitleError when title is only whitespace', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1' }))

      await expect(useCase.execute({ id: 'task-1', title: '   ' }))
        .rejects.toThrow(InvalidTaskTitleError)
    })

    it('trims whitespace from updated title', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1' }))

      const result = await useCase.execute({ id: 'task-1', title: '  Clean title  ' })

      expect(result.title).toBe('Clean title')
    })

    it('persists the updated task in the repository', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new UpdateTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1', title: 'Old' }))

      await useCase.execute({ id: 'task-1', title: 'Updated' })
      const persisted = await repository.findById('task-1')

      expect(persisted?.title).toBe('Updated')
    })
  })
})
