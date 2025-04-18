import type { FiniteField } from '../Field/FiniteField'
import { EIntOrd, Infinite, type ExtendedInt } from '../Order/ExtendedInt'
import { EuclideanDomain } from './EuclideanDomain'

/**
 * The i-th element of the array is the coefficient of the i-th power of x.
 */
export type PolyRingElt = number[]

/**
 * A ring formed from the set of polynomials with coefficients in a finite field.
 */

export class PolynomialRing extends EuclideanDomain<PolyRingElt> {
  public zero: PolyRingElt
  public one: PolyRingElt

  constructor(public field: FiniteField) {
    super()
    this.zero = []
    this.one = [1]
  }

  public fromInt(n: number): PolyRingElt {
    return [this.field.fromInt(n)]
  }

  public fromInts(arr: number[]): PolyRingElt {
    return this.truncateZeros(arr).map(coef => this.field.fromInt(coef))
  }

  public add(a: PolyRingElt, b: PolyRingElt): PolyRingElt {
    let maxLength = Math.max(a.length, b.length)

    // Adjust maxLength to account for the result having leading zeros
    if (a.length === b.length) {
      while (maxLength > 0 && a[maxLength - 1] === -b[maxLength - 1]) {
        maxLength--
      }
    }

    const result = new Array(maxLength).fill(0)
    for (let i = 0; i < maxLength; i++) {
      result[i] = this.field.add(a[i] || 0, b[i] || 0)
    }
    return result
  }

  public negate(a: PolyRingElt): PolyRingElt {
    return a.map(coef => this.field.negate(coef))
  }

  public multiply(a: PolyRingElt, b: PolyRingElt): PolyRingElt {
    if (this.isZero(a) || this.isZero(b)) {
      return this.zero
    }
    const valA = this.valuation(a) as number
    const valB = this.valuation(b) as number

    const result = new Array(a.length + b.length - 1).fill(0)
    for (let i = valA; i < a.length; i++) {
      for (let j = valB; j < b.length; j++) {
        result[i + j] = this.field.add(result[i + j], this.field.multiply(a[i], b[j]))
      }
    }
    return result
  }

  public multiplyByScalar(a: PolyRingElt, b: number): PolyRingElt {
    return a.map(coef => this.field.multiply(coef, b))
  }

  public divideByScalar(a: PolyRingElt, b: number): PolyRingElt {
    if (this.field.isZero(b)) {
      throw new Error('Division by zero')
    }
    return a.map(coef => this.field.divide(coef, b))
  }

