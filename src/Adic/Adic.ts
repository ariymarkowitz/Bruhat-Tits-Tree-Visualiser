import { Rational, rationalField } from '../Field/Rational';
import { DVField } from "../Field/DVField";
import { int } from "../utils/utils";
import { cache } from 'decorator-cache-getter';
import { extendedInt, Infinite } from '../Order/ExtendedInt';

type splitNumber<NumberType> = {
  unit: NumberType // Unit
  valuation: int   // Valuation
}

export const Zero = Symbol('Zero');

type maybeSplitNumber<NumberType> = typeof Zero | splitNumber<NumberType>

export class AdicNumber {
  public p: int
  public value: maybeSplitNumber<Rational>

  public static nonzero(p: int, value: splitNumber<Rational>): AdicNumber {
    return new AdicNumber(p, value)
  }

  public constructor(p: int, value: maybeSplitNumber<Rational>) {
    this.p = p
    this.value = value
  }

  public toString() {
    if (this.value !== Zero) {
      return `Adic[${this.p}]((${this.value.unit})e${this.value.valuation})`
    } else {
      return `Adic[${this.p}](0)`
    }
  }
}

export class Adic extends DVField<AdicNumber> {
  private _p: int
  public get p() {
    return this._p
  }

  @cache
  public get uniformizer() {return this.fromInt(this._p) }

  public constructor(p: int) {
    super()
    this._p = p
  }

  @cache
  public get zero(): AdicNumber {
    return new AdicNumber(this.p, Zero)
  }

  @cache
  public get one(): AdicNumber {
    return new AdicNumber(this.p, {unit: rationalField.one, valuation: 0})
  }

  public nonzero(unit: Rational, valuation: int): AdicNumber {
    return new AdicNumber(this.p, {unit, valuation})
  }

  public valuation(x: AdicNumber): extendedInt {
    return x.value === Zero ? Infinite : x.value.valuation
  }

  public equals(a: AdicNumber, b: AdicNumber): boolean {
    if (a.value === Zero && b.value === Zero) {
      return true
    } else if (a.value === Zero || b.value === Zero) {
      return false
    } else {
      return a.value.valuation === b.value.valuation && rationalField.equals(a.value.unit, b.value.unit)
    }
  }

  private splitInt(n: int): splitNumber<int> {
    if (n === 0) { throw new Error('Input must be nonzero.') }

    const s = Math.sign(n)
    let u = Math.abs(n)
    let v = 0
    while (u % this.p == 0) {
      u /= this.p
      v += 1
    }

    return {unit: s*u, valuation: v}
  }

  public fromInt(n: int): AdicNumber {
    if (n === 0) {
      return this.zero
    } else {
      const {unit: u, valuation: v} = this.splitInt(n)
      return this.nonzero(rationalField.fromInt(u), v)
    }
  }

  // Returns p^a.
  public fromVal(a: extendedInt): AdicNumber {
    if (a === Infinite) {
      return this.zero
    } else {
      return this.nonzero(rationalField.one, a)
    }

  }

  public fromRational(r: Rational): AdicNumber {
    if (rationalField.isZero(r)) {
      return this.zero
    } else {
      const num = this.splitInt(r.num)
      const den = this.splitInt(r.den)
      return this.nonzero(
        new Rational(num.unit, den.unit),
        num.valuation - den.valuation
      )
    }
  }

  public toRational(x: AdicNumber): Rational {
    if (x.value === Zero) {
      return rationalField.zero
    } else {
      const {unit, valuation} = x.value
      if (valuation === 0) {
        return unit
      } else if (valuation < 0) {
        return rationalField.multiply(unit, new Rational(1, Math.pow(this.p, -valuation)))
      }
      return rationalField.multiply(unit, new Rational(Math.pow(this.p, valuation), 1))
    }
  }

  // The field as implemented is equivalent to the rational field.
  // Hence we may convert a function on rational numbers to a function on p-adic numbers.
  public liftFromRational(f: (...args: Rational[]) => Rational): (...args: AdicNumber[]) => AdicNumber {
    return (...args: AdicNumber[]) => {
      return this.fromRational(f(...args.map(x => this.toRational(x))))
    }
  }

  public add = this.liftFromRational((a, b) => rationalField.add(a, b))
  public subtract = this.liftFromRational((a, b) => rationalField.subtract(a, b))

  public negate(a: AdicNumber): AdicNumber {
    if (a.value === Zero) {
      return a
    } else {
      const value = a.value
      return this.nonzero(rationalField.negate(value.unit), value.valuation)
    }
  }

  public multiply(a: AdicNumber, b: AdicNumber): AdicNumber {
    if (a.value === Zero || b.value === Zero) {
      return this.zero
    } else {
      const u = rationalField.multiply(a.value.unit, b.value.unit)
      const v = a.value.valuation + b.value.valuation
      return this.nonzero(u, v)
    }
  }

  public unsafeDivide(a: AdicNumber, b: AdicNumber): AdicNumber {
    if (b.value === Zero) {
      throw new Error('Division by zero')
    }
    if (a.value === Zero) {
      return this.zero
    } else {
      const u = rationalField.unsafeDivide(a.value.unit, b.value.unit)
      const v = a.value.valuation - b.value.valuation
      return this.nonzero(u, v)
    }
  }

  public unsafeInvert(a: AdicNumber): AdicNumber {
    if (a.value === Zero) {
      throw new Error('Division by zero')
    }
    const u = a.value.unit
    const v = a.value.valuation
    return this.nonzero(rationalField.unsafeInvert(u), -v)
  }

  public nonZeroPow(a: AdicNumber, n: int): AdicNumber {
    if (a.value === Zero) {
      throw new Error('a should not be zero')
    }
    const u = a.value.unit
    const v = a.value.valuation
    return this.nonzero(rationalField.pow(u, n), v * n)
  }

  public remainder = this.liftFromRational((a, b) => rationalField.remainder(a, b))

  public modPow(a: AdicNumber, n: int): AdicNumber {
    if (a.value === Zero) return a
    if (a.value.valuation >= n) return this.zero
    return this.remainder(a, this.fromVal(n))
  }

  public toString(): string {
    return `${this.p}-adic Field`
  }
}