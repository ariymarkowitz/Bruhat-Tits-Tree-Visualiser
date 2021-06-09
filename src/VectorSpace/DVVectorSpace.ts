import { DVField } from "../Field/DVField"
import { int } from "../utils"
import { matrix } from "./Matrix"
import VectorSpace, { vec } from "./VectorSpace"

export default class DVVectorspace<FieldElement> extends VectorSpace<FieldElement> {

  private _dvfield: DVField<FieldElement>
  public get field(): DVField<FieldElement> { return this._dvfield }

  public constructor(dim: int, field: DVField<FieldElement>) {
    super(dim, field)
    this._dvfield = field
  }

  public vectorInValuationRing(v: vec<FieldElement>): boolean {
    return v.every(e => this.field.inValuationRing(e))
  }

  public matrixInValuationRing(m: matrix<FieldElement>): boolean {
    return m.every(v => this.vectorInValuationRing(v))
  }

  public inLattice(gens: matrix<FieldElement>, v: vec<FieldElement>) {
    const M = this.matrixAlgebra
    return this.vectorInValuationRing(M.apply(M.invert(gens), v))
  }

  public isSublattice(gens: matrix<FieldElement>, subgens: matrix<FieldElement>) {
    const M = this.matrixAlgebra
    return this.matrixInValuationRing(M.multiply(M.invert(gens), subgens))
  }
}