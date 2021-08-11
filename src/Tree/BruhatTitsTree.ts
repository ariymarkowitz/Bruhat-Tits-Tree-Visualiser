import { RationalField } from './../Field/Rational';
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

type Generators = Matrix<Rational>

/**
 * The reduced form of a p-adic matrix.
 * | 1  0   |
 * | u  p^n |
 * u is a finite p-adic expansion less than p^n.
 **/
export interface Vertex {
  u: Rational,
  n: int
}

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

  private children(vertex: Vertex) {
    const F = this.field

    let c: Vertex[] = Seq.Range(1, this.p)
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

  public apply(v: Vertex, n: int): Vertex {
    const F = this.field
    if (n === 0) return {u: v.u, n: v.n+1}
    return {
      u: F.add(v.u, F.multiply(F.fromInt(n), F.fromVal(v.n))),
      n: v.n+1
    }
  }

  public applyInf(v: Vertex, n: int): Vertex {
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
  public inEnd(v: Vertex, end: Vec<Rational>) {
    return this.vspace.inLattice(this.vertexToIntGens(v), this.toIntVector(end))
  }

  public inInfEnd(v: Vertex) {
    return (this.field.isZero(v.u) && v.n <= 0)
  }

  public toIntVector(v: Vec<Rational>): Vec<Rational> {
    const a = EIntOrd.minAll(v.map(n => this.field.valuation(n)))
    if (a === Infinite) return v
    else return this.vspace.scale(v, this.field.fromVal(-a))
  }

  public toIntMatrix(m: Generators): Generators {
    const a = this.vspace.minValuation(m)
    if (a === Infinite) return m
    else return this.vspace.matrixAlgebra.scale(this.field.fromVal(-a), m)
  }

  public vertexToGens(v: Vertex): Generators {
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
  }

  public vertexToIntGens(v: Vertex): Generators {
    return this.toIntMatrix(this.vertexToGens(v))
  }

  // Broken :(
  // modPow works using the usual Euclidean function on the integers,
  // so it does not correctly reduce rationals.
  // Fixing it seems nontrivial.
  public _gensToVertex(g: Generators): Vertex {
    const F = this.field
    const V = this.vspace

    let m = this.vspace.matrixAlgebra.clone(g)
    // Guarantees that m[1][0]/m[0][0] is in Zp.
    if (EIntOrd.gt(F.valuation(m[0][0]), F.valuation(m[1][0]))) {
      m = [m[1], m[0]]
    }
    const _n = F.valuation(F.subtract(m[1][1], F.multiply(m[0][1], F.divide(m[1][0], m[0][0]))))
    if (_n === Infinite) throw new Error('Matrix is singular')
    // Would have already failed if m[0][0] is 0.
    const n = _n - (F.valuation(m[0][0]) as int)
    
    const u = F.modPow(F.divide(m[0][1], m[0][0]), n)
    return {u, n}
  }

  public getIntMatrix(m: Generators): Generators {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const minVal = this.vspace.minValuation(m)
    if (minVal === Infinite) throw new Error('Matrix is zero')

    return M.scale(F.fromVal(-minVal), m)
  }

  public distanceToRoot(m: Generators): int {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const vDet = F.valuation(M.determinant(m))
    const minV = this.vspace.minValuation(m)
    if (vDet === Infinite || minV === Infinite) throw new Error('Matrix is zero')

    return -2 * minV + vDet
  }

  public translationDistance(a: Generators, v: Vertex): int {
    const M = this.vspace.matrixAlgebra
    return this.distanceToRoot(M.conjugate(a, this.vertexToGens(v)))
  }

  public lengthOfImage(a: Generators, v: Vertex) {
    const M = this.vspace.matrixAlgebra
    return this.distanceToRoot(M.multiply(a, this.vertexToGens(v)))
  }

  public isSameClass(a: Generators, b: Generators) {
    const V = this.vspace
    const M = this.vspace.matrixAlgebra
    return V.isTrivialLattice(this.toIntMatrix(M.multiply(M.invert(a), b)))
  }

  public isEqualVertex(a: Vertex, b: Vertex) {
    return RationalField.equals(a.u, b.u) && a.n === b.n
  }

  public vertexIsRoot(v: Vertex) {
    return this.field.isZero(v.u) && v.n === 0
  }

  public make(depth: int, root: Vertex = {u: this.field.zero, n: 0}) {
    return Tree.make(({v, length}) => {
      return {
        value: v,
        forest: length < depth ? this.children(v).map(v => ({v, length: length + 1})) : []
      }
    }, {v: root, length: 0})
  }
}