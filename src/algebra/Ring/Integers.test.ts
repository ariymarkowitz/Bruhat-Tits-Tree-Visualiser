import { describe, expect, test } from 'vitest'
import { Integers } from './Integers'

describe('Integers', () => {
  test('zero and one', () => {
    expect(Integers.zero).toBe(0)
    expect(Integers.one).toBe(1)
  })

  test('fromInt', () => {
    expect(Integers.fromInt(5)).toBe(5)
    expect(Integers.fromInt(-3)).toBe(-3)
  })

  test('add', () => {
    expect(Integers.add(2, 3)).toBe(5)
    expect(Integers.add(-2, 3)).toBe(1)
  })

  test('subtract', () => {
    expect(Integers.subtract(5, 3)).toBe(2)
    expect(Integers.subtract(3, 5)).toBe(-2)
  })

  test('negate', () => {
    expect(Integers.negate(7)).toBe(-7)
    expect(Integers.negate(-4)).toBe(4)
  })

  test('multiply', () => {
    expect(Integers.multiply(3, 4)).toBe(12)
    expect(Integers.multiply(-2, 5)).toBe(-10)
  })

  test('edNorm', () => {
    expect(Integers.edNorm(7)).toBe(7)
    expect(Integers.edNorm(-7)).toBe(7)
    expect(Integers.edNorm(0)).toBe(0)
  })

  test('divmod', () => {
    expect(Integers.divmod(7, 3)).toEqual([2, 1])
    expect(Integers.divmod(-7, 3)).toEqual([-3, 2])
    expect(Integers.divmod(7, -3)).toEqual([-2, 1])
    expect(Integers.divmod(-7, -3)).toEqual([3, 2])
  })

  test('div', () => {
    expect(Integers.div(7, 3)).toBe(2)
    expect(Integers.div(-7, 3)).toBe(-3)
    expect(Integers.div(7, -3)).toBe(-2)
    expect(Integers.div(-7, -3)).toBe(3)
  })

  test('mod', () => {
    expect(Integers.mod(7, 3)).toBe(1)
    expect(Integers.mod(-7, 3)).toBe(2)
    expect(Integers.mod(7, -3)).toBe(1)
    expect(Integers.mod(-7, -3)).toBe(2)
  })

  test('gcd', () => {
    expect(Integers.gcd(12, 8)).toBe(4)
    expect(Math.abs(Integers.gcd(-12, 8))).toBe(4)
    expect(Math.abs(Integers.gcd(0, -8))).toBe(8)
  })

  test('toString', () => {
    expect(Integers.toString()).toBe('Z')
    expect(Integers.toString(5)).toBe('5')
    expect(Integers.toString(-2)).toBe('-2')
  })

  test('toLatex', () => {
    expect(Integers.toLatex(7)).toBe('7')
    expect(Integers.toLatex(-3)).toBe('-3')
  })
})