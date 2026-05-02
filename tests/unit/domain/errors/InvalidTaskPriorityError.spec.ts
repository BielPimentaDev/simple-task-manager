import { InvalidTaskPriorityError } from '../../../../src/domain/errors/InvalidTaskPriorityError'
import { AppError } from '../../../../src/domain/errors/AppError'

describe('InvalidTaskPriorityError', () => {
  it('is an instance of AppError', () => {
    const error = new InvalidTaskPriorityError('URGENT')

    expect(error).toBeInstanceOf(AppError)
  })

  it('has statusCode 400', () => {
    const error = new InvalidTaskPriorityError('URGENT')

    expect(error.statusCode).toBe(400)
  })

  it('includes the invalid priority value in the message', () => {
    const error = new InvalidTaskPriorityError('URGENT')

    expect(error.message).toContain('URGENT')
  })

  it('mentions all valid priorities in the message', () => {
    const error = new InvalidTaskPriorityError('URGENT')

    expect(error.message).toContain('LOW')
    expect(error.message).toContain('MEDIUM')
    expect(error.message).toContain('HIGH')
  })
})
