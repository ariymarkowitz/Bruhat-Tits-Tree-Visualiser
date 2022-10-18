import { cache } from "decorator-cache-getter"
import type { Field as FieldType } from "../Field/Field"
import type { int } from "../utils/int"
import { MatrixAlgebra } from "./Matrix"

export type Vec<FieldElement> = FieldElement[]

export class VectorSpace<FieldElement, Field extends FieldType<FieldElement> = FieldType<FieldElement>> {
  private _dim: int
  public get dim(): int { return this._dim }

  private _field: Field
  public get field(): Field { return this._field }

  public constructor(dim: int, field: Field) {
    this._field = field
    this._dim = dim
  }

  public fromInts(ints: Vec<int>): Vec<FieldElement> {
    return ints.map(e => this.field.fromInt(e))
  }

  public add(v1: Vec<FieldElement>, v2: Vec<FieldElement>): Vec<FieldElement> {
    return v1.map((v, i) => this.field.add(v, v2[i]))
  }

  public subtract(v1: Vec<FieldElement>, v2: Vec<FieldElement>): Vec<FieldElement> {
    return v1.map((v, i) => this.field.subtract(v, v2[i]))
  }

  public negate(v: Vec<FieldElement>): Vec<FieldElement> {
    return v.map(e => this.field.negate(e))
  }

  public scale(v: Vec<FieldElement>, n: FieldElement): Vec<FieldElement> {
    return v.map(e => this.field.multiply(e, n)) 
  }

  public isZero(v: Vec<FieldElement>) {
    return v.every(e => this.field.isZero(e))
  }

  @cache
  public get matrixAlgebra(): MatrixAlgebra<FieldElement> {
    return new MatrixAlgebra(this, this.dim)
  }

  public toString(): string {
    return `Vec(${this.dim}, ${this.field})`
  }
}