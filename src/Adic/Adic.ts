import { Rational as Reduced, RationalField } from '../Field/Rational';
import { DVField } from "../Field/DVField";
import { int } from "../utils/int";
import { cache } from 'decorator-cache-getter';
import { ExtendedInt, Infinite } from '../Order/ExtendedInt';

export class Adic extends DVField<Reduced> {
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

  public get zero(): Reduced {
    return RationalField.zero
  }

  public get one(): Reduced {
    return RationalField.one
  }

  public valuation(x: Reduced): ExtendedInt {
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

  public splitNonZero(x: Reduced): {u: Reduced, v: int} {
    const splitNum = this.splitNonZeroInt(x.num)
    if (splitNum.u > 0) {
      return {
        u: Reduced(splitNum.u, x.den),
        v: splitNum.v
      }
    }
    else {
      const splitDen = this.splitNonZeroInt(x.den)
      return {
        u: Reduced(splitDen.u, x.den),
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

  public equals(a: Reduced, b: Reduced): boolean {
    return RationalField.equals(a, b)
  }

  public fromInt(n: int): Reduced {
    return RationalField.fromInt(n)
  }

  // Returns p^a.
  public fromVal(n: ExtendedInt): Reduced {
    if (n === Infinite) return this.zero
    else if (n === 0) return this.one
    else if (n > 0) return Reduced(Math.pow(this.p, n), 1)
    else return Reduced(1, Math.pow(this.p, -n))
  }

  public fromRational(r: Reduced): Reduced {
    return r
  }

  public add(a: Reduced, b: Reduced): Reduced {
    return RationalField.add(a, b)
  }

  public subtract(a: Reduced, b: Reduced): Reduced {
    return RationalField.subtract(a, b)
  }

  public negate(a: Reduced): Reduced {
    return RationalField.negate(a)
  }

  public multiply(a: Reduced, b: Reduced): Reduced {
    return RationalField.multiply(a, b)
  }

  public unsafeDivide(a: Reduced, b: Reduced): Reduced {
    return RationalField.unsafeDivide(a, b)
  }

  public unsafeInvert(a: Reduced): Reduced {
    return RationalField.unsafeInvert(a)
  }

  public nonZeroPow(a: Reduced, n: int): Reduced {
    return RationalField.nonZeroPow(a, n)
  }

  public remainder(a: Reduced, b: Reduced) {
    return RationalField.remainder(a, b)
  }

  public modPow(a: Reduced, n: int): Reduced {
    if (this.isZero(a)) return a
    return this.remainder(a, this.fromVal(n))
  }

  public toString(): string
  public toString(n: Reduced): string
  public toString(n?: Reduced): string {
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