import { DeleteTaskUseCase } from '../../../../../src/application/usecases/task/DeleteTaskUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { makeTask } from '../../../../builders/task/makeTask'
import { TaskNotFoundError } from '../../../../../src/domain/errors/TaskNotFoundError'

describe('DeleteTaskUseCase', () => {
  describe('execute', () => {
    it('deletes an existing task', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new DeleteTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1' }))

      await useCase.execute({ id: 'task-1' })
      const all = await repository.findAll()

      expect(all).toHaveLength(0)
    })

    it('throws TaskNotFoundError when task does not exist', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new DeleteTaskUseCase(repository)

      await expect(useCase.execute({ id: 'nonexistent' }))
        .rejects.toThrow(TaskNotFoundError)
    })

    it('only deletes the target task, leaving others intact', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new DeleteTaskUseCase(repository)
      await repository.save(makeTask({ id: 'task-1' }))
      await repository.save(makeTask({ id: 'task-2' }))

      await useCase.execute({ id: 'task-1' })
      const all = await repository.findAll()

      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('task-2')
    })
  })
})
