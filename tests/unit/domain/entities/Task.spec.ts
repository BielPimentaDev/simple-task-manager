import { Task } from '../../../../src/domain/entities/Task'

describe('Task', () => {
  it('represents a task with all required fields', () => {
    const task: Task = {
      id: 'some-id',
      title: 'Test task',
      done: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    expect(task.id).toBe('some-id')
    expect(task.title).toBe('Test task')
    expect(task.done).toBe(false)
    expect(task.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(task.updatedAt).toBe('2024-01-01T00:00:00.000Z')
  })
})
