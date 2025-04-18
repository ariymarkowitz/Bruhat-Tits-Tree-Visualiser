import { describe, test, expect } from 'vitest'
import { Adic } from './Adic'
import { Infinite } from '../Order/ExtendedInt'

describe('Adic', () => {
  const p = 3
  const adic = new Adic(p)

  test('valuation', () => {
    expect(adic.valuation({ num: 27, den: 1 })).toBe(3)
    expect(adic.valuation({ num: 1, den: 27 })).toBe(-3)
    expect(adic.valuation({ num: 0, den: 1 })).toBe(Infinite)
  })

  test('inValuationRing', () => {
    expect(adic.inValuationRing({ num: 2, den: 3 })).toBe(false)
    expect(adic.inValuationRing({ num: 2, den: 2 })).toBe(true)
    expect(adic.inValuationRing({ num: 9, den: 1 })).toBe(true)
    expect(adic.inValuationRing({ num: 1, den: 9 })).toBe(false)
  })

  test('integralFromVal', () => {
    expect(adic.integralFromVal(3)).toEqual(27)
  })

  test('fromVal', () => {
    expect(adic.fromVal(3)).toEqual({ num: 27, den: 1 })
    expect(adic.fromVal(-3)).toEqual({ num: 1, den: 27 })
    expect(adic.fromVal(Infinite)).toEqual({ num: 0, den: 1 })
  })

  test('fromIntegral', () => {
    expect(adic.fromIntegral(5)).toEqual({ num: 5, den: 1 })
  })

  test('splitNonZero', () => {
    const r = { num: 27, den: 2 }
    const split = adic.splitNonZero(r)
    expect(split).toEqual({ v: 3, u: { num: 1, den: 2 } })

    const r2 = { num: 1, den: 27 }
    const split2 = adic.splitNonZero(r2)
    expect(split2).toEqual({ v: -3, u: { num: 1, den: 1 } })
  })

  test('mod', () => {
    expect(adic.mod({ num: 10, den: 1 }, { num: 3, den: 1 })).toEqual({ num: 1, den: 1 })
    expect(adic.mod({ num: 7, den: 2 }, { num: 1, den: 3 })).toEqual({ num: 1, den: 6 })
  })

  test('modPow', () => {
    expect(adic.modPow({ num: 27, den: 1 }, 2)).toEqual({ num: 0, den: 1 })
    expect(adic.modPow({ num: 23, den: 18 }, -1)).toEqual({ num: 5, den: 18 })
  })

  test('residue', () => {
    expect(adic.residue(10)).toBe(1)
    expect(adic.residue(-7)).toBe(2)
    expect(adic.residue(3)).toBe(0)
  })

  test('toString', () => {
    expect(adic.toString()).toBe('3-adic Field')
    expect(adic.toString({ num: 0, den: 1 })).toBe('Adic[3](0)')
    expect(adic.toString({ num: 5, den: 6 })).toBe('5/6')
  })

  test('toLatex', () => {
    expect(adic.toLatex({ num: 5, den: 6 })).toBe('\\frac{5}{6}')
  })
})
