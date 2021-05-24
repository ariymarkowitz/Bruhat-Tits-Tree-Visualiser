import { Adic, AdicNumber } from "../Adic/Adic"
import { int } from "../utils"
import DVVectorSpace from "../VectorSpace/DVVectorSpace"
import { matrix } from "../VectorSpace/Matrix"
import { Tree } from "./Tree"
import { Range, Seq } from "immutable"

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

  private children(vertex: vertex) {
    const F = this.field

    let c: vertex[] = [...Range(1, this.p).map(i => ({
      u: F.add(vertex.u, F.multiply(F.fromInt(i), F.fromVal(vertex.n))), n: vertex.n+1
    }))]

    if (F.isZero(vertex.u) && vertex.n <= 0) {
      c = [...c, {u: vertex.u, n: vertex.n-1}]
    }
    if (!F.isZero(vertex.u) || vertex.n >= 0) {
      c = [{u: vertex.u, n: vertex.n+1}, ...c]
    }

    return c
  }

  public vertexToGens(v: vertex): generators{
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
  }

  private sublatticeInfinite(lattice: generators): generators {
    return [lattice[0], this.vspace.scale(lattice[1], this.field.uniformizer)]
  }

  private sublatticeFinite(lattice: generators, a: int): generators {
    const F = this.field
    const V = this.vspace

    return [
      V.scale(lattice[0], F.uniformizer),
      V.add(V.scale(lattice[0], F.fromInt(a)), lattice[1])
    ]
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