import { cache } from 'decorator-cache-getter'
import { gcd, int, mod } from '../utils/int'
import { Field } from './Field'

export interface Rational {
  num: int
  den: int
}

export function Rational(num: int, den: int): Rational {
  return {num, den}
}

// A singleton class that represents the rationals.
class RationalFieldSingleton extends Field<Rational> {
  @cache public get zero() { return Rational(0, 1) }
  @cache public get one() { return Rational(1, 1) }

  // Generate a canonical representation of a rational number.
  // Every rational number created using this function will have a unique representation.
  public reduce = (num: int, den: int): Rational => {
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      throw new Error('Arguments are not integers')
    }
    if (den === 0) {
      throw new Error('Denominator is zero.')
    } else if (num === 0) {
      return Rational(0, 1)
    } else {
      const sign = Math.sign(num) * Math.sign(den)
      num = Math.abs(num)
      den = Math.abs(den)

      const g = gcd(num, den)
      return Rational(sign * num/g, den/g)
    }
  }

  public add(a: Rational, b: Rational) {
    if (a.den === 1 && b.den === 1) {
      return this.fromInt(a.num + b.num)
    } else {
      return this.reduce(a.num * b.den + b.num * a.den, a.den * b.den)
    }
  }

  public subtract(a: Rational, b: Rational) {
    if (a.den === 1 && b.den === 1) {
      return this.fromInt(a.num - b.num)
    } else {
      return this.reduce(a.num * b.den - b.num * a.den, a.den * b.den)
    }
  }

  public multiply(a: Rational, b: Rational) {
    return this.reduce(a.num * b.num, a.den * b.den)
  }

  public unsafeDivide(a: Rational, b: Rational) {
    return this.reduce(a.num * b.den, a.den * b.num)
  }

  public negate(a: Rational) {
    return Rational(-a.num, a.den)
  }

  public unsafeInvert(a: Rational) {
    return Rational(a.den*Math.sign(a.num), Math.abs(a.num))
  }

  public equals(a: Rational, b: Rational): boolean {
    return a.num == b.num && a.den == b.den
  }

  public nonZeroPow(a: Rational, n: int) {
    return Rational(Math.pow(a.num, n), Math.pow(a.den, n))
  }

  public fromInt(n: int) {
    return Rational(n, 1)
  }

  public fromRational(r: Rational) {
    return r
  }

  public remainder(a: Rational, b: Rational): Rational {
    if (this.isZero(a)) return a
    if (a.den === 1 && b.den === 1) return this.fromInt(mod(a.num, b.num))
    const intA = a.num * b.den
    const intB = b.num * a.den
    if (intA < intB) return a
    return this.reduce(mod(intA, intB), a.den * b.den)
  }

  public toString(r?: Rational): string {
    if (r === undefined) {
      return `Rational Field`
    } else {
      return `${r.num}/${r.den}`
    }
  }
}

export const RationalField = new RationalFieldSingleton()