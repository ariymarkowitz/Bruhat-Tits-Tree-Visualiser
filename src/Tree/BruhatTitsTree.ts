import { Vec } from './../VectorSpace/VectorSpace';
import { cache } from "decorator-cache-getter"
import { Adic } from "../Adic/Adic"
import { EIntOrd, ExtendedInt, Infinite } from "../Order/ExtendedInt"
import { Seq } from "../utils/Seq"
import { int } from "../utils/int"
import { DVVectorSpace } from "../VectorSpace/DVVectorSpace"
import { Matrix } from "../VectorSpace/Matrix"
import * as Tree from "./Tree"
import { Rational } from "../Field/Rational"

type generators = Matrix<Rational>

/**
 * The reduced form of a p-adic matrix.
 * | 1  0   |
 * | u  p^n |
 * u is a finite p-adic expansion less than p^n.
 **/
export type vertex = {u: Rational, n: int}

export class BruhatTitsTree {
  public p: int
  public field: Adic
  public vspace: DVVectorSpace<Rational>

  public constructor(p: int) {
    this.p = p
    this.field = new Adic(p)
    this.vspace = new DVVectorSpace(2, this.field)
  }

  @cache
  public get infEnd(): Vec<Rational> {
    return [this.field.zero, this.field.one]
  }

  private children(vertex: vertex) {
    const F = this.field

    let c: vertex[] = Seq.Range(1, this.p)
      .map(i => this.apply(vertex, i))
      .toArray()

    if (F.isZero(vertex.u) && vertex.n <= 0) {
      c = [...c, {u: vertex.u, n: vertex.n-1}]
    }
    if (!F.isZero(vertex.u) || vertex.n >= 0) {
      c = [this.apply(vertex, 0), ...c]
    }

    return c
  }

  public apply(v: vertex, n: int): vertex {
    const F = this.field
    if (n === 0) return {u: v.u, n: v.n+1}
    return {
      u: F.add(v.u, F.multiply(F.fromInt(n), F.fromVal(v.n))),
      n: v.n+1
    }
  }

  public applyInf(v: vertex, n: int): vertex {
    const F = this.field
    return {
      u: F.modPow(v.u, n-1), n: v.n-1
    }
  }

  public minTranslationDistance(m: Matrix<Rational>): int {
    const M = this.vspace.matrixAlgebra
    const F = this.field

    const vDet = F.valuation(M.determinant(m))
    if (vDet === Infinite) throw new Error('Matrix is singular')

    const a = EIntOrd.min(
      F.valuation(M.trace(m)),
      Math.floor(vDet/2)
    )
    return -2*a + vDet
  }

  // Check whether the end lies in the lattice.
  public inEnd(v: vertex, end: Vec<Rational>) {
    return this.vspace.inLattice(this.vertexToIntGens(v), this.toIntVector(end))
  }

  public inInfEnd(v: vertex) {
    return (this.field.isZero(v.u) && v.n <= 0)
  }

  public toIntVector(v: Vec<Rational>): Vec<Rational> {
    const a = EIntOrd.minAll(v.map(n => this.field.valuation(n)))
    if (a === Infinite) return v
    else return this.vspace.scale(v, this.field.fromVal(-a))
  }

  public toIntMatrix(m: generators): generators {
    const a = this.minValuation(m)
    if (a === Infinite) return m
    else return this.vspace.matrixAlgebra.scale(this.field.fromVal(-a), m)
  }

  public vertexToGens(v: vertex): generators {
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
  }

  public vertexToIntGens(v: vertex): generators {
    return this.toIntMatrix(this.vertexToGens(v))
  }

  public minValuation(m: generators): ExtendedInt {
    return EIntOrd.minAll(m.flat(1).map(e => this.field.valuation(e)))
  }

  public getIntMatrix(m: generators): generators {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const minVal = this.minValuation(m)
    if (minVal === Infinite) throw new Error('Matrix is zero')

    return M.scale(F.fromVal(-minVal), m)
  }

  public distanceToRoot(m: generators): int {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const vDet = F.valuation(M.determinant(m))
    const minV = this.minValuation(m)
    if (vDet === Infinite || minV === Infinite) throw new Error('Matrix is zero')

    return -2 * minV + vDet
  }

  public translationDistance(a: generators, v: vertex): int {
    const M = this.vspace.matrixAlgebra
    return this.distanceToRoot(M.conjugate(a, this.vertexToGens(v)))
  }

  public lengthOfImage(a: generators, v: vertex) {
    const M = this.vspace.matrixAlgebra
    return this.distanceToRoot(M.multiply(a, this.vertexToGens(v)))
  }

  public make(depth: int, root: vertex = {u: this.field.zero, n: 0}) {
    return Tree.make(({v, length}) => {
      return {
        value: v,
        forest: length < depth ? this.children(v).map(v => ({v, length: length + 1})) : []
      }
    }, {v: root, length: 0})
  }
}