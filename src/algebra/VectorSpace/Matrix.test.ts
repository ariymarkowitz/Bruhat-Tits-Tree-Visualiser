import { describe, test, expect } from 'vitest'
import { Adic } from '../Adic/Adic'
import { LaurentField, type FnFldElt } from '../Adic/LaurentField'
import { VectorSpace } from './VectorSpace'

describe('MatrixAlgebra with Adic Field', () => {
  const p = 3
  const Qp = new Adic(p)
  const V = new VectorSpace(2, Qp)
  const M = V.matrixAlgebra

  const m1 = M.fromInts([[1, 0], [0, 1]])
  const m2 = M.fromInts([[2, 1], [1, 2]])
  const v = V.fromInts([1, 2])

  test('construction', () => {
    expect(M.dim).toBe(2)
    expect(M.field).toBe(Qp)
    expect(M.vectorSpace).toBe(V)
  })

  test('zero and one', () => {
    expect(M.zero).toEqual([[Qp.zero, Qp.zero], [Qp.zero, Qp.zero]])
    expect(M.one).toEqual([[Qp.one, Qp.zero], [Qp.zero, Qp.one]])
  })

  test('map and fill', () => {
    const filled = M.fill((col, row) => Qp.fromInt(col + row))
    expect(filled).toEqual([[Qp.fromInt(0), Qp.fromInt(1)], [Qp.fromInt(1), Qp.fromInt(2)]])
    
    const mapped = M.map(m1, (e, col, row) => Qp.fromInt(col + row))
    expect(mapped).toEqual(filled)
  })

  test('column and row operations', () => {
    expect(M.column(0, m2)).toEqual([Qp.fromInt(2), Qp.fromInt(1)])
    expect(M.row(0, m2)).toEqual([Qp.fromInt(2), Qp.fromInt(1)])
    
    const newCol = [Qp.fromInt(3), Qp.fromInt(4)]
    const newRow = [Qp.fromInt(5), Qp.fromInt(6)]
    
    const withNewCol = M.replaceColumn(m2, 0, newCol)
    expect(M.column(0, withNewCol)).toEqual(newCol)
    
    const withNewRow = M.replaceRow(m2, 0, newRow)
    expect(M.row(0, withNewRow)).toEqual(newRow)
  })

  test('add, subtract, negate', () => {
    const sum = M.add(m1, m2)
    expect(sum).toEqual([[Qp.fromInt(3), Qp.fromInt(1)], [Qp.fromInt(1), Qp.fromInt(3)]])
    
    const diff = M.subtract(m2, m1)
    expect(diff).toEqual([[Qp.fromInt(1), Qp.fromInt(1)], [Qp.fromInt(1), Qp.fromInt(1)]])
    
    const negated = M.negate(m1)
    expect(negated).toEqual([[Qp.fromInt(-1), Qp.fromInt(-0)], [Qp.fromInt(-0), Qp.fromInt(-1)]])
  })

  test('scale', () => {
    const scaled = M.scale(Qp.fromInt(2), m1)
    expect(scaled).toEqual([[Qp.fromInt(2), Qp.fromInt(0)], [Qp.fromInt(0), Qp.fromInt(2)]])
  })

  test('apply', () => {
    const result = M.apply(m2, v)
    expect(result).toEqual([Qp.fromInt(4), Qp.fromInt(5)])
  })

  test('multiply', () => {
    const product = M.multiply(m1, m2)
    expect(product).toEqual(m2)
    
    const product2 = M.multiply(m2, m2)
    expect(product2).toEqual([[Qp.fromInt(5), Qp.fromInt(4)], [Qp.fromInt(4), Qp.fromInt(5)]])
  })

  test('trace and determinant', () => {
    expect(M.trace(m1)).toEqual(Qp.fromInt(2))
    expect(M.trace(m2)).toEqual(Qp.fromInt(4))
    
    expect(M.determinant(m1)).toEqual(Qp.fromInt(1))
    expect(M.determinant(m2)).toEqual(Qp.fromInt(3))
  })

  test('invert', () => {
    const inverse = M.invert(m2)
    const product = M.multiply(m2, inverse)
    
    // Verify that m2 * inverse = identity matrix
    expect(product).toEqual(M.one)
  })

  test('fromScalar and fromInt', () => {
    expect(M.fromScalar(Qp.fromInt(2))).toEqual([[Qp.fromInt(2), Qp.zero], [Qp.zero, Qp.fromInt(2)]])
    expect(M.fromInt(1)).toEqual(M.one)
  })

  test('isSingular', () => {
    expect(M.isSingular(m1)).toBe(false)
    expect(M.isSingular(m2)).toBe(false)
    
    const singular = M.fromInts([[1, 1], [1, 1]])
    expect(M.isSingular(singular)).toBe(true)
  })

  test('clone', () => {
    const cloned = M.clone(m1)
    expect(cloned).toEqual(m1)
    expect(cloned).not.toBe(m1) // Different object reference
  })

  test('conjugate', () => {
    const result = M.conjugate(m2, m1)
    expect(result).toEqual(m2) // Conjugation by identity matrix returns the same matrix
  })

  test('isEigenvector', () => {
    // Identity matrix has every non-zero vector as eigenvector
    expect(M.isEigenvector(m1, v)).toBe(true)
  })

  test('toString and toLatex', () => {
    expect(M.toString()).toContain('MatrixAlgebra')
    expect(M.toString(m1)).toBe('[[1, 0], [0, 1]]')
    expect(M.toString(m2)).toBe('[[2, 1], [1, 2]]')
    
    const latex = M.toLatex(m1)
    expect(latex).toBe('\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}')
  })
})

