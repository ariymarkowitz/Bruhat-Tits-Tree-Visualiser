import { type Adj, UnrootedTree } from './UnrootedTree'
import { EIntOrd, Infinite } from "../Order/ExtendedInt"
import { mod } from "../utils/int"
import { Seq } from "../utils/Seq"
import { DVVectorSpace } from "../VectorSpace/DVVectorSpace"
import type { Matrix } from "../VectorSpace/Matrix"
import type { Vec } from './../VectorSpace/VectorSpace'
import { Memoize } from 'fast-typescript-memoize'
import type { DVField } from '../Field/DVField'

/**
 * The reduced form of a p-adic matrix of the form:
 * ```
 * | 1  0   |
 * | u  p^n |
 * ```
 * u is a finite p-adic expansion less than p^n,
 * ie. 0 <= u\*p^m <= u\*p^(m+n), where valuation(u) == m.
 **/
export interface Vertex<FieldElt> {
  u: FieldElt,
  n: number
}

/**
 * The Bruhat-Tts tree over a discrete valued field.
 */
export class BruhatTtsTree<FieldElt, RingElt> extends UnrootedTree<Vertex<FieldElt>, number> {
  public vspace: DVVectorSpace<FieldElt, RingElt>

  public constructor(public field: DVField<FieldElt, RingElt>) {
    super()
    this.vspace = new DVVectorSpace(2, this.field)
  }

  public get p() {
    return this.field.residueFieldSize
  }

  public get integralRing() {
    return this.field.integralRing
  }

  public neighbors(node: Vertex<FieldElt>): Adj<Vertex<FieldElt>, number>[] {
    let c = Seq.Range(0, this.p)
    .map(i => ({vertex: this.apply(node, i), edge: i}))
    .toArray()

    return [...c, {vertex: this.applyInf(node), edge: this.p}]
  }

  public reverseEdge(parent: Vertex<FieldElt>, child: Vertex<FieldElt>, edge: number): number {
    if (edge !== this.p) return this.p
    const F = this.field
    return F.residue(F.num(F.divide(F.subtract(parent.u, child.u), F.fromVal(parent.n))))
  }

  public equals(a: Vertex<FieldElt>, b: Vertex<FieldElt>): boolean {
    return this.field.equals(a.u, b.u) && a.n === b.n
  }

