/**
 * The function field of a polynomial ring over a finite field.
 */

import { Memoize } from 'fast-typescript-memoize';
import { DVField } from '../Field/DVField';
import { FiniteField } from '../Field/FiniteField';
import { EIntOrd, Infinite, type ExtendedInt } from '../Order/ExtendedInt';
import { PolynomialRing } from '../Ring/PolynomialRing';
import { isPrime, mod } from '../utils/int';

export type FnFldElt = {
  num: number[]
  den: number[]
}

class FunctionField extends DVField<FnFldElt, number[]> {

  constructor(public p: number) {
    super()
    if (!Number.isInteger(p) || p <= 0) {
      throw new Error('p must be a positive integer')
    }
    if (!isPrime(p)) {
      throw new Error('p must be prime')
    }
  }
  
  @Memoize() public get residueField(): FiniteField {
    return new FiniteField(this.p)
  }

  @Memoize() public get valuationRing(): PolynomialRing {
    return new PolynomialRing(this.residueField)
  }

  public uniformizerInt = [0]

  public num(a: FnFldElt): number[] {
    return a.num
  }

  public den(a: FnFldElt): number[] {
    return a.den
  }

  public fractionUnsafe(num: number[], den: number[]): FnFldElt {
    return {num, den}
  }

  public reduce(num: number[], den: number[]): FnFldElt {
    const R = this.valuationRing
    const Fp = this.residueField

    const reducedNum = R.fromInts(num)
    const reducedDen = R.fromInts(den)

    if (R.isZero(reducedDen)) {
      throw new Error('Denominator is zero.')
    }

    const {3: s, 4: t} = R.extendedGCD(reducedNum, reducedDen)
    const coeff = Fp.divide(Fp.negate(R.leadingCoefficient(t)), R.leadingCoefficient(s))
    return {num: R.multiplyByScalar(s, -coeff), den: R.multiplyByScalar(t, coeff)}
  }
  
  public valuation(x: FnFldElt): ExtendedInt {
    if (this.isZero(x)) return Infinite
    
    const num = this.valuationNonZeroInt(x.num)
    if (num > 0) return num
    else return -this.valuationNonZeroInt(x.den)
  }

  public valuationNonZeroInt(n: number[]): number {
    return this.valuationRing.degree(n) as number
  }
  
  public unsafeInvert(a: FnFldElt): FnFldElt {
    return {num: a.den, den: a.num}
  }

  public add(a: FnFldElt, b: FnFldElt): FnFldElt {
    const R = this.valuationRing

    const c = R.add(R.multiply(a.num, b.den), R.multiply(b.num, a.den))
    const d = R.multiply(a.den, b.den)

    return this.reduce(c, d)
  }

  public negate(a: FnFldElt): FnFldElt {
    return {num: this.valuationRing.negate(a.num), den: a.den}
  }

  public multiply(a: FnFldElt, b: FnFldElt): FnFldElt {
    const R = this.valuationRing

    // Pre-emptively reduce the degrees of the polynomials
    const deg1 = EIntOrd.min(R.degree(a.num), R.degree(b.den)) as number
    const deg2 = EIntOrd.min(R.degree(b.num), R.degree(a.den)) as number
    const an = R.shift(a.num, -deg1)
    const bn = R.shift(b.num, -deg2)
    
    return this.reduce(R.multiply(an, bn), R.multiply(an, bn))
  }
  
  public readonly zero = {num: [0], den: [1]}
  public readonly one = {num: [1], den: [1]}

  public fromInt(n: number): FnFldElt {
    return {num: [mod(n, this.p)], den: [1]}
  }

  public toString(): string
  public toString(a: FnFldElt): string
  public toString(a?: FnFldElt): string {
    if (a === undefined) {
      return 'FunctionField'
    } else {
      const num = this.valuationRing.toString(a.num)
      const den = this.valuationRing.toString(a.den)
      return `(${num}) / (${den})`
    }
  }
}