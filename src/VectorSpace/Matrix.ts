import { cache } from 'decorator-cache-getter'
import { range, Seq } from '../utils/Seq'
import Field from '../Field/Field'
import Ring from '../Ring/Ring'
import { int } from '../utils/utils'
import VectorSpace, { vec } from './VectorSpace'

export type matrix<FieldElement> = FieldElement[][]

export default class MatrixAlgebra<FieldElement> extends Ring<matrix<FieldElement>> {
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

  public map(m: matrix<FieldElement>, f: (e: FieldElement, col: int, row: int) => FieldElement): matrix<FieldElement> {
    return m.map((v, i) => v.map((e, j) => f(e, i, j)))
  }

  public fill(f: (col: int, row: int) => FieldElement): matrix<FieldElement>{
    return Seq.Range(this.dim)
      .map(col => Seq.Range(this.dim)
        .map(row => f(row, col))
        .toArray())
      .toArray()
  }

  public column(i: int, m: matrix<FieldElement>): FieldElement[] {
    return m[i]
  }

  public row(i: int, m: matrix<FieldElement>): FieldElement[] {
    return m.map(v => v[i])
  }

  public replaceRow(m: matrix<FieldElement>, index: int, newrow: FieldElement[]): matrix<FieldElement> {
    return this.map(m, (e, i, j) => j === index ? newrow[i] : e)
  }

  public replaceColumn(m: matrix<FieldElement>, index: int, newcol: FieldElement[]): matrix<FieldElement> {
    return m.map((v, i) => (i === index) ? newcol : v)
  }

  public fromInts(ints: matrix<int>): matrix<FieldElement> {
    return ints.map(v => v.map(e => this.field.fromInt(e)))
  }

  public add(m1: matrix<FieldElement>, m2: matrix<FieldElement>): matrix<FieldElement> {
    return m1.map((v, i) => v.map((e, j) => this.field.add(e, m2[i][j])))
  }

  public subtract(m1: matrix<FieldElement>, m2: matrix<FieldElement>): matrix<FieldElement> {
    return m1.map((v, i) => v.map((e, j) => this.field.subtract(e, m2[i][j])))
  }

  public negate(m: matrix<FieldElement>): matrix<FieldElement> {
    return m.map(v => v.map(e => this.field.negate(e)))
  }

  public scale(n: FieldElement, m: matrix<FieldElement>): matrix<FieldElement> {
    return m.map(v => v.map(e => this.field.multiply(e, n)))
  }

  public innerProduct(v1: FieldElement[], v2: FieldElement[]): FieldElement {
    return v1.reduce((s, e, i) => this.field.add(s, this.field.multiply(e, v2[i])), this.field.zero)
  }

  public apply(m1: matrix<FieldElement>, m2: vec<FieldElement>): vec<FieldElement> {
    const F = this.field
    return Seq.Range(this.dim)
      .map(row => Seq.Range(this.dim)
        .reduce(F.zero, (sum, i) => F.add(sum, F.multiply(m1[i][row], m2[i])))
      ).toArray()
  }

  public multiply(m1: matrix<FieldElement>, m2: matrix<FieldElement>): matrix<FieldElement> {
    const F = this.field
    return Seq.Range(this.dim)
      .map(col => Seq.Range(this.dim)
        .map(row => Seq.Range(this.dim)
          .reduce(F.zero, (sum, i) => F.add(sum, F.multiply(m1[i][row], m2[col][i])))
        ).toArray()
      ).toArray()
  }

  public trace(m: matrix<FieldElement>): FieldElement {
    return m.reduce((sum, v, i) => this.field.add(sum, v[i]), this.field.zero)
  }

  public determinant(m: matrix<FieldElement>): FieldElement {
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

  public invert(m: matrix<FieldElement>): matrix<FieldElement> {
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

  public fromScalar(x: FieldElement): matrix<FieldElement> {
    return this.fill((col, row) => row === col ? x : this.field.zero)
  }

  public fromInt(n: int): matrix<FieldElement> {
    return this.fromScalar(this.field.one)
  }

  public isSingular(m: matrix<FieldElement>): boolean {
    return this.field.isZero(this.determinant(m))
  }

  public clone(m: matrix<FieldElement>): matrix<FieldElement> {
    return m.map(v => [...v])
  }

  public conjugate(m: matrix<FieldElement>, p: matrix<FieldElement>): matrix<FieldElement> {
    return this.multiply(this.multiply(this.invert(p), m), p)
  }

  public toString(): string {
    return `MatrixAlgebra(${this.dim}, ${this.field})`
  }
}