  public equals(a: PolyRingElt, b: PolyRingElt): boolean {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!this.field.equals(a[i], b[i])) {
        return false
      }
    }
    return true
  }

  public isZero(a: PolyRingElt): boolean {
    return a.length === 0
  }

  public isOne(a: PolyRingElt): boolean {
    return a.length === 1 && this.field.isOne(a[0])
  }

  /**
   * Returns the degree of the polynomial.
   * The degree of a non-zero polynomial is the largest index i such that a[i] != 0.
   */
  public degree(a: PolyRingElt): ExtendedInt {
    if (this.isZero(a)) {
      return Infinite
    }
    for (let i = a.length - 1; i >= 0; i--) {
      if (!this.field.isZero(a[i])) {
        return i
      }
    }
    return Infinite
  }

  /**
   * Returns the valuation of the polynomial.
   * The valuation of a non-zero polynomial is the smallest index i such that a[i] != 0.
   */
  public valuation(a: PolyRingElt): ExtendedInt {
    if (this.isZero(a)) {
      return Infinite
    }
    for (let i = 0; i < a.length; i++) {
      if (!this.field.isZero(a[i])) {
        return i
      }
    }
    return Infinite
  }

  public leadingCoefficient(a: PolyRingElt): number {
    if (this.isZero(a)) {
      throw new Error('Leading coefficient of zero polynomial is undefined')
    }
    for (let i = a.length - 1; i >= 0; i--) {
      if (!this.field.isZero(a[i])) {
        return a[i]
      }
    }
    throw new Error('Leading coefficient not found')
  }

  public truncateZeros(a: PolyRingElt): PolyRingElt {
    let i = a.length - 1
    while (i >= 0 && this.field.isZero(a[i])) {
      i--
    }
    if (i === -1) {
      return this.zero
    } else if (i === a.length - 1) {
      return a
    }
    return a.slice(0, i + 1)
  }

  public shift(a: PolyRingElt, n: number): PolyRingElt {
    if (this.isZero(a)) {
      return this.zero
    }
    if (n === 0) {
      return a
    }
    if (n < 0) {
      return a.slice(n, a.length)
    }
    const result = new Array(a.length + n).fill(0)
    for (let i = 0; i < a.length; i++) {
      result[i + n] = a[i]
    }
    return result
  }

  public edNorm(a: PolyRingElt): number {
      return this.valuation(a) as number
  }

  /**
   * Returns q and r such that a = b * q + r, where deg(r) < deg(b).
   */ 
  public divmod(a: PolyRingElt, b: PolyRingElt): [PolyRingElt, PolyRingElt] {
    if (this.isZero(b)) {
      throw new Error('Division by zero')
    }
    if (this.isZero(a)) {
      return [this.zero, this.zero]
    }
    let q = this.zero
    let deg = this.degree(b) as number
    while (EIntOrd.gte(this.degree(a), deg)) {
      const d = (this.degree(a) as number) - deg
      const coeff = this.field.divide(this.leadingCoefficient(a), this.leadingCoefficient(b))
      const term = this.shift(this.multiplyByScalar(b, coeff), d)
      a = this.subtract(a, term)
      q = this.add(q, this.shift([coeff], d))
    }
    return [q, a]
  }

  public div(a: PolyRingElt, b: PolyRingElt): PolyRingElt {
    return this.divmod(a, b)[0]
  }

  public mod(a: PolyRingElt, b: PolyRingElt): PolyRingElt {
    return this.divmod(a, b)[1]
  }

  public gcd(a: PolyRingElt, b: PolyRingElt): PolyRingElt {
    while (!this.isZero(b)) {
      [a, b] = [b, this.mod(a, b)]
    }
    return a
  }

  /**
   * Returns the extended GCD of a and b, i.e., returns (gcd(a, b), x, y, s, t) such that
   * gcd(a, b) = a * x + b * y and a * s + b * t = 0, where s and t are coprime.
   * In particular, t = -a / gcd(a, b) and s = b / gcd(a, b) up to scalar multiples.
   */
  public extendedGCD(a: PolyRingElt, b: PolyRingElt): [PolyRingElt, PolyRingElt, PolyRingElt, PolyRingElt, PolyRingElt] {
    let x0 = this.one
    let x1 = this.zero
    let y0 = this.zero
    let y1 = this.one

    while (!this.isZero(b)) {
      const [q, r] = this.divmod(a, b);
      [a, b, x0, y0, x1, y1] = [
        b, r, x1, y1,
        this.subtract(x0, this.multiply(q, x1)),
        this.subtract(y0, this.multiply(q, y1))
      ]
    }
    return [a, x0, y0, x1, y1]
  }

  public toString(): string;
  public toString(a: PolyRingElt): string;
  public toString(a?: PolyRingElt): string {
    if (a === undefined) {
      return `PolynomialRing(${a})`
    } else {
      // Render as a_0 + a_1 x + a_2 x^2 + ... + a_n x^n
      return a.entries()
      .filter(([_, coef]) => !this.field.isZero(coef))
      .map(([i, coef]) => `${coef}x^{${i}}`)
      .reduce((str, term) => `${str} + ${term}`)
    }
  }
  public toLatex(a: PolyRingElt): string {
    // Render as a_0 + a_1 x + a_2 x^2 + ... + a_n x^n
    return a.entries()
      .filter(([_, coef]) => !this.field.isZero(coef))
      .map(([i, coef]) => `${coef}x^{${i}}`)
      .reduce((str, term) => `${str} + ${term}`)
  }
}