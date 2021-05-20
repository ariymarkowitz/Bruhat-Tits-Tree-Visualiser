export type tree<T> = {forest: tree<T>[], value: T}

export namespace Tree {
  export function make<T, U>(f: (root: T) => {value: U, forest: T[]}, init: T): tree<U> {
    const {value, forest} = f(init)
    return {value, forest: forest.map(node => make(f, node))}
  }

  export function map<T, U>(f: (root: T) => U, tree: tree<T>): tree<U> {
    return make((root) => ({value: f(root.value), forest: root.forest}), tree)
  }

  export function foreach<T>(f: (root: T) => T[], init: T): void {
    f(init).map(node => foreach(f, node))
  }

  export function* seq<T>(f: (root: T) => T[], init: T): Generator<T> {
    yield init
    for (let child of f(init)) {
      yield* seq(f, child)
    }
  }
}