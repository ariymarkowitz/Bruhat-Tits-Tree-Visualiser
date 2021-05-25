import { Adic, AdicNumber } from "../Adic/Adic"
import { int } from "../utils"
import DVVectorSpace from "../VectorSpace/DVVectorSpace"
import { matrix } from "../VectorSpace/Matrix"
import { Tree } from "./Tree"
import { Range } from "immutable"
import { cache } from "decorator-cache-getter"
import { eInt, extendedInt, Infinite } from "../Order/ExtendedInt"

type generators = matrix<AdicNumber>

/**
 * The reduced form of a p-adic matrix.
 * | 1  0   |
 * | u  p^n |
 * u is a finite p-adic expansion less than p^n.
 **/
export type vertex = {u: AdicNumber, n: int}

export default class BruhatTitsTree {
  public p: int
  public field: Adic
  public vspace: DVVectorSpace<AdicNumber>

  public constructor(p: int) {
    this.p = p
    this.field = new Adic(p)
    this.vspace = new DVVectorSpace(2, this.field)
  }

  @cache
  public get infEnd(): [AdicNumber, AdicNumber] {
    return [this.field.zero, this.field.one]
  }

  private children(vertex: vertex) {
    const F = this.field

    let c: vertex[] = [...Range(1, this.p).map(i => this.apply(vertex, i))]

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

  public minTranslationDistance(m: matrix<AdicNumber>): int {
    const M = this.vspace.matrixAlgebra
    const F = this.field

    const vDet = F.valuation(M.determinant(m))
    if (vDet === Infinite) throw new Error('Matrix is singular')

    const a = eInt.min(
      F.valuation(M.trace(m)),
      Math.floor(vDet/2)
    )
    return -2*a + vDet
  }

  // Check whether the end lies in the lattice.
  public inEnd(v: vertex, end: [AdicNumber, AdicNumber]) {
    const F = this.field
    // Check the special case of (1, 0).
    // This can be more nicely done in terms of integer-reduced lattices without the spacial cases,
    // But this works fine and is probably more efficient.
    if (F.isZero(end[0])) return F.isZero(v.u) && v.n <= 0
    const reducedEnd = F.divide(end[1], end[0])
    // Do the coefficients of the vertex agree with the end?
    const val = F.valuation(F.subtract(reducedEnd, v.u))
    return eInt.gte(val, v.n)
  }

  public inInfEnd(v: vertex) {
    return (this.field.isZero(v.u) && v.n <= 0)
  }

  public vertexToGens(v: vertex): generators{
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
  }

  public minValuation(m: generators): extendedInt {
    return eInt.minAll(m.flat(1).map(e => this.field.valuation(e)))
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

  public make(depth: int, root: vertex = {u: this.field.zero, n: 0}) {
    return Tree.make(({v, length}) => {
      return {
        value: v,
        forest: length < depth ? this.children(v).map(v => ({v, length: length + 1})) : []
      }
    }, {v: root, length: 0})
  }
}