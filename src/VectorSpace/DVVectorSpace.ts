import { DVField } from "../Field/DVField"
import { int } from "../utils/utils"
import { Matrix } from "./Matrix"
import { VectorSpace, Vec } from "./VectorSpace"

export class DVVectorSpace<FieldElement> extends VectorSpace<FieldElement> {

  private _dvfield: DVField<FieldElement>
  public get field(): DVField<FieldElement> { return this._dvfield }

  public constructor(dim: int, field: DVField<FieldElement>) {
    super(dim, field)
    this._dvfield = field
  }

  public vectorInValuationRing(v: Vec<FieldElement>): boolean {
    return v.every(e => this.field.inValuationRing(e))
  }

  public matrixInValuationRing(m: Matrix<FieldElement>): boolean {
    return m.every(v => this.vectorInValuationRing(v))
  }

  public inLattice(gens: Matrix<FieldElement>, v: Vec<FieldElement>) {
    const M = this.matrixAlgebra
    return this.vectorInValuationRing(M.apply(M.invert(gens), v))
  }

  public isSublattice(gens: Matrix<FieldElement>, subgens: Matrix<FieldElement>) {
    const M = this.matrixAlgebra
    return this.matrixInValuationRing(M.multiply(M.invert(gens), subgens))
  }
}