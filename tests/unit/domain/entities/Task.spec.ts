import { Task } from '../../../../src/domain/entities/Task'

describe('Task', () => {
  it('represents a task with all required fields', () => {
    const task: Task = {
      id: 'some-id',
      title: 'Test task',
      done: false,
      description: null,
      priority: 'MEDIUM',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    expect(task.id).toBe('some-id')
    expect(task.title).toBe('Test task')
    expect(task.done).toBe(false)
    expect(task.description).toBeNull()
    expect(task.priority).toBe('MEDIUM')
    expect(task.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(task.updatedAt).toBe('2024-01-01T00:00:00.000Z')
  })

  it('accepts a task with a description and high priority', () => {
    const task: Task = {
      id: 'some-id',
      title: 'Test task',
      done: false,
      description: 'Some detailed description',
      priority: 'HIGH',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    expect(task.description).toBe('Some detailed description')
    expect(task.priority).toBe('HIGH')
  })

  it('accepts all valid priority values', () => {
    const priorities: Task['priority'][] = ['LOW', 'MEDIUM', 'HIGH']

    priorities.forEach(priority => {
      const task: Task = {
        id: 'id',
        title: 'Task',
        done: false,
        description: null,
        priority,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }
      expect(task.priority).toBe(priority)
    })
  })
})
