import { describe, expect, test } from 'vitest'
import { PolynomialRing } from './PolynomialRing'
import { FiniteField } from '../Field/FiniteField'
import { Infinite } from '../Order/ExtendedInt'

describe('PolynomialRing', () => {
  const F = new FiniteField(5)
  const R = new PolynomialRing(F)

  test('zero and one', () => {
    expect(R.zero).toEqual([])
    expect(R.one).toEqual([1])
  })

  test('fromInt and fromInts', () => {
    expect(R.fromInt(3)).toEqual([3])
    expect(R.fromInts([1, 2, 0, 0])).toEqual([1, 2])
    expect(R.fromInts([0, 0, 0])).toEqual([])
  })

  test('add', () => {
    expect(R.add([1, 2], [3, 4])).toEqual([4, 1])
    expect(R.add([1, 2, 3], [4, 0, 2])).toEqual([0, 2])
    expect(R.add([], [1, 2])).toEqual([1, 2])
  })

  test('subtract', () => {
    expect(R.subtract([1, 2, 3], [4, 0, 2])).toEqual([2, 2, 1])
    expect(R.subtract([2, 3], [2, 3])).toEqual([])
  })

  test('negate', () => {
    expect(R.negate([1, 2, 3])).toEqual([4, 3, 2])
  })

  test('multiply', () => {
    expect(R.multiply([1, 2], [3, 4])).toEqual([3, 0, 3]) // (1*3, 1*4 + 2*3, 2*4)
    expect(R.multiply([0, 1, 2], [0, 0, 3, 4])).toEqual([0, 0, 0, 3, 0, 3])
    expect(R.multiply([], [1, 2])).toEqual([])
  })

  test('multiplyByScalar and divideByScalar', () => {
    expect(R.multiplyByScalar([1, 2, 3], 2)).toEqual([2, 4, 1])
    expect(R.divideByScalar([2, 4, 1], 2)).toEqual([1, 2, 3])
  })

  test('equals', () => {
    expect(R.equals([1, 2], [1, 2])).toBe(true)
    expect(R.equals([1, 2], [1, 3])).toBe(false)
    expect(R.equals([1, 2], [0, 1, 2])).toBe(false)
  })

  test('isZero and isOne', () => {
    expect(R.isZero([])).toBe(true)
    expect(R.isZero([0, 1])).toBe(false)
    expect(R.isOne([1])).toBe(true)
    expect(R.isOne([1, 2])).toBe(false)
  })

  test('degree and valuation', () => {
    expect(R.degree([1, 2])).toBe(1)
    expect(R.degree([0, 0, 0])).toBe(-Infinity)
    expect(R.valuation([0, 0, 3, 4])).toBe(2)
    expect(R.valuation([])).toBe(Infinite)
  })

  test('fromValuation', () => {
    expect(R.fromValuation(2)).toEqual([0, 0, 1])
    expect(R.fromValuation(Infinite)).toEqual([])
  })

  test('leadingCoefficient', () => {
    expect(R.leadingCoefficient([1, 2, 0, 3])).toBe(3)
    expect(() => R.leadingCoefficient([])).toThrow()
  })

  test('truncateZeros', () => {
    expect(R.truncateZeros([1, 2, 0, 0])).toEqual([1, 2])
    expect(R.truncateZeros([0, 0, 0])).toEqual([])
    expect(R.truncateZeros([0, 1, 2])).toEqual([0, 1, 2])
  })

  test('shift', () => {
    expect(R.shift([1, 2], 2)).toEqual([0, 0, 1, 2])
    expect(R.shift([1, 2], 0)).toEqual([1, 2])
    expect(R.shift([1, 2, 3], -1)).toEqual([2, 3])
    expect(R.shift([], 2)).toEqual([])
  })

  test('edNorm', () => {
    expect(R.edNorm([0, 0, 3])).toBe(2)
  })

  test('divmod, div, mod', () => {
    // (x^2 + 2x + 1) / (x + 1) over F_5
    const a = [1, 2, 1] // x^2 + 2x + 1
    const b = [1, 1]    // x + 1
    expect(R.divmod(a, b)).toEqual([[1, 1], []])
    expect(R.div(a, b)).toEqual([1, 1])
    expect(R.mod(a, b)).toEqual([])
  })

  test('gcd', () => {
    function reduce(a: number[]) {
      return R.divideByScalar(a, R.leadingCoefficient(a))
    }

    expect(reduce(R.gcd([], [1, 1]))).toEqual([1, 1])
    expect(reduce(R.gcd([1, 2, 1], [1, 3, 2]))).toEqual([1, 1])
    expect(reduce(R.gcd([1, 3, 2], [2, 1]))).toEqual([1])
  })

  test('toString and toLatex', () => {
    expect(R.toString()).toBe('PolynomialRing(F(5))')
    expect(R.toString([1, 2, 0, 4])).toBe('1 + 2x + 4x^3')
    expect(R.toString([])).toBe('0')
    expect(R.toLatex([1, 2, 0, 4])).toBe('1 + 2x + 4x^{3}')
    expect(R.toLatex([])).toBe('0')
  })
})
