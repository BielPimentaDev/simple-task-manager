import { AppError } from '../../../../src/domain/errors/AppError'
import { TaskNotFoundError } from '../../../../src/domain/errors/TaskNotFoundError'
import { InvalidTaskTitleError } from '../../../../src/domain/errors/InvalidTaskTitleError'

describe('AppError', () => {
  it('extends Error', () => {
    const error = new AppError('something went wrong', 400)
    expect(error).toBeInstanceOf(Error)
  })

  it('stores statusCode', () => {
    const error = new AppError('something went wrong', 422)
    expect(error.statusCode).toBe(422)
  })

  it('stores message', () => {
    const error = new AppError('something went wrong', 400)
    expect(error.message).toBe('something went wrong')
  })
})

describe('TaskNotFoundError', () => {
  it('extends AppError', () => {
    const error = new TaskNotFoundError('abc-123')
    expect(error).toBeInstanceOf(AppError)
  })

  it('has statusCode 404', () => {
    const error = new TaskNotFoundError('abc-123')
    expect(error.statusCode).toBe(404)
  })

  it('includes the task id in the message', () => {
    const error = new TaskNotFoundError('abc-123')
    expect(error.message).toContain('abc-123')
  })
})

describe('InvalidTaskTitleError', () => {
  it('extends AppError', () => {
    const error = new InvalidTaskTitleError()
    expect(error).toBeInstanceOf(AppError)
  })

  it('has statusCode 400', () => {
    const error = new InvalidTaskTitleError()
    expect(error.statusCode).toBe(400)
  })
})
