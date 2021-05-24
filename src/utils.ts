export function mod(a: number, b: number) {
  const result = a % b
  if (result < 0) return result + b
  else return result
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {var temp = a; a = b; b = temp;}
  while (true) {
      if (b == 0) return a;
      a %= b;
      if (a == 0) return b;
      b %= a;
  }
}

export function isPrime(num: number): boolean { // returns boolean
  if (num <= 1) return false; // negatives
  if (num % 2 == 0 && num > 2) return false; // even numbers
  const s = Math.sqrt(num); // store the square to loop faster
  for(let i = 3; i <= s; i += 2) { // start from 3, stop at the square, increment in twos
      if(num % i === 0) return false; // modulo shows a divisor was found
  }
  return true;
}

export type int = number

export function range(start: number): IterableIterator<number>
export function range(start: number, stop: number): IterableIterator<number>
export function range(start: number, stop: number, step: number): IterableIterator<number>

export function* range(s1: number, s2?: number, s3?: number): IterableIterator<number> {
  if (s2 === undefined) {
    yield* _range(0, s1, 1)
  } else if (s3 === undefined) {
      yield* _range(s1, s2, 1)
  } else {
    yield* _range(s1, s2, s3)
  }
}

function* _range(start: number, stop: number, step: number): IterableIterator<number> {
  for (let i = start; i < stop; i += step) {
    yield i
  }
}

export function* map<T, U>(f: (x: T) => U, iter: Iterable<T>): IterableIterator<U> {
  for (let x of iter) {
    yield f(x)
  }
}

export function reduce<T, U>(init: U, f: (total: U, value: T) => U, iter: Iterable<T>): U {
  let total = init
  for (let value of iter) {
    total = f(total, value)
  }
  return total
}

export function* zip<T, U>(iter1: Iterable<T>, iter2: Iterable<U>): IterableIterator<[T, U]> {
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

export function* filter<T>(iter: Iterable<T>, f: (x: T) => boolean): IterableIterator<T> {
  for (let x of iter) {
    if (f(x)) {
      yield x
    }
  }
}