describe('MatrixAlgebra with LaurentField', () => {
  const p = 3
  const F = new LaurentField(p)
  const V = new VectorSpace<FnFldElt>(2, F)
  const M = V.matrixAlgebra
  
  // Create some test matrices and vectors
  // [1, 0]
  // [0, 1]
  const m1 = [
    [F.fromIntegral([1]), F.fromIntegral([])],
    [F.fromIntegral([]), F.fromIntegral([1])]
  ]
  
  // [1+x, x]
  // [x, 1+x]
  const m2 = [
    [F.fromIntegral([1, 1]), F.fromIntegral([0, 1])],
    [F.fromIntegral([0, 1]), F.fromIntegral([1, 1])]
  ]
  
  // [1, 1+x]
  const v = [F.fromIntegral([1]), F.fromIntegral([1, 1])]

  test('construction', () => {
    expect(M.dim).toBe(2)
    expect(M.field).toBe(F)
  })

  test('add and subtract', () => {
    const sum = M.add(m1, m2)
    
    // Expected: [2+x, x]
    //           [x, 2+x]
    expect(F.equals(sum[0][0], F.fromIntegral([2, 1]))).toBe(true)
    expect(F.equals(sum[0][1], F.fromIntegral([0, 1]))).toBe(true)
    expect(F.equals(sum[1][0], F.fromIntegral([0, 1]))).toBe(true)
    expect(F.equals(sum[1][1], F.fromIntegral([2, 1]))).toBe(true)
    
    const diff = M.subtract(m2, m1)
    
    // Expected: [x, x]
    //           [x, x]
    expect(F.equals(diff[0][0], F.fromIntegral([0, 1]))).toBe(true)
    expect(F.equals(diff[0][1], F.fromIntegral([0, 1]))).toBe(true)
    expect(F.equals(diff[1][0], F.fromIntegral([0, 1]))).toBe(true)
    expect(F.equals(diff[1][1], F.fromIntegral([0, 1]))).toBe(true)
  })

  test('apply', () => {
    const result = M.apply(m2, v)
    
    // Expected: [1 + x + x(1+x), x + (1+x)(1+x)]
    //           [1 + 2x + x^2, 1 + x^2]
    expect(F.equals(result[0], F.fromIntegral([1, 2, 1]))).toBe(true)
    expect(F.equals(result[1], F.fromIntegral([1, 0, 1]))).toBe(true)
  })

  test('multiply', () => {
    const product = M.multiply(m1, m2)
    
    // Identity matrix multiplication should yield the original matrix
    expect(product).toEqual(m2)
    
    const product2 = M.multiply(m2, m2)
    
    // Expected: [(1+x)^2 + x^2, (1+x)x + x(1+x)]
    //           [(1+x)x + x(1+x), x^2 + (1+x)^2]
    //           [1 + 2x + x^2 + x^2, 2x + 2x^2]
    //           [2x + 2x^2, 1 + 2x + x^2 + x^2]
    //           [1 + 2x + 2x^2, 2x + 2x^2]
    //           [2x + 2x^2, 1 + 2x + 2x^2]
    expect(F.equals(product2[0][0], F.fromIntegral([1, 2, 2]))).toBe(true)
    expect(F.equals(product2[0][1], F.fromIntegral([0, 2, 2]))).toBe(true)
    expect(F.equals(product2[1][0], F.fromIntegral([0, 2, 2]))).toBe(true)
    expect(F.equals(product2[1][1], F.fromIntegral([1, 2, 2]))).toBe(true)
  })

  test('determinant', () => {
    const det1 = M.determinant(m1)
    expect(F.equals(det1, F.one)).toBe(true)
    
    const det2 = M.determinant(m2)
    // det(m2) = (1+x)^2 - x^2 = 1 + 2x + x^2 - x^2 = 1 + 2x
    expect(F.equals(det2, F.fromIntegral([1, 2]))).toBe(true)
  })

  test('invert', () => {
    const inverse = M.invert(m2)
    const product = M.multiply(m2, inverse)
    
    // Verify that m2 * inverse = identity matrix
    expect(F.equals(product[0][0], F.one)).toBe(true)
    expect(F.equals(product[0][1], F.zero)).toBe(true)
    expect(F.equals(product[1][0], F.zero)).toBe(true)
    expect(F.equals(product[1][1], F.one)).toBe(true)
  })

  test('singular matrices', () => {
    // Create a singular matrix
    const singular = [
      [F.fromIntegral([1]), F.fromIntegral([1])],
      [F.fromIntegral([1]), F.fromIntegral([4])]
    ]
    
    expect(M.isSingular(singular)).toBe(true)
    expect(() => M.invert(singular)).toThrow('Matrix is singular')
  })

  test('toString and toLatex', () => {
    expect(M.toString(m1)).toBe('[[1, 0], [0, 1]]')
    expect(M.toString(m2)).toBe('[[(1 + x), (x)], [(x), (1 + x)]]')
    
    const latex = M.toLatex(m2)
    expect(latex).toBe('\\begin{bmatrix} 1 + x & x \\\\ x & 1 + x \\end{bmatrix}')
  })
})