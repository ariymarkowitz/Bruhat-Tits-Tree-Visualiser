interface step<T> {
  value: T,
  stop: boolean
}

export interface Adj<V, E> {vertex: V, edge: E}

/**
 * Like a Tree, but the children contains all adjacent edges.
 * When iterating over recursively, the parent has to be kept track of to avoid backtracking.
 */
export abstract class UnrootedTree<V, E> {
  public abstract neigbours(node: V): Adj<V, E>[]
  public abstract reverseEdge(parent: V, child: V, edge: E): E
  public reverse(parent: V, child: Adj<V, E>): Adj<V, E> {
    return {vertex: parent, edge: this.reverseEdge(parent, child.vertex, child.edge)}
  }

  public abstract path(v1: V, v2: V): Adj<V, E>[]
  public reducePath<U>(f: (prev: U, vertex: V, current: Adj<V, E>, index: number) => U, v1: V, v2: V, init: U) {
    let accum = init
    let v = v1
    const path = this.path(v1, v2)
    for (let i=0; i < path.length; i++) {
      const adj = path[i]
      accum = f(accum, v, adj, i)
      v = adj.vertex
    }
    return accum
  }

  public equals(a: V, b : V): boolean {
    return a == b
  }

  public iter<U>(f: (state: U, current: V, update: Adj<V, E>) => step<U>, initState: U, initNode: V) {
    this.iter_helper(f, {value: initState, stop: false}, initNode, undefined)
  }

  protected iter_helper<U>(f: (state: U, current: V, update: Adj<V, E>) => step<U>, state: step<U>, node: V, parent: V | undefined) {
    if (state.stop) return
    for (let update of this.neigbours(node)) {
      if (parent === undefined || !this.equals(update.vertex, parent)) {
        this.iter_helper<U>(f, f(state.value, node, update), update.vertex, node)
      }
    }
  }

  public iterVertices(f: (vertex: V) => boolean, init: V) {
    this.iterVertices_helper(f, f(init), init, undefined)
  }

  protected iterVertices_helper(f: (vertex: V) => boolean, stop: boolean, node: V, parent: V | undefined) {
    if (stop) return
    for (let update of this.neigbours(node)) {
      if (parent === undefined || !this.equals(update.vertex, parent)) {
        this.iterVertices_helper(f, f(update.vertex), update.vertex, node)
      }
    }
  }
}