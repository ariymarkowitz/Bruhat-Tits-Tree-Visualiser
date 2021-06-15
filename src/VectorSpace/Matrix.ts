import { cache } from 'decorator-cache-getter'
import { Seq } from '../utils/Seq'
import { Field } from '../Field/Field'
import { Ring } from '../Ring/Ring'
import { int } from '../utils/int'
import { VectorSpace, Vec } from './VectorSpace'

export type Matrix<FieldElement> = FieldElement[][]

export class MatrixAlgebra<FieldElement> extends Ring<Matrix<FieldElement>> {
  private _dim: int
  public get dim(): int {return this._dim}

  private _vectorSpace: VectorSpace<FieldElement>
  public get vectorSpace(): VectorSpace<FieldElement> { return this._vectorSpace }

  public get field(): Field<FieldElement> { return this.vectorSpace.field }

  public constructor(vectorSpace: VectorSpace<FieldElement>, dim: int) {
    super()
    this._vectorSpace = vectorSpace
    this._dim = dim
  }

  @cache
  public get zero() {
    return this.fill(() => this.field.zero)
  }

  @cache
  public get one() {
    return this.fill((col, row) => row === col ? this.field.one : this.field.zero)
  }

  public map(m: Matrix<FieldElement>, f: (e: FieldElement, col: int, row: int) => FieldElement): Matrix<FieldElement> {
    return m.map((v, i) => v.map((e, j) => f(e, i, j)))
  }

  public fill(f: (col: int, row: int) => FieldElement): Matrix<FieldElement>{
    return Seq.Range(this.dim)
      .map(col => Seq.Range(this.dim)
        .map(row => f(row, col))
        .toArray())
      .toArray()
  }

  public column(i: int, m: Matrix<FieldElement>): Vec<FieldElement> {
    return m[i]
  }

  public row(i: int, m: Matrix<FieldElement>): Vec<FieldElement> {
    return m.map(v => v[i])
  }

  public replaceRow(m: Matrix<FieldElement>, index: int, newrow: FieldElement[]): Matrix<FieldElement> {
    return this.map(m, (e, i, j) => j === index ? newrow[i] : e)
  }

  public replaceColumn(m: Matrix<FieldElement>, index: int, newcol: FieldElement[]): Matrix<FieldElement> {
    return m.map((v, i) => (i === index) ? newcol : v)
  }

  public fromInts(ints: Matrix<int>): Matrix<FieldElement> {
    return ints.map(v => v.map(e => this.field.fromInt(e)))
  }

  public add(m1: Matrix<FieldElement>, m2: Matrix<FieldElement>): Matrix<FieldElement> {
    return m1.map((v, i) => v.map((e, j) => this.field.add(e, m2[i][j])))
  }

  public subtract(m1: Matrix<FieldElement>, m2: Matrix<FieldElement>): Matrix<FieldElement> {
    return m1.map((v, i) => v.map((e, j) => this.field.subtract(e, m2[i][j])))
  }

  public negate(m: Matrix<FieldElement>): Matrix<FieldElement> {
    return m.map(v => v.map(e => this.field.negate(e)))
  }

  public scale(n: FieldElement, m: Matrix<FieldElement>): Matrix<FieldElement> {
    return m.map(v => v.map(e => this.field.multiply(e, n)))
  }

  public innerProduct(v1: Vec<FieldElement>, v2: Vec<FieldElement>): FieldElement {
    return v1.reduce((s, e, i) => this.field.add(s, this.field.multiply(e, v2[i])), this.field.zero)
  }

  public apply(m1: Matrix<FieldElement>, m2: Vec<FieldElement>): Vec<FieldElement> {
    const F = this.field
    return Seq.Range(this.dim)
      .map(row => Seq.Range(this.dim)
        .reduce(F.zero, (sum, i) => F.add(sum, F.multiply(m1[i][row], m2[i])))
      ).toArray()
  }

  public multiply(m1: Matrix<FieldElement>, m2: Matrix<FieldElement>): Matrix<FieldElement> {
    const F = this.field
    return Seq.Range(this.dim)
      .map(col => Seq.Range(this.dim)
        .map(row => Seq.Range(this.dim)
          .reduce(F.zero, (sum, i) => F.add(sum, F.multiply(m1[i][row], m2[col][i])))
        ).toArray()
      ).toArray()
  }

  public trace(m: Matrix<FieldElement>): FieldElement {
    return m.reduce((sum, v, i) => this.field.add(sum, v[i]), this.field.zero)
  }

  public determinant(m: Matrix<FieldElement>): FieldElement {
    if (this.dim === 0) {
      return this.field.one
    } else if (this.dim === 1) {
      return m[0][0]
    } else if (this.dim === 2) {
      let F = this.field
      return F.subtract(F.multiply(m[0][0], m[1][1]), F.multiply(m[1][0], m[0][1]))
    } else {
      throw new Error('Matrices larger than 2x2 are not currently supported')
    }
  }

  public invert(m: Matrix<FieldElement>): Matrix<FieldElement> {
    let F = this.field
    if (F.isZero(this.determinant(m))) {
      throw new Error('Matrix is singular')
    }
    if (this.dim === 0) {
      return m
    } else if (this.dim === 1) {
      return [[F.invert(m[0][0])]]
    } else if (this.dim === 2) {
      return this.scale(
        F.invert(this.determinant(m)),
        [[m[1][1], F.negate(m[0][1])], [F.negate(m[1][0]), m[0][0]]]
      )
    } else {
      throw new Error('Matrices larger than 2x2 are not currently supported')
    }
  }

  public fromScalar(x: FieldElement): Matrix<FieldElement> {
    return this.fill((col, row) => row === col ? x : this.field.zero)
  }

  public fromInt(n: int): Matrix<FieldElement> {
    return this.fromScalar(this.field.one)
  }

  public isSingular(m: Matrix<FieldElement>): boolean {
    return this.field.isZero(this.determinant(m))
  }

  public clone(m: Matrix<FieldElement>): Matrix<FieldElement> {
    return m.map(v => [...v])
  }

  public conjugate(m: Matrix<FieldElement>, p: Matrix<FieldElement>): Matrix<FieldElement> {
    return this.multiply(this.multiply(this.invert(p), m), p)
  }

  public toString(): string {
    return `MatrixAlgebra(${this.dim}, ${this.field})`
  }
}