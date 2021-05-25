import Field from './Field';
import {gcd, int, mod} from '../utils';
import { cache } from 'decorator-cache-getter';

export class Rational {
  public num: int
  public den: int
  public constructor(num: int, den: int) {
    this.num = num
    this.den = den
  }

  public toString(): string {
    return `${this.num}/${this.den}`
  }
}

// A singleton class that represents the rationals.
export class RationalField extends Field<Rational> {
  private _zero = {num: 0, den: 1}
  private _one = {num: 1, den: 1}

  @cache public get zero() { return new Rational(0, 1) }
  @cache public get one() { return new Rational(1, 1) }

  // Generate a canonical representation of a rational number.
  // Every rational number created using this function will have a unique representation.
  public reduce = (num: int, den: int): Rational => {
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      throw new Error('Arguments are not integers')
    }
    if (den == 0) {
      throw new Error('Denominator is zero.')
    } else if (num == 0) {
      return new Rational(0, 1)
    } else {
      const sign = Math.sign(num) * Math.sign(den)
      num = Math.abs(num)
      den = Math.abs(den)

      const g = gcd(num, den)
      return new Rational(sign * num/g, den/g)
    }
  }

  public add(a: Rational, b: Rational) {
    return this.reduce(a.num * b.den + b.num * a.den, a.den * b.den)
  }

  public subtract(a: Rational, b: Rational) {
    return this.reduce(a.num * b.den - b.num * a.den, a.den * b.den)
  }

  public multiply(a: Rational, b: Rational) {
    return this.reduce(a.num * b.num, a.den * b.den)
  }

  public unsafeDivide(a: Rational, b: Rational) {
    return this.reduce(a.num * b.den, a.den * b.num)
  }

  public negate(a: Rational) {
    return new Rational(-a.num, a.den)
  }

  public unsafeInvert(a: Rational) {
    return new Rational(a.den*Math.sign(a.num), Math.abs(a.num))
  }

  public equals(a: Rational, b: Rational): boolean {
    return a.num == b.num && a.den == b.den;
  }

  public nonZeroPow(a: Rational, n: int) {
    return new Rational(Math.pow(a.num, n), Math.pow(a.den, n))
  }

  public fromInt(n: int) {
    return new Rational(n, 1)
  }

  public fromRational(r: Rational) {
    return r
  }

  public remainder(a: Rational, b: Rational): Rational {
    if (this.isZero(a)) return a
    const intA = a.num * b.den
    const intB = b.num * a.den
    if (intA < intB) return a
    return this.reduce(mod(intA, intB), a.den * b.den)
  }

  public toString(): string {
    return `Rational Field`
  }
}

export const rationalField = new RationalField()