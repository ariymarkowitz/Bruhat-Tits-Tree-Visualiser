import type { DVField } from "../Field/DVField"
import { EIntOrd, type ExtendedInt } from "../Order/ExtendedInt"
import type { Matrix } from "./Matrix"
import { VectorSpace, type Vec } from "./VectorSpace"

export class DVVectorSpace<FieldElement, RingElement, Field extends DVField<FieldElement, RingElement> = DVField<FieldElement, RingElement>>
  extends VectorSpace<FieldElement, Field> {

  public constructor(dim: number, field: Field) {
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
    return this.matrixInValuationRing(m) && m.some(v => v.some(n => this.field.valuation(n) === 0))
  }

  public isTrivialLattice(m: Matrix<FieldElement>) {
    return this.inStandardTree(m) && this.field.valuation(this.matrixAlgebra.determinant(m)) === 0
  }
}