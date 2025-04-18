import { describe, expect, test } from 'vitest'
import { EIntOrd, Infinite } from './ExtendedInt'


describe('ExtendedIntOrd', () => {
  test('lt and lte', () => {
    expect(EIntOrd.lt(1, 2)).toBe(true)
    expect(EIntOrd.lt(2, 1)).toBe(false)
    expect(EIntOrd.lt(2, 2)).toBe(false)
    expect(EIntOrd.lt(2, Infinite)).toBe(true)
    expect(EIntOrd.lt(Infinite, 2)).toBe(false)
    expect(EIntOrd.lt(Infinite, Infinite)).toBe(false)

    expect(EIntOrd.lte(1, 2)).toBe(true)
    expect(EIntOrd.lte(2, 1)).toBe(false)
    expect(EIntOrd.lte(2, 2)).toBe(true)
    expect(EIntOrd.lte(2, Infinite)).toBe(true)
    expect(EIntOrd.lte(Infinite, 2)).toBe(false)
    expect(EIntOrd.lte(Infinite, Infinite)).toBe(true)
  })

  test('min and max', () => {
    expect(EIntOrd.min(1, 2)).toBe(1)
    expect(EIntOrd.min(2, 1)).toBe(1)
    expect(EIntOrd.min(2, Infinite)).toBe(2)
    expect(EIntOrd.min(Infinite, 2)).toBe(2)
    expect(EIntOrd.min(Infinite, Infinite)).toBe(Infinite)

    expect(EIntOrd.max(1, 2)).toBe(2)
    expect(EIntOrd.max(2, 1)).toBe(2)
    expect(EIntOrd.max(2, Infinite)).toBe(Infinite)
    expect(EIntOrd.max(Infinite, 2)).toBe(Infinite)
    expect(EIntOrd.max(Infinite, Infinite)).toBe(Infinite)
  })

  test('mulInt', () => {
    expect(EIntOrd.mulInt(2, 3)).toBe(6)
    expect(EIntOrd.mulInt(Infinite, 3)).toBe(Infinite)
    expect(EIntOrd.mulInt(0, 3)).toBe(0)
  })

  test('divInt', () => {
    expect(EIntOrd.divInt(6, 3)).toBe(2)
    expect(EIntOrd.divInt(Infinite, 3)).toBe(Infinite)
    expect(EIntOrd.divInt(7, 3)).toBe(2)
  })

  test('equals', () => {
    expect(EIntOrd.equals(2, 2)).toBe(true)
    expect(EIntOrd.equals(2, 3)).toBe(false)
    expect(EIntOrd.equals(Infinite, Infinite)).toBe(true)
    expect(EIntOrd.equals(2, Infinite)).toBe(false)
  })

  test('minAll and maxAll', () => {
    expect(EIntOrd.minAll([3, 2, 1])).toBe(1)
    expect(EIntOrd.maxAll([3, 2, 1])).toBe(3)
    expect(() => EIntOrd.minAll([])).toThrow()
    expect(() => EIntOrd.maxAll([])).toThrow()
  })
})
