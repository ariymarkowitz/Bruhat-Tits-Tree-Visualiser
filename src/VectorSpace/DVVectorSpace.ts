import { DVField } from "../Field/DVField"
import { EIntOrd, ExtendedInt } from "../Order/ExtendedInt"
import { int } from "../utils/int"
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

  public isSameLattice(a: Matrix<FieldElement>, b: Matrix<FieldElement>) {
    const M = this.matrixAlgebra
    return this.isTrivialLattice(M.multiply(M.invert(a), b))
  }

  public minValuation(m: Matrix<FieldElement>): ExtendedInt {
    return EIntOrd.minAll(m.flat(1).map(e => this.field.valuation(e)))
  }

  public inStandardTree(m: Matrix<FieldElement>) {
    return this.matrixInValuationRing(m) && m.some(v => v.some(n => this.field.isIntegerUnit(n)))
  }

  public isTrivialLattice(m: Matrix<FieldElement>) {
    return this.inStandardTree(m) && this.field.valuation(this.matrixAlgebra.determinant(m)) === 0
  }
}