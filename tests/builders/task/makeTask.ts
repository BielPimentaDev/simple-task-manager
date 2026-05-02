import { Task } from '../../../src/domain/entities/Task'

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-default',
  title: 'Default task title',
  done: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})
