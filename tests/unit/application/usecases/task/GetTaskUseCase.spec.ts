import { GetTaskUseCase } from '../../../../../src/application/usecases/task/GetTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'

describe('GetTaskUseCase', () => {
  describe('execute', () => {
    it('returns the task when it exists', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new GetTaskUseCase(repository)
      const task = makeTask({ id: 'task-1', title: 'Buy groceries' })
      await repository.save(task)

      const result = await useCase.execute({ id: 'task-1' })

      expect(result.id).toBe('task-1')
      expect(result.title).toBe('Buy groceries')
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new GetTaskUseCase(repository)

      await expect(useCase.execute({ id: 'nonexistent-id' }))
        .rejects.toThrow(TaskNotFoundError)
    })

    it('throws TaskNotFoundError with the task id in the message', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new GetTaskUseCase(repository)

      await expect(useCase.execute({ id: 'missing-id' }))
        .rejects.toThrow('missing-id')
    })
  })
})
