import { Rational, RationalField } from '../Field/Rational'
import { DVField } from "../Field/DVField"
import type { int } from "../utils/int"
import { cache } from 'decorator-cache-getter'
import { ExtendedInt, Infinite } from '../Order/ExtendedInt'

export class Adic extends DVField<Rational> {
  private _p: int
  public get p() {
    return this._p
  }

  @cache
  public get uniformizer() {return this.fromInt(this.p) }

  public constructor(p: int) {
    super()
    this._p = p
  }

  public get zero(): Rational {
    return RationalField.zero
  }

  public get one(): Rational {
    return RationalField.one
  }

  public valuation(x: Rational): ExtendedInt {
    if (this.isZero(x)) return Infinite
    
    const num = this.valuationNonZeroInt(x.num)
    if (num > 0) return num
    else return -this.valuationNonZeroInt(x.den)
  }

  private valuationNonZeroInt(n: int): int {
    let v = 0
    while (n % this.p === 0) {
      n /= this.p
      v += 1
    }

    return v
  }

  public splitNonZero(x: Rational): {u: Rational, v: int} {
    const splitNum = this.splitNonZeroInt(x.num)
    if (splitNum.u > 0) {
      return {
        u: Rational(splitNum.u, x.den),
        v: splitNum.v
      }
    }
    else {
      const splitDen = this.splitNonZeroInt(x.den)
      return {
        u: Rational(splitDen.u, x.den),
        v: -splitNum.v
      }
    }
  }

  private splitNonZeroInt(n: int): {u: int, v: int} {
    let v = 0
    while (n % this.p === 0) {
      n /= this.p
      v += 1
    }

    return {u: n, v}
  }

  public equals(a: Rational, b: Rational): boolean {
    return RationalField.equals(a, b)
  }

  public fromInt(n: int): Rational {
    return RationalField.fromInt(n)
  }

  // Returns p^a.
  public fromVal(n: ExtendedInt): Rational {
    if (n === Infinite) return this.zero
    else if (n === 0) return this.one
    else if (n > 0) return Rational(Math.pow(this.p, n), 1)
    else return Rational(1, Math.pow(this.p, -n))
  }

  public fromRational(r: Rational): Rational {
    return r
  }

  public add(a: Rational, b: Rational): Rational {
    return RationalField.add(a, b)
  }

  public subtract(a: Rational, b: Rational): Rational {
    return RationalField.subtract(a, b)
  }

  public negate(a: Rational): Rational {
    return RationalField.negate(a)
  }

  public multiply(a: Rational, b: Rational): Rational {
    return RationalField.multiply(a, b)
  }

  public unsafeDivide(a: Rational, b: Rational): Rational {
    return RationalField.unsafeDivide(a, b)
  }

  public unsafeInvert(a: Rational): Rational {
    return RationalField.unsafeInvert(a)
  }

  public nonZeroPow(a: Rational, n: int): Rational {
    return RationalField.nonZeroPow(a, n)
  }

  public remainder(a: Rational, b: Rational) {
    return RationalField.remainder(a, b)
  }

  // Does NOT give a unique value in the image of a in Q to Z/p^nZ.
  // Rather, finds the unique 0 <= r < p^n such that a = r + tp^n,
  // where t is an integer.
  public modPow(a: Rational, n: int): Rational {
    if (this.isZero(a)) return a
    return this.remainder(a, this.fromVal(n))
  }

  public inValuationRing(a: Rational) {
    return a.den % this.p !== 0
  }

  public isIntegerUnit(a: Rational) {
    return a.num % this.p !== 0 && a.den % this.p !== 0
  }

  public toString(): string
  public toString(n: Rational): string
  public toString(n?: Rational): string {
    if (n === undefined) {
      return `${this.p}-adic Field`
    }
    
    if (this.isZero(n)) {
      return `Adic[${this.p}](0)`
    } else {
      const {u, v} = this.splitNonZero(n)
      return `Adic[${this.p}]((${RationalField.toString(u)})e${v})`
    }
  }
}