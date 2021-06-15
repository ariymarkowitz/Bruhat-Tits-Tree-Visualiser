import { Field } from "../Field/Field"
import { Group } from "./Group"

export class FieldMultiplicativeGroup<FieldElement> extends Group<FieldElement> {
  private _field: Field<FieldElement>
  public get field(): Field<FieldElement> {
    return this._field
  }

  public constructor(field: Field<FieldElement>) {
    super()
    this._field = field
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