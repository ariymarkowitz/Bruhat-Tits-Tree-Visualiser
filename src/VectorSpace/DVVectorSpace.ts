import { DVField } from "../Field/DVField"
import { int } from "../utils/utils"
import { Matrix } from "./Matrix"
import { VectorSpace, Vec } from "./VectorSpace"

export class DVVectorSpace<FieldElement, Field extends DVField<FieldElement> = DVField<FieldElement>>
  extends VectorSpace<FieldElement, Field> {

  public constructor(dim: int, field: Field) {
    super(dim, field)
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