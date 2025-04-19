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

export class FunctionField extends DVField<FnFldElt, number[]> {
  public uniformizerInt = [0, 1]
  public residueFieldSize: number

  constructor(public p: number) {
    super()
    if (!Number.isInteger(p) || p <= 0) {
      throw new Error('p must be a positive integer')
    }
    if (!isPrime(p)) {
      throw new Error('p must be prime')
    }
    this.residueFieldSize = p
  }
  
  @Memoize() public get residueField(): FiniteField {
    return new FiniteField(this.p)
  }

  @Memoize() public get integralRing(): PolynomialRing {
    return new PolynomialRing(this.residueField)
  }

  public num(a: FnFldElt): number[] {
    return a.num
  }

  public den(a: FnFldElt): number[] {
    return a.den
  }

  public equals(a: FnFldElt, b: FnFldElt): boolean {
    const R = this.integralRing
    return R.equals(a.num, b.num) && R.equals(a.den, b.den)
  }

  public fractionUnsafe(num: number[], den: number[]): FnFldElt {
    return {num, den}
  }

  public reduce(num: number[], den: number[]): FnFldElt {
    const R = this.integralRing
    const Fp = this.residueField

    const reducedNum = R.fromInts(num)
    const reducedDen = R.fromInts(den)

    if (R.isZero(reducedDen)) {
      throw new Error('Denominator is zero.')
    }

    const {3: s, 4: t} = R.extendedGCD(reducedNum, reducedDen)
    // The leading coefficient of the denominator should be 1.
    const coeff = Fp.invert(R.leadingCoefficient(s))
    return {num: R.multiplyByScalar(t, Fp.negate(coeff)), den: R.multiplyByScalar(s, coeff)}
  }
  
  public valuation(x: FnFldElt): ExtendedInt {
    if (this.isZero(x)) return Infinite
    
    const num = this.valuationNonZeroInt(x.num)
    if (num > 0) return num
    else return -this.valuationNonZeroInt(x.den)
  }
  public valuationNonZeroInt(n: number[]): number {
    return this.integralRing.valuation(n) as number
  }
  public integralFromVal(n: ExtendedInt): number[] {
    return this.integralRing.fromValuation(n)
  }
  
  public unsafeInvert(a: FnFldElt): FnFldElt {
    return {num: a.den, den: a.num}
  }

  public add(a: FnFldElt, b: FnFldElt): FnFldElt {
    const R = this.integralRing

    const c = R.add(R.multiply(a.num, b.den), R.multiply(b.num, a.den))
    const d = R.multiply(a.den, b.den)

    return this.reduce(c, d)
  }

  public negate(a: FnFldElt): FnFldElt {
    return {num: this.integralRing.negate(a.num), den: a.den}
  }

  public multiply(a: FnFldElt, b: FnFldElt): FnFldElt {
    const R = this.integralRing

    // Pre-emptively reduce the valuations of the polynomials
    const deg1 = EIntOrd.min(R.valuation(a.num), R.valuation(b.den)) as number
    const deg2 = EIntOrd.min(R.valuation(b.num), R.valuation(a.den)) as number
    const an = R.shift(a.num, -deg1)
    const bd = R.shift(b.den, -deg1)
    const bn = R.shift(b.num, -deg2)
    const ad = R.shift(a.den, -deg2)
    
    return this.reduce(R.multiply(an, bn), R.multiply(ad, bd))
  }
  
  public readonly zero = {num: [], den: [1]}
  public readonly one = {num: [1], den: [1]}

  public fromInt(n: number): FnFldElt {
    return {num: [mod(n, this.p)], den: [1]}
  }
  public residue(a: number[]): number {
    return this.integralRing.isZero(a) ? 0 : mod(a[0], this.p)
  }
  public fromResidue(a: number): FnFldElt {
    return this.fromInt(a)
  }

  public toString(): string
  public toString(a: FnFldElt): string
  public toString(a?: FnFldElt): string {
    if (a === undefined) {
      return 'FunctionField'
    } else {
      if (this.isZero(a)) return '0'
      const R = this.integralRing
      let num = R.toString(a.num)
      let den = R.toString(a.den)
      if (R.degree(a.num) > 0) num = `(${num})`
      if (R.degree(a.den) > 0) den = `(${den})`
      if (R.isOne(a.den)) return num
      return `${num}/${den}`
    }
  }
  public toLatex(a: FnFldElt): string {
    if (this.isZero(a)) return '0'
    const R = this.integralRing
    const num = R.toLatex(a.num)
    const den = R.toLatex(a.den)
    if (R.isOne(a.den)) return num
    return `\\frac{${num}}{${den}}`
  }
}