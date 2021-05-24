import { Adic, AdicNumber } from "../Adic/Adic"
import { int } from "../utils"
import DVVectorSpace from "../VectorSpace/DVVectorSpace"
import { matrix } from "../VectorSpace/Matrix"
import { Tree } from "./Tree"
import { Range } from "immutable"
import { cache } from "decorator-cache-getter"
import { eIntOrd } from "../Order/ExtendedInt"

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
    return eIntOrd.gte(val, v.n)
  }

  public inInfEnd(v: vertex) {
    return (this.field.isZero(v.u) && v.n <= 0)
  }

  public vertexToGens(v: vertex): generators{
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
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