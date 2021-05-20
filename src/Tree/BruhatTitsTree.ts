import { Adic, AdicNumber } from "../Adic/Adic"
import { int } from "../utils"
import DVVectorSpace from "../VectorSpace/DVVectorSpace"
import { matrix } from "../VectorSpace/Matrix"
import { Tree } from "./Tree"
import { Range, Seq } from "immutable"

type generators = matrix<AdicNumber>

export default class BruhatTitsTree {
  public p: int
  public field: Adic
  public vspace: DVVectorSpace<AdicNumber>

  public constructor(p: int) {
    this.p = p
    this.field = new Adic(p)
    this.vspace = new DVVectorSpace(2, this.field)
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

  public make(depth: int, root: generators = this.vspace.matrixAlgebra.one) {
    type T = {parent: generators | null, lattice: generators, level: int}

    const F = this.field
    const V = this.vspace
    const M = V.matrixAlgebra

    return Tree.make(({parent, lattice, level}: T) => {
      let forest: T[]
      if (level < depth) {
        const latticeInfinite: generators = this.sublatticeInfinite(lattice)
        const latticeFinite = Range(0, this.p).map(i => this.sublatticeFinite(lattice, i))
        forest = Seq.Indexed
          .of(latticeInfinite)
          .concat(latticeFinite)
          .filterNot(sublattice => parent !== null && V.isSublattice(M.scale(F.uniformizer, parent), sublattice))
          .map(l => ({parent: lattice, lattice: l, level: level + 1}))
          .toArray()
      } else {
        forest = []
      }

      return {value: lattice, forest}

    }, {parent: null, lattice: root, level: 0})
  }
}