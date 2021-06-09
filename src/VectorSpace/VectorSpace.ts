import { cache } from "decorator-cache-getter"
import Field from "../Field/Field"
import { int } from "../utils"
import MatrixAlgebra, { matrix } from "./Matrix"

export type vec<FieldElement> = FieldElement[]

export default class Vectorspace<FieldElement> {
  private _dim: int
  public get dim(): int { return this._dim }

  private _field: Field<FieldElement>
  public get field(): Field<FieldElement> { return this._field }

  public constructor(dim: int, field: Field<FieldElement>) {
    this._field = field
    this._dim = dim
  }

  public fromInts(ints: int[]): FieldElement[] {
    return ints.map(e => this.field.fromInt(e))
  }

  public add(v1: FieldElement[], v2: FieldElement[]): FieldElement[] {
    return v1.map((v, i) => this.field.add(v, v2[i]))
  }

  public subtract(v1: FieldElement[], v2: FieldElement[]): FieldElement[] {
    return v1.map((v, i) => this.field.subtract(v, v2[i]))
  }

  public negate(v: FieldElement[]): FieldElement[] {
    return v.map(e => this.field.negate(e))
  }

  public scale(v: FieldElement[], n: FieldElement): FieldElement[] {
    return v.map(e => this.field.multiply(e, n)) 
  }

  @cache
  public get matrixAlgebra(): MatrixAlgebra<FieldElement> {
    return new MatrixAlgebra(this, this.dim)
  }

  public toString(): string {
    return `Vec(${this.dim}, ${this.field})`
  }
}