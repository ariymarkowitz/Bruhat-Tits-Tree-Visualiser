import { describe, expect, test } from 'vitest'
import { Rationals, Rational } from './Rationals'

describe('Rationals', () => {
  test('zero and one', () => {
    expect(Rationals.zero).toEqual({ num: 0, den: 1 })
    expect(Rationals.one).toEqual({ num: 1, den: 1 })
  })

  test('reduce', () => {
    expect(Rationals.reduce(2, 4)).toEqual({ num: 1, den: 2 })
    expect(Rationals.reduce(-2, 4)).toEqual({ num: -1, den: 2 })
    expect(Rationals.reduce(0, 5)).toEqual({ num: 0, den: 1 })
    expect(() => Rationals.reduce(1, 0)).toThrow()
    expect(() => Rationals.reduce(1.5, 2)).toThrow()
  })

  test('add', () => {
    expect(Rationals.add({ num: 1, den: 2 }, { num: 1, den: 3 })).toEqual({ num: 5, den: 6 })
    expect(Rationals.add({ num: 2, den: 1 }, { num: 3, den: 1 })).toEqual({ num: 5, den: 1 })
  })

  test('subtract', () => {
    expect(Rationals.subtract({ num: 1, den: 2 }, { num: 1, den: 3 })).toEqual({ num: 1, den: 6 })
    expect(Rationals.subtract({ num: 2, den: 1 }, { num: 3, den: 1 })).toEqual({ num: -1, den: 1 })
  })

  test('multiply', () => {
    expect(Rationals.multiply({ num: 2, den: 3 }, { num: 3, den: 4 })).toEqual({ num: 1, den: 2 })
  })

  test('unsafeDivide', () => {
    expect(Rationals.unsafeDivide({ num: 2, den: 3 }, { num: 3, den: 4 })).toEqual({ num: 8, den: 9 })
  })

  test('negate', () => {
    expect(Rationals.negate({ num: 2, den: 3 })).toEqual({ num: -2, den: 3 })
  })

  test('unsafeInvert', () => {
    expect(Rationals.unsafeInvert({ num: 2, den: 3 })).toEqual({ num: 3, den: 2 })
    expect(Rationals.unsafeInvert({ num: -2, den: 3 })).toEqual({ num: -3, den: 2 })
  })

  test('equals', () => {
    expect(Rationals.equals({ num: 1, den: 2 }, { num: 1, den: 2 })).toBe(true)
    expect(Rationals.equals({ num: 1, den: 2 }, { num: 2, den: 4 })).toBe(false)
  })

  test('nonZeroPow', () => {
    expect(Rationals.nonZeroPow({ num: 2, den: 3 }, 2)).toEqual({ num: 4, den: 9 })
  })

  test('fromInt', () => {
    expect(Rationals.fromInt(5)).toEqual({ num: 5, den: 1 })
  })

  test('fromRational', () => {
    expect(Rationals.fromRational({ num: 2, den: 3 })).toEqual({ num: 2, den: 3 })
  })

  test('toString', () => {
    expect(Rationals.toString()).toBe('Rational Field')
    expect(Rationals.toString({ num: 2, den: 3 })).toBe('2/3')
    expect(Rationals.toString({ num: 2, den: 1 })).toBe('2')
  })

  test('toLatex', () => {
    expect(Rationals.toLatex({ num: 2, den: 3 })).toBe('\\frac{2}{3}')
    expect(Rationals.toLatex({ num: 2, den: 1 })).toBe('2')
  })
})
