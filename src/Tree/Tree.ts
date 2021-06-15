export interface Tree<T> {forest: Tree<T>[], value: T}

export function make<T, U>(f: (root: T) => {value: U, forest: T[]}, init: T): Tree<U> {
  const {value, forest} = f(init)
  return {value, forest: forest.map(node => make(f, node))}
}

export function map<T, U>(f: (root: T) => U, tree: Tree<T>): Tree<U> {
  return make((root) => ({value: f(root.value), forest: root.forest}), tree)
}

export function foreach<T>(f: (root: T) => T[], init: T): void {
  f(init).map(node => foreach(f, node))
}

export function* iter<T>(f: (root: T) => T[], init: T): Generator<T> {
  yield init
  for (let child of f(init)) {
    yield* iter(f, child)
  }
}