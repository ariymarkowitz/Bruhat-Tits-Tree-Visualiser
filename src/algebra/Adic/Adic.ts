import { Rational, Rationals } from '../Field/Rationals'
import { DVField } from "../Field/DVField"
import { Integers } from '../Ring/Integers'


export class Adic extends DVField<Rational, number> {
  public uniformizerInt

  public constructor(public p: number) {
    super()
    this.uniformizerInt = p
  }

  public get zero(): Rational {
    return Rationals.zero
  }

  public get one(): Rational {
    return Rationals.one
  }

  public num(a: Rational): number {
    return a.num
  }

  public den(a: Rational): number {
    return a.den
  }

  public reduce(num: number, den: number): Rational {
    return Rationals.reduce(num, den)
  }

  public fractionUnsafe(num: number, den: number): Rational {
    return {num, den}
  }

  public valuationRing = Integers

  public valuationNonZeroInt(n: number): number {
    let v = 0
    while (n % this.p === 0) {
      n /= this.p
      v += 1
    }

    return v
  }

  public equals(a: Rational, b: Rational): boolean {
    return Rationals.equals(a, b)
  }

  public fromInt(n: number): Rational {
    return Rationals.fromInt(n)
  }

  public fromRational(r: Rational): Rational {
    return r
  }

  public add(a: Rational, b: Rational): Rational {
    return Rationals.add(a, b)
  }

  public subtract(a: Rational, b: Rational): Rational {
    return Rationals.subtract(a, b)
  }

  public negate(a: Rational): Rational {
    return Rationals.negate(a)
  }

  public multiply(a: Rational, b: Rational): Rational {
    return Rationals.multiply(a, b)
  }

  public unsafeDivide(a: Rational, b: Rational): Rational {
    return Rationals.unsafeDivide(a, b)
  }

  public unsafeInvert(a: Rational): Rational {
    return Rationals.unsafeInvert(a)
  }

  public nonZeroPow(a: Rational, n: number): Rational {
    return Rationals.nonZeroPow(a, n)
  }

  public inValuationRing(a: Rational) {
    return a.den % this.p !== 0
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
      return `Adic[${this.p}]((${Rationals.toString(u)})e${v})`
    }
  }
}