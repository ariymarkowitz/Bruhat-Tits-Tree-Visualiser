import { describe, expect, test } from 'vitest'
import { FiniteField } from './FiniteField'

describe('FiniteField', () => {
  const F5 = new FiniteField(5)
  const F7 = new FiniteField(7)

  test('zero and one', () => {
    expect(F5.zero).toBe(0)
    expect(F5.one).toBe(1)
  })

  test('fromInt', () => {
    expect(F5.fromInt(7)).toBe(2)
    expect(F5.fromInt(-3)).toBe(2)
  })

  test('add', () => {
    expect(F5.add(2, 3)).toBe(0)
    expect(F5.add(4, 4)).toBe(3)
  })

  test('negate', () => {
    expect(F5.negate(2)).toBe(3)
    expect(F5.negate(0)).toBe(0)
  })

  test('multiply', () => {
    expect(F5.multiply(2, 3)).toBe(1)
    expect(F5.multiply(4, 4)).toBe(1)
  })

  test('divide', () => {
    expect(F5.divide(2, 3)).toBe(4)
    expect(F7.divide(3, 2)).toBe(5)
  })

  test('unsafeInvert', () => {
    expect(F5.unsafeInvert(2)).toBe(3)
    expect(F7.unsafeInvert(3)).toBe(5)
  })

  test('isZero', () => {
    expect(F5.isZero(0)).toBe(true)
    expect(F5.isZero(1)).toBe(false)
  })

  test('isOne', () => {
    expect(F5.isOne(1)).toBe(true)
    expect(F5.isOne(0)).toBe(false)
  })

  test('toString', () => {
    expect(F5.toString()).toBe('FiniteField(5)')
    expect(F5.toString(3)).toBe('3')
  })

  test('toLatex', () => {
    expect(F5.toLatex(4)).toBe('4')
  })

  test('constructor throws for non-prime', () => {
    expect(() => new FiniteField(6)).toThrow()
    expect(() => new FiniteField(-3)).toThrow()
    expect(() => new FiniteField(0)).toThrow()
    expect(() => new FiniteField(1.5)).toThrow()
  })
})
