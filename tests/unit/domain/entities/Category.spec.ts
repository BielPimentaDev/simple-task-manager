import { Category } from '../../../../src/domain/entities/Category'

describe('Category', () => {
  it('represents a category with name and color', () => {
    const category: Category = {
      name: 'Work',
      color: 'blue',
    }

    expect(category.name).toBe('Work')
    expect(category.color).toBe('blue')
  })
})