  public path(a: Vertex<FieldElt>, b: Vertex<FieldElt>): Adj<Vertex<FieldElt>, number>[] {
    const F = this.field

    let current = a.u
    const list: Adj<Vertex<FieldElt>, number>[] = []
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
      const edge = F.residue(F.num(F.divide(F.subtract(next, current), F.fromVal(currentVal))))
      list.push({
        vertex: {u: next, n: currentVal + 1},
        edge
      })

      currentVal += 1
      current = next
    }
    return list
  }

  @Memoize()
  public get origin(): Vertex<FieldElt> {
    return {u: this.field.zero, n: 0}
  }

  @Memoize()
  public get infEnd(): Vec<FieldElt> {
    return [this.field.zero, this.field.one]
  }

  public apply(v: Vertex<FieldElt>, n: number): Vertex<FieldElt> {
    const F = this.field
    if (n === 0) return {u: v.u, n: v.n+1}
    return {
      u: F.add(v.u, F.multiply(F.fromResidue(n), F.fromVal(v.n))),
      n: v.n+1
    }
  }

  public applyInf(v: Vertex<FieldElt>): Vertex<FieldElt> {
    const F = this.field
    return {
      u: F.modPow(v.u, v.n-1), n: v.n-1
    }
  }

  public minVertexTranslationDistance(m: Matrix<FieldElt>): number {
    const F = this.field
    const M = this.vspace.matrixAlgebra
    const vTr = F.valuation(M.trace(m))
    const vDet = F.valuation(M.determinant(m))
    if (vDet === Infinite) throw new Error('Matrix is singular')
    if (vTr === Infinite) return mod(vDet, 2)
    const result = vDet - 2*vTr
    if (result >= 0) {
      return result
    } else {
      return mod(result, 2)
    }
  }

  public translationLength(m: Matrix<FieldElt>): number {
    const F = this.field
    const M = this.vspace.matrixAlgebra
    const vTr = F.valuation(M.trace(m))
    const vDet = F.valuation(M.determinant(m))
    if (vDet === Infinite) throw new Error('Matrix is singular')
    if (vTr === Infinite) return 0
    return Math.max(vDet - 2*vTr, 0)
  }

  public isReflection(m: Matrix<FieldElt>): boolean {
    const F = this.field
    const M = this.vspace.matrixAlgebra
    const vTr = F.valuation(M.trace(m))
    const vDet = F.valuation(M.determinant(m))
    if (vDet === Infinite) throw new Error('Matrix is singular')
    if (vTr === Infinite) return vDet % 2 !== 0
    return 2*vTr > vDet && vDet % 2 !== 0
  }

  public isIdentity(m: Matrix<FieldElt>): boolean {
    const F = this.field
    return F.isZero(m[0][1]) && F.isZero(m[1][0]) && F.equals(m[1][1], m[0][0])
  }

  // Check whether the end lies in the lattice.
  public inEnd(v: Vertex<FieldElt>, end: Vec<FieldElt>) {
    return this.vspace.inLattice(this.vertexToIntMat(v), this.toIntVector(end))
  }

  public inInfEnd(v: Vertex<FieldElt>) {
    return (this.field.isZero(v.u) && v.n <= 0)
  }

  public toIntVector(v: Vec<FieldElt>): Vec<FieldElt> {
    const a = EIntOrd.minAll(v.map(n => this.field.valuation(n)))
    if (a === Infinite) return v
    else return this.vspace.scale(v, this.field.fromVal(-a))
  }

  public toIntMatrix(m: Matrix<FieldElt>): Matrix<FieldElt> {
    const a = this.vspace.minValuation(m)
    if (a === Infinite) return m
    else return this.vspace.matrixAlgebra.scale(this.field.fromVal(-a), m)
  }

  public vertexToMat(v: Vertex<FieldElt>): Matrix<FieldElt> {
    return [[this.field.one, v.u], [this.field.zero, this.field.fromVal(v.n)]]
  }

  public vertexToIntMat(v: Vertex<FieldElt>): Matrix<FieldElt> {
    return this.toIntMatrix(this.vertexToMat(v))
  }

  public matToVertex(g: Matrix<FieldElt>): Vertex<FieldElt> {
    const F = this.field
    const R = this.integralRing
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
    
    if (F.isZero(c1)) return {u: F.zero, n}
    // Let c1 = a/b. We need to convert to (ab^{-1}) mod p^n.
    const {u: c2, v: m} = F.splitNonZero(c1)
    if (!EIntOrd.lt(m, n)) return {u: F.zero, n}
    let q = F.integralFromVal(n - m)
    const uint = R.mod(R.multiply(F.num(c2), R.inverseMod(F.den(c2), q)), q)
    const u = F.multiply(F.fromIntegral(uint), F.fromVal(m))
    return {u, n}
  }

  public action(m: Matrix<FieldElt>, v: Vertex<FieldElt>) {
    const M = this.vspace.matrixAlgebra
    return this.matToVertex(M.multiply(m, this.vertexToMat(v)))
  }

  public minTranslationVertexNearOrigin(m: Matrix<FieldElt>): Vertex<FieldElt>{
    // Return origin if possible for the sake of simplicity.
    // Also handles the case that `a` acts trivially.
    if (this.translationDistance(m, this.origin) == this.translationLength(m)) {
      return this.origin
    }
    const V = this.vspace
    const M = this.vspace.matrixAlgebra

    const vecs = [V.fromInts([1, 0]), V.fromInts([0, 1]), V.fromInts([1, 1])].filter(v => !M.isEigenvector(m, v))
    const verts = vecs.map(v => this.projToMinTranslation(m, v))
    const dists = verts.map(v => this.distanceToOrigin(this.vertexToMat(v)))
    const minIndex = verts.reduce((j, _, i) => dists[i] < dists[j] ? i : j, 0)
    return verts[minIndex]
  }

  public projToMinTranslation(m: Matrix<FieldElt>, v: Vec<FieldElt>): Vertex<FieldElt> {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const vtr = F.valuation(M.trace(m))
    const vdet = F.valuation(M.determinant(m))
    if (vdet === Infinite) throw new Error('Matrix is singular')

    const mu = EIntOrd.min(EIntOrd.mulInt(vtr, 2), Math.floor(vdet/2))
    const B = M.scale(F.fromVal(-mu), m)
    const vMat = [v, M.apply(B, v)]
    return this.matToVertex(vMat)
  }

  public getIntMatrix(m: Matrix<FieldElt>): Matrix<FieldElt> {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const minVal = this.vspace.minValuation(m)
    if (minVal === Infinite) throw new Error('Matrix is zero')

    return M.scale(F.fromVal(-minVal), m)
  }

  public distanceToOrigin(m: Matrix<FieldElt>): number {
    const F = this.field
    const M = this.vspace.matrixAlgebra

    const vDet = F.valuation(M.determinant(m))
    const minV = this.vspace.minValuation(m)
    if (vDet === Infinite || minV === Infinite) throw new Error('Matrix is singular')

    return -2 * minV + vDet
  }

  public translationDistance(a: Matrix<FieldElt>, v: Vertex<FieldElt>): number {
    const M = this.vspace.matrixAlgebra
    return this.distanceToOrigin(M.conjugate(a, this.vertexToMat(v)))
  }

  public lengthOfImage(a: Matrix<FieldElt>, v: Vertex<FieldElt>) {
    const M = this.vspace.matrixAlgebra
    return this.distanceToOrigin(M.multiply(a, this.vertexToMat(v)))
  }

  public isSameClass(a: Matrix<FieldElt>, b: Matrix<FieldElt>) {
    const V = this.vspace
    const M = this.vspace.matrixAlgebra
    return V.isTrivialLattice(this.toIntMatrix(M.multiply(M.invert(a), b)))
  }

  public isEqualVertex(a: Vertex<FieldElt>, b: Vertex<FieldElt>) {
    return this.field.equals(a.u, b.u) && a.n === b.n
  }

  public vertexIsOrigin(v: Vertex<FieldElt>) {
    return this.field.isZero(v.u) && v.n === 0
  }

  public toString(): string {
    return `BruhatTitsTree[${this.field.toString()}]`
  }

  public vertexToString(v: Vertex<FieldElt>): string {
    return `${this.field.toString(v.u)}_${v.n}`
  }

  public vertexToLatex(v: Vertex<FieldElt>): string {
    return `\\left[${this.field.toLatex(v.u)}\\right]_{${v.n}}`
  }
}