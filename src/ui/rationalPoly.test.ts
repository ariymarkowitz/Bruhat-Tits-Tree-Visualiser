import { describe, expect, test } from 'vitest'
import { format, isTypeable, parse } from './rationalPoly'

/** Coefficients run low degree first, so [1, 0, 2] is 2x² + 1. */
const plain = { emptyIsZero: false, allowInf: false }
const withInf = { emptyIsZero: false, allowInf: true }

describe('rationalPoly', () => {
  test('format', () => {
    expect(format([[], [1]])).toBe('0')
    expect(format([[1, 0, 2], [1]])).toBe('2x^2 + 1')
    expect(format([[0, -1], [1]])).toBe('-x')
    // A subtraction reads as one, rather than as '+ -'.
    expect(format([[1, -2, 3], [1]])).toBe('3x^2 - 2x + 1')
    expect(format(undefined)).toBe('')
  })

  test('format brackets a genuine fraction only', () => {
    // A denominator of 1 is left off entirely.
    expect(format([[0, 1], [1]])).toBe('x')
    expect(format([[-1, 1], [1, 1]])).toBe('(x - 1)/(x + 1)')
  })

  test('parse', () => {
    expect(parse('0', plain)).toEqual([[], [1]])
    expect(parse('x', plain)).toEqual([[0, 1], [1]])
    expect(parse('2x^2 + 1', plain)).toEqual([[1, 0, 2], [1]])
    expect(parse('3x^2-2x+1', plain)).toEqual([[1, -2, 3], [1]])
    // Brackets and spaces are noise; a missing denominator is 1.
    expect(parse('(x+1)/(x-1)', plain)).toEqual([[1, 1], [-1, 1]])
  })

  test('parse collects repeated terms', () => {
    expect(parse('x + x', plain)).toEqual([[0, 2], [1]])
    expect(parse('x - x', plain)).toEqual([[], [1]])
  })

  test('parse clears negative exponents by raising both sides', () => {
    expect(parse('x^-1', plain)).toEqual([[1], [0, 1]])
    // Both sides shift by the same power of x, so x^-2/x^-5 is x^3.
    expect(parse('x^-2/x^-5', plain)).toEqual([[0, 0, 0, 1], [1]])
  })

  test('parse rejects what names no rational function', () => {
    expect(parse('y', plain)).toBeUndefined()
    expect(parse('x^', plain)).toBeUndefined()
    expect(parse('1//x', plain)).toBeUndefined()
    expect(parse('', plain)).toBeUndefined()
    expect(parse('', { ...plain, emptyIsZero: true })).toEqual([[0], [1]])
  })

  test('parse admits a zero denominator only when infinity is allowed', () => {
    expect(parse('x/0', plain)).toBeUndefined()
    expect(parse('x/0', withInf)).toEqual([[0, 1], []])
    // A zero numerator is an ordinary value either way.
    expect(parse('0/x', plain)).toEqual([[], [0, 1]])
  })

  test('isTypeable allows one slash and nothing but polynomial characters', () => {
    for (const text of ['', 'x', 'x/', 'x+1', '2x^-1']) {
      expect(isTypeable(text)).toBe(true)
    }
    expect(isTypeable('x/x/x')).toBe(false)
    expect(isTypeable('x/y')).toBe(false)
  })
})
