import { describe, expect, test } from 'vitest'
import { format, isTypeable, parse } from './rational'

const plain = { emptyIsZero: false }

describe('rational', () => {
  test('format', () => {
    expect(format([3, 1])).toBe('3')
    expect(format([1, 2])).toBe('1/2')
    expect(format([-1, 2])).toBe('-1/2')
    expect(format(undefined)).toBe('')
  })

  test('parse', () => {
    expect(parse('0', plain)).toEqual([0, 1])
    expect(parse('-1', plain)).toEqual([-1, 1])
    expect(parse('1/2', plain)).toEqual([1, 2])
    expect(parse('1/-2', plain)).toEqual([1, -2])
    // The fraction is kept as typed rather than reduced.
    expect(parse('10/20', plain)).toEqual([10, 20])
    // Spaces around the slash are allowed.
    expect(parse('3 / 4', plain)).toEqual([3, 4])
  })

  test('parse rejects what names no rational', () => {
    expect(parse('a', plain)).toBeUndefined()
    // Half-finished entries: typeable, but not yet a value.
    expect(parse('1/', plain)).toBeUndefined()
    expect(parse('-', plain)).toBeUndefined()
    // 0/0 is the one fraction that is not a point of the projective line.
    expect(parse('0/0', plain)).toBeUndefined()
  })

  test('parse treats an empty box as zero only when asked', () => {
    expect(parse('', plain)).toBeUndefined()
    expect(parse('', { emptyIsZero: true })).toEqual([0, 1])
  })

  test('isTypeable accepts entries that are still being typed', () => {
    for (const text of ['', '-', '1/', '1/-', '1 / 2']) {
      expect(isTypeable(text, { allowInf: false })).toBe(true)
    }
    expect(isTypeable('a', { allowInf: false })).toBe(false)
    expect(isTypeable('--1', { allowInf: false })).toBe(false)
  })

  test('isTypeable admits a zero denominator only when infinity is allowed', () => {
    // 1/0 is the end at infinity, so it is typeable exactly when ends are.
    expect(isTypeable('1/0', { allowInf: false })).toBe(false)
    expect(isTypeable('1/0', { allowInf: true })).toBe(true)
    expect(parse('1/0', plain)).toEqual([1, 0])
  })
})
