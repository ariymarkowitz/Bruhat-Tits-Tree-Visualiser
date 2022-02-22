// This is to allow polymorphism in Seq.Range without the type checker throwing a fit.
function* _internalRange(s1: number, s2?: number, s3?: number): Generator<number> {
  if (s2 === undefined) {
    yield* _range(0, s1, 1)
  } else if (s3 === undefined) {
      yield* _range(s1, s2, 1)
  } else {
    yield* _range(s1, s2, s3)
  }
}

function* _range(start: number, stop: number, step: number): Generator<number> {
  for (let i = start; i < stop; i += step) {
    yield i
  }
}

export function range(start: number): Generator<number>
export function range(start: number, stop: number): Generator<number>
export function range(start: number, stop: number, step: number): Generator<number>

export function* range(s1: number, s2?: number, s3?: number): Generator<number> {
  return _internalRange(s1, s2, s3)
}

export function* filter<T>(f: (x: T) => boolean, iter: Iterable<T>): Generator<T> {
  for (let x of iter) {
    if (f(x)) {
      yield x
    }
  }
}

export function* map<T, U>(f: (x: T) => U, iter: Iterable<T>): Generator<U> {
  for (let x of iter) {
    yield f(x)
  }
}

export function* mapIndexed<T, U>(f: (x: T, i: number) => U, iter: Iterable<T>): Generator<U> {
  let i = 0
  for (let x of iter) {
    yield f(x, i)
    i += 1
  }
}

export function reduce<T, U>(init: U, f: (total: U, value: T) => U, iter: Iterable<T>): U {
  let total = init
  for (let value of iter) {
    total = f(total, value)
  }
  return total
}

export function* zip<T, U>(iter1: Iterable<T>, iter2: Iterable<U>): Generator<[T, U]> {
  const i1 = iter1[Symbol.iterator]()
  const i2 = iter2[Symbol.iterator]()
  let a, b
  while (true) {
    a = i1.next()
    b = i2.next()
    if (a.done || b.done) {
      return
    } else {
      yield [a.value, b.value]
    }
  }
}

export class Seq<T> implements Iterable<T>{
  private iter: Iterable<T>

  public constructor(iter: Iterable<T>) {
    this.iter = iter
  }

  [Symbol.iterator](): Iterator<T, any, undefined> {
    return this.iter[Symbol.iterator]()
  }

  public static Range(start: number): Seq<number>
  public static Range(start: number, stop: number): Seq<number>
  public static Range(start: number, stop: number, step: number): Seq<number>

  public static Range(s1: number, s2?: number, s3?: number) {
    return new Seq(_internalRange(s1, s2, s3))
  }

  public filter(f: (x: T) => boolean): Seq<T> {
    return new Seq(filter(f, this.iter))
  }

  public map<U>(f: (item: T) => U): Seq<U> {
    return new Seq(map(f, this.iter))
  }

  public mapIndexed<U>(f: (item: T, index: number) => U): Seq<U> {
    return new Seq(mapIndexed(f, this.iter))
  }

  public reduce<U>(init: U, f: (total: U, item: T) => U): U {
    return reduce(init, f, this.iter)
  }

  public zip<U>(other: Iterable<U>): Seq<[T, U]> {
    return new Seq(zip(this.iter, other))
  }

  public toArray(): T[] {
    return [...this.iter]
  }
}