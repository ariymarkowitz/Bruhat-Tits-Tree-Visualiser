import RingAdditiveGroup from "../Ring/RingAdditiveGroup"
import FieldMultiplicativeGroup from "../Group/FieldMultiplicativeGroup"
import Ring from "../Ring/Ring"
import { int } from "../utils"
import { Rational } from "./Rational"

export default abstract class Field<FieldElement> extends Ring<FieldElement> {
  public abstract unsafeInvert(a: FieldElement): FieldElement

  public invert(a: FieldElement): FieldElement {
    if (this.isZero(a)) {
      throw new Error("Division by zero.")
    }
    return this.unsafeInvert(a)
  }

  public subtract(a: FieldElement, b: FieldElement) {
    return this.add(a, this.negate(b))
  }

  // Override this, not 'divide'!
  public unsafeDivide(a: FieldElement, b: FieldElement): FieldElement {
    return this.multiply(a, this.unsafeInvert(b))
  }

  public divide(a: FieldElement, b: FieldElement) {
    if (this.isZero(b)) {
      throw new Error("Division by zero.")
    }
    return this.unsafeDivide(a, b)
  }

  public nonZeroPow(a: FieldElement, n: int): FieldElement {
    return this.multiplicativeGroup.pow(a, n)
  }

  public pow(a: FieldElement, n: int): FieldElement {
    if (this.isZero(a)) {
      if (n === 0) {
        throw new Error("0 to the power of 0 is undefined.")
      } else {
        return this.zero
      }
    } else {
      return this.nonZeroPow(a, n)
    }
  }

  // There is a unique homomorphism of rings from the rationals to a field.
  public fromRational(r: Rational): FieldElement {
    return this.divide(this.fromInt(r.num), this.fromInt(r.den))
  }

  private _multiplicativeGroup: FieldMultiplicativeGroup<FieldElement>
  public get multiplicativeGroup(): FieldMultiplicativeGroup<FieldElement> {
    if (this._multiplicativeGroup === undefined) {
      this._multiplicativeGroup = new FieldMultiplicativeGroup(this)
    }
    return this._multiplicativeGroup
  }
}