import type { Field } from "../Field/Field"
import type { RingMultiplicativeMonoid } from '../Ring/RingMultiplicativeMonoid'
import { Group } from "./Group"

export class FieldMultiplicativeGroup<FieldElement> extends Group<FieldElement> implements RingMultiplicativeMonoid<FieldElement> {
  public get ring(): Field<FieldElement> {
    return this.field
  }
  
  public constructor(public field: Field<FieldElement>) {
    super()
  }

  public get identity() {
    return this.field.one
  }

  public equals(a: FieldElement, b: FieldElement) {
    return this.field.equals(a, b)
  }

  public isIdentity(a: FieldElement) {
    return this.field.isOne(a)
  }

  public multiply(a: FieldElement, b: FieldElement) {
    return this.field.multiply(a, b)
  }

  public invert(a: FieldElement): FieldElement {
    return this.field.invert(a)
  }
}