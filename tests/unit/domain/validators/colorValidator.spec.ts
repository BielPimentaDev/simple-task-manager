import { isValidCssColor } from '../../../../src/domain/validators/colorValidator'

describe('isValidCssColor', () => {
  describe('named colors', () => {
    it('accepts "red"', () => {
      expect(isValidCssColor('red')).toBe(true)
    })

    it('accepts "blue"', () => {
      expect(isValidCssColor('blue')).toBe(true)
    })

    it('accepts "cornflowerblue"', () => {
      expect(isValidCssColor('cornflowerblue')).toBe(true)
    })

    it('accepts "transparent"', () => {
      expect(isValidCssColor('transparent')).toBe(true)
    })

    it('rejects unknown color name', () => {
      expect(isValidCssColor('notacolor')).toBe(false)
    })
  })

  describe('hex colors', () => {
    it('accepts #rrggbb', () => {
      expect(isValidCssColor('#ff0000')).toBe(true)
    })

    it('accepts #rgb shorthand', () => {
      expect(isValidCssColor('#fff')).toBe(true)
    })

    it('accepts uppercase hex', () => {
      expect(isValidCssColor('#FF0000')).toBe(true)
    })

    it('rejects invalid hex digits', () => {
      expect(isValidCssColor('#gggggg')).toBe(false)
    })

    it('rejects hex with wrong length', () => {
      expect(isValidCssColor('#ff00')).toBe(false)
    })
  })

  describe('rgb() colors', () => {
    it('accepts rgb(255, 0, 0)', () => {
      expect(isValidCssColor('rgb(255, 0, 0)')).toBe(true)
    })

    it('accepts rgb without spaces', () => {
      expect(isValidCssColor('rgb(0,0,0)')).toBe(true)
    })

    it('accepts rgb(128, 64, 32)', () => {
      expect(isValidCssColor('rgb(128, 64, 32)')).toBe(true)
    })

    it('rejects value above 255', () => {
      expect(isValidCssColor('rgb(300, 0, 0)')).toBe(false)
    })

    it('rejects negative value', () => {
      expect(isValidCssColor('rgb(-1, 0, 0)')).toBe(false)
    })

    it('rejects non-integer value', () => {
      expect(isValidCssColor('rgb(1.5, 0, 0)')).toBe(false)
    })
  })

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      expect(isValidCssColor('')).toBe(false)
    })

    it('rejects arbitrary string', () => {
      expect(isValidCssColor('not-a-color')).toBe(false)
    })
  })
})
