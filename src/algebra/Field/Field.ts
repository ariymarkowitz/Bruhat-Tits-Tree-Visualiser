import { Memoize } from 'fast-typescript-memoize'
import { FieldMultiplicativeGroup } from "../Group/FieldMultiplicativeGroup"
import { Ring } from "../Ring/Ring"
import type { Rational } from "./Rationals"

export abstract class Field<FieldElement> extends Ring<FieldElement> {
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

  // There is a unique homomorphism of rings from the rationals to a field.
  public fromRational(r: Rational): FieldElement {
    return this.divide(this.fromInt(r.num), this.fromInt(r.den))
  }

  public get multiplicativeMonoid() {
      return this.multiplicativeGroup
  }

  @Memoize() public get multiplicativeGroup(): FieldMultiplicativeGroup<FieldElement> {
    return new FieldMultiplicativeGroup(this)
  }
}