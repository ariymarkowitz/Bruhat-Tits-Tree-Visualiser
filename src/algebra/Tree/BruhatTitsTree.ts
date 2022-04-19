import { Adj, UnrootedTree } from './UnrootedTree';
import { cache } from "decorator-cache-getter"
import { Adic } from "../Adic/Adic"
import type { Rational } from "../Field/Rational"
import { EIntOrd, Infinite } from "../Order/ExtendedInt"
import { int, inverseMod, mod } from "../utils/int"
import { Seq } from "../utils/Seq"
import { DVVectorSpace } from "../VectorSpace/DVVectorSpace"
import type { Matrix } from "../VectorSpace/Matrix"
import { RationalField } from './../Field/Rational'
import type { Vec } from './../VectorSpace/VectorSpace'

type Generators = Matrix<Rational>

/**
 * The reduced form of a p-adic matrix of the form:
 * ```
 * | 1  0   |
 * | u  p^n |
 * ```
 * u is a finite p-adic expansion less than p^n,
 * ie. 0 <= u*p^m <= u*p^(m+n), where valuation(u) == m.
 **/
export interface Vertex {
  u: Rational,
  n: int
}

export class BruhatTitsTree extends UnrootedTree<Vertex, number> {
  public p: int
  public field: Adic
  public vspace: DVVectorSpace<Rational>

  public constructor(p: int) {
    super()
    this.p = p
    this.field = new Adic(p)
    this.vspace = new DVVectorSpace(2, this.field)
  }

  public neigbours(node: Vertex): Adj<Vertex, number>[] {
    let c = Seq.Range(0, this.p)
    .map(i => ({vertex: this.apply(node, i), edge: i}))
    .toArray()

    return [...c, {vertex: this.applyInf(node), edge: this.p}]
  }

  public reverseEdge(parent: Vertex, child: Vertex, edge: number): number {
    if (edge !== this.p) return this.p
    const F = this.field
    return F.divide(F.subtract(parent.u, child.u), F.fromVal(parent.n)).num
  }

  public equals(a: Vertex, b: Vertex): boolean {
    return RationalField.equals(a.u, b.u) && a.n === b.n
  }

  public path(a: Vertex, b: Vertex): Adj<Vertex, number>[] {
    const F = this.field

    let current = a.u
    const list: Adj<Vertex, number>[] = []
    const retreat = F.valuation(F.subtract(b.u, a.u))
    let currentVal = a.n
    while (EIntOrd.lt(retreat, currentVal) || currentVal > b.n) {
      currentVal -= 1
      current = F.modPow(current, currentVal)
      list.push({
        vertex: {u: current, n: currentVal},
        edge: this.p
      })
    }
    while (currentVal < b.n) {
      const next = F.modPow(b.u, currentVal + 1)
      const edge = F.divide(F.subtract(next, current), F.fromVal(currentVal)).num
      list.push({
        vertex: {u: next, n: currentVal + 1},
        edge
      })

      currentVal += 1
      current = next
    }
    return list
  }

  @cache
  public get origin(): Vertex {
    return {u: RationalField.zero, n: 0}
  }

  @cache
  public get infEnd(): Vec<Rational> {
    return [this.field.zero, this.field.one]
  }

  public apply(v: Vertex, n: int): Vertex {
    const F = this.field
    if (n === 0) return {u: v.u, n: v.n+1}
    return {
      u: F.add(v.u, F.multiply(F.fromInt(n), F.fromVal(v.n))),
      n: v.n+1
    }
  }

  public applyInf(v: Vertex): Vertex {
    const F = this.field
    return {
      u: F.modPow(v.u, v.n-1), n: v.n-1
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

  public gensToVertex(g: Generators): Vertex {
    const F = this.field
    const V = this.vspace
    const M = V.matrixAlgebra

    // We will denote m = [[a, c], [b, d]].
    let mat = M.clone(g)
    let v_a = F.valuation(mat[0][0])
    let v_b = F.valuation(mat[1][0])
    // Ensure v(a) <= v(b).
    if (EIntOrd.gt(v_a, F.valuation(mat[1][0]))) {
      mat = [mat[1], mat[0]]
      v_a = v_b
    }
    if (v_a === Infinite) throw new Error('Matrix is singular')
    // Normalise to [[1, c1], [0, d1]] = [[1, c/a], [0, p^v(d/a - bc/a^2)]].
    const c1 = F.divide(mat[0][1], mat[0][0])
    // v(d/a - bc/a^2) = v(d - bc/a) - v(a).
    const _n = F.valuation(F.subtract(mat[1][1], F.multiply(mat[1][0], c1)))
    if (_n === Infinite) throw new Error('Matrix is singular')
    const n = _n - v_a
    
    // Let c1 = a/b.
    // We need to convert to (ab^{-1}) mod p^n.
    const m = F.valuation(c1)
    // c1 = 0 mod p^n.
    if (!EIntOrd.lt(m, n)) return {u: F.zero, n}
    // Normalise c1 to c2 so that v(c2) = 0.
    let c2 = F.multiply(c1, F.fromVal(-m))
    let q = Math.pow(this.p, n - m)
    const uint = mod(c2.num * inverseMod(c2.den, q), q)
    const u = F.multiply(F.fromInt(uint), F.fromVal(m))
    return {u, n}
  }

  public action(m: Generators, v: Vertex) {
    const M = this.vspace.matrixAlgebra
    return this.gensToVertex(M.multiply(m, this.vertexToGens(v)))
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

  public vertexToString(v: Vertex): string {
    return `${v.u.num}/${v.u.den}_${v.n}`
  }

  public vertexToLatex(v: Vertex): string {
    const frac = v.u.den === 1 ? `${v.u.num}` : `\\dfrac{${v.u.num}}{${v.u.den}}`
    return `\\left[${frac}\\right]_{${v.n}}`
  }
}