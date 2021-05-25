import { eInt } from './../Order/ExtendedInt';
import { extendedInt } from '../Order/ExtendedInt';
import Field from "./Field";

// A field with a discrete valuation.
export abstract class DVField<FieldElement> extends Field<FieldElement> {
  public abstract valuation(a: FieldElement): extendedInt
  public abstract uniformizer: FieldElement

  public inValuationRing(a: FieldElement): boolean {
    return eInt.gte(this.valuation(a), 0)
  }
}