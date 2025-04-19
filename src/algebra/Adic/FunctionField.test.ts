import { describe, test, expect } from 'vitest'
import { FunctionField } from './FunctionField'
import { Infinite } from '../Order/ExtendedInt'

describe('FunctionField', () => {
  const p = 3
  const F = new FunctionField(p)

  const a = { num: [1, 2], den: [1] } // 1 + 2x
  const b = { num: [2, 1], den: [1] } // 2 + x

  test('equals', () => {
    expect(F.equals(a, b)).toBe(false)
    expect(F.equals(a, { num: [1, 2], den: [1] })).toBe(true)
  })

  test('reduce', () => {
    expect(F.reduce([1, 2], [1])).toEqual({ num: [1, 2], den: [1] })
  })

  test('fromInt', () => {
    expect(F.fromInt(4)).toEqual({ num: [1], den: [1] })
  })

  test('add', () => {
    // The zero polynomial is represented as []
    expect(F.add(a, b)).toEqual({ num: [], den: [1] })
  })

  test('negate', () => {
    expect(F.negate(a)).toEqual({ num: [2, 1], den: [1] })
  })

  test('multiply', () => {
    expect(F.multiply(a, b)).toEqual(F.reduce([2, 2, 2], [1]))
  })

  test('valuation', () => {
    expect(F.valuation({ num: [0, 0, 1], den: [1] })).toBe(2)
    expect(F.valuation({ num: [1], den: [0, 0, 1] })).toBe(-2)
    expect(F.valuation(F.zero)).toBe(Infinite)
  })

  test('inValuationRing', () => {
    expect(F.inValuationRing({ num: [1, 2], den: [0, 1] })).toBe(false)
    expect(F.inValuationRing({ num: [1, 1], den: [1] })).toBe(true)
  })

  test('integralFromVal', () => {
    expect(F.integralFromVal(2)).toEqual([0, 0, 1])
  })

  test('fromVal', () => {
    expect(F.fromVal(2)).toEqual({ num: [0, 0, 1], den: [1] })
    expect(F.fromVal(-2)).toEqual({ num: [1], den: [0, 0, 1] })
    expect(F.fromVal(Infinite)).toEqual(F.zero)
  })

  test('fromIntegral', () => {
    expect(F.fromIntegral([2, 1])).toEqual({ num: [2, 1], den: [1] })
  })

  test('splitNonZero', () => {
    const r = { num: [0, 0, 1], den: [2] }
    const split = F.splitNonZero(r)
    expect(split.u).toEqual({ num: [1], den: [2] })
    expect(split.v).toBe(2)
  })

  test('mod', () => {
    expect(F.mod({ num: [2, 0, 1], den: [1] }, { num: [1, 2], den: [1] })).toEqual(F.zero)
    expect(F.mod({ num: [1, 1], den: [1] }, { num: [0, 1], den: [1] })).toEqual(F.one)
  })

  test('modPow', () => {
    expect(F.modPow({ num: [0, 0, 1], den: [1] }, 2)).toEqual(F.zero)
  })

  test('residue', () => {
    expect(F.residue([10])).toBe(1)
    expect(F.residue([-7])).toBe(2)
    expect(F.residue([3])).toBe(0)
    expect(F.residue([])).toBe(0)
  })

  test('toString', () => {
    expect(F.toString()).toBe('FunctionField')
    expect(F.toString(F.zero)).toBe('0')
    expect(F.toString({ num: [1, 2], den: [1, 1] })).toBe('(1 + 2x)/(1 + x)')
  })

  test('toLatex', () => {
    expect(F.toLatex(F.zero)).toBe('0')
    expect(F.toLatex({ num: [0, 1, 2], den: [1] })).toBe('x + 2x^{2}')
    expect(F.toLatex({ num: [1, 2], den: [1, 0, 1] })).toBe('\\frac{1 + 2x}{1 + x^{2}}')
  })
})
