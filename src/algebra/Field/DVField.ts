import { EIntOrd, Infinite, type ExtendedInt } from '../Order/ExtendedInt'
import type { EuclideanDomain } from '../Ring/EuclideanDomain'
import { Field } from "./Field"

/**
 * A field with a discrete valuation.
 * This is represented as a field of fractions of a valuation ring.
 */
export abstract class DVField<FieldElement, RingElement> extends Field<FieldElement> {
  /**
   * The uniformizer as an element of the valuation ring.
   */
  public abstract uniformizerInt: RingElement
  /**
   * The uniformizer as an element of the field.
   */
  public get uniformizer(): FieldElement {
    return this.fractionUnsafe(this.uniformizerInt, this.valuationRing.one)
  }

  /**
   * The numerator of a field element.
   */
  public abstract num(a: FieldElement): RingElement
  /**
   * The denominator of a field element.
   */
  public abstract den(a: FieldElement): RingElement
  /**
   * Reduces a fraction to its canonical form.
   * This function checks for zero divisors.
   */
  public abstract reduce(num: RingElement, den: RingElement): FieldElement
  /**
   * Constructs a fraction from two elements of the valuation ring.
   * This function does not reduce the fraction or check for zero divisors.
   */
  public abstract fractionUnsafe(num: RingElement, den: RingElement): FieldElement

  public abstract valuationRing: EuclideanDomain<RingElement>
  public abstract valuationNonZeroInt(n: RingElement): number
  public valuation(x: FieldElement): ExtendedInt {
    if (this.isZero(x)) return Infinite
    const num = this.valuationNonZeroInt(this.num(x))
    if (num > 0) return num
    else return -this.valuationNonZeroInt(this.den(x))
  }
  public inValuationRing(a: FieldElement): boolean {
    return EIntOrd.gte(this.valuation(a), 0)
  }
  public fromIntegral(a: RingElement): FieldElement {
    return this.fractionUnsafe(a, this.valuationRing.one)
  }

  /**
   * Returns u^a as an element of the valuation ring, where u is the uniformizer and a is an integer.
   */
  public integralFromVal(n: ExtendedInt): RingElement {
    if (n === Infinite) return this.valuationRing.zero
    return this.valuationRing.pow(this.uniformizerInt, -n)
  }

  /**
   * Returns u^a, where u is the uniformizer and a is an integer.
   */
  public fromVal(n: ExtendedInt): FieldElement {
    if (n === Infinite) return this.zero
    else if (n === 0) return this.one
    else if (n > 0) return this.pow(this.uniformizer, n)
    return this.pow(this.uniformizer, -n)
  }

  /**
   * Splits a non-zero element into a unit and a power of the uniformizer.
   */
  public splitNonZero(a: FieldElement): {u: FieldElement, v: number} {
    const num = this.num(a)
    const den = this.den(a)

    if (this.valuationNonZeroInt(den) === 0) {
      const v = this.valuationNonZeroInt(num)
      return {u: this.fractionUnsafe(this.valuationRing.div(num, this.integralFromVal(v)), den), v}
    } else {
      const v = this.valuationNonZeroInt(den)
      return {u: this.fractionUnsafe(this.valuationRing.div(num, this.integralFromVal(-v)), den), v: -v}
    }
  }

  /**
   * Returns a mod b, that is q such that a = b \* q + r, where q is in the valuation ring.
   * This is not a modulus in the sense expected in a local field, because the norm used is not
   * well-defined in the local field.
   */
  public mod(a: FieldElement, b: FieldElement): FieldElement {
    const R = this.valuationRing
    if (this.isZero(a)) return a
    if (this.den(a) === 1 && this.den(b) === 1) return this.fromIntegral(R.mod(this.num(a), this.num(b)))
    const intA = R.multiply(this.num(a), this.den(b))
    const intB = R.multiply(this.num(b), this.den(a))
    if (R.edNorm(intA) < R.edNorm(intB)) return a
    return this.reduce(R.mod(intA, intB), R.multiply(this.den(a), this.den(b)))
  }

  /**
   * Returns a unique representive r satisfying a = q \* u^n + r, where q is in the valuation ring.
   * This is not a modulus in the sense expected in a local field, because the norm used is not
   * well-defined in the local field.
   */
  public modPow(a: FieldElement, n: number): FieldElement {
    if (this.isZero(a)) return this.zero
    const {u, v} = this.splitNonZero(a)
    if (v >= n) return this.zero
    return this.fractionUnsafe(this.valuationRing.div(this.num(u), this.integralFromVal(n - v)), this.den(u))
  }
}