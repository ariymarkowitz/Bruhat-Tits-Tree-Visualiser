import { EIntOrd, ExtendedInt } from '../Order/ExtendedInt'
import { Field } from "./Field"

// A field with a discrete valuation.
export abstract class DVField<FieldElement> extends Field<FieldElement> {
  public abstract valuation(a: FieldElement): ExtendedInt
  public abstract uniformizer: FieldElement

  public inValuationRing(a: FieldElement): boolean {
    return EIntOrd.gte(this.valuation(a), 0)
  }

  public isIntegerUnit(a: FieldElement): boolean {
    return this.valuation(a) === 0
  }
}