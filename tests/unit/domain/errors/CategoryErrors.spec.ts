import { AppError } from '../../../../src/domain/errors/AppError'
import { InvalidCategoryNameError } from '../../../../src/domain/errors/InvalidCategoryNameError'
import { InvalidCategoryColorError } from '../../../../src/domain/errors/InvalidCategoryColorError'
import { CategoryNotFoundError } from '../../../../src/domain/errors/CategoryNotFoundError'
import { CategoryInUseError } from '../../../../src/domain/errors/CategoryInUseError'

describe('InvalidCategoryNameError', () => {
  it('extends AppError', () => {
    expect(new InvalidCategoryNameError()).toBeInstanceOf(AppError)
  })

  it('has statusCode 400', () => {
    expect(new InvalidCategoryNameError().statusCode).toBe(400)
  })
})

describe('InvalidCategoryColorError', () => {
  it('extends AppError', () => {
    expect(new InvalidCategoryColorError('bad')).toBeInstanceOf(AppError)
  })

  it('has statusCode 400', () => {
    expect(new InvalidCategoryColorError('bad').statusCode).toBe(400)
  })

  it('includes the invalid color in the message', () => {
    expect(new InvalidCategoryColorError('bad').message).toContain('bad')
  })
})

describe('CategoryNotFoundError', () => {
  it('extends AppError', () => {
    expect(new CategoryNotFoundError('Work')).toBeInstanceOf(AppError)
  })

  it('has statusCode 404', () => {
    expect(new CategoryNotFoundError('Work').statusCode).toBe(404)
  })

  it('includes the category name in the message', () => {
    expect(new CategoryNotFoundError('Work').message).toContain('Work')
  })
})

describe('CategoryInUseError', () => {
  it('extends AppError', () => {
    expect(new CategoryInUseError('Work')).toBeInstanceOf(AppError)
  })

  it('has statusCode 409', () => {
    expect(new CategoryInUseError('Work').statusCode).toBe(409)
  })

  it('includes the category name in the message', () => {
    expect(new CategoryInUseError('Work').message).toContain('Work')
  })
})
