import { Infinite } from './../utils';
import Ring from '../Ring/Ring';
import { extendedInt, int } from '../utils';
import Field from "./Field";

// A field with a discrete valuation.
export abstract class DVField<FieldElement> extends Field<FieldElement> {
  public abstract valuation(a: FieldElement): extendedInt
  public abstract uniformizer: FieldElement

  public inValuationRing(a: FieldElement): boolean {
    const v = this.valuation(a)
    return v === Infinite || v >= 0
  }
}