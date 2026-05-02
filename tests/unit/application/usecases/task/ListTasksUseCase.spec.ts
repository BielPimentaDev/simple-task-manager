import { ListTasksUseCase } from '../../../../../src/application/usecases/task/ListTasksUseCase'
import { InMemoryTaskRepository } from '../../../../fakes/task/InMemoryTaskRepository'
import { makeTask } from '../../../../builders/task/makeTask'

describe('ListTasksUseCase', () => {
  describe('execute', () => {
    it('returns an empty array when there are no tasks', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new ListTasksUseCase(repository)

      const result = await useCase.execute()

      expect(result).toEqual([])
    })

    it('returns all tasks in the repository', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new ListTasksUseCase(repository)
      const task1 = makeTask({ id: 'id-1', title: 'Task 1' })
      const task2 = makeTask({ id: 'id-2', title: 'Task 2' })
      await repository.save(task1)
      await repository.save(task2)

      const result = await useCase.execute()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('id-1')
      expect(result[1].id).toBe('id-2')
    })

    it('returns a copy and does not expose internal state', async () => {
      const repository = new InMemoryTaskRepository()
      const useCase = new ListTasksUseCase(repository)
      await repository.save(makeTask({ id: 'id-1' }))

      const result = await useCase.execute()
      result.pop()

      const resultAgain = await useCase.execute()
      expect(resultAgain).toHaveLength(1)
    })
  })
})
