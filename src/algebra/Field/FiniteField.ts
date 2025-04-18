import { Field } from './Field';
import { inverseMod, isPrime, mod } from '../utils/int';

/**
 * A class representing a finite field of order p, where p is a prime number.
 */

export class FiniteField extends Field<number>{
  public readonly zero = 0
  public readonly one = 1

  constructor(public p: number) {
    super()
    if (!Number.isInteger(p) || p <= 0) {
      throw new Error('p must be a positive integer')
    }
    if (!isPrime(p)) {
      throw new Error('p must be prime')
    }
  }

  public fromInt(n: number): number {
    return mod(n, this.p)
  }

  public add(a: number, b: number) {
    return (a + b) % this.p
  }

  public negate(a: number) {
    return (this.p - a) % this.p
  }

  public multiply(a: number, b: number) {
    return (a * b) % this.p
  }

  public divide(a: number, b: number) {
    return (a * this.invert(b)) % this.p
  }

  public unsafeInvert(a: number) {
    return inverseMod(a, this.p)
  }

  public isZero(a: number) {
    return a === 0
  }

  public isOne(a: number) {
    return a === 1
  }

  public toString(): string
  public toString(a: number): string
  public toString(a?: unknown): string {
    if (a === undefined) {
      return `FiniteField(${this.p})`
    } else {
      return String(a)
    }
  }
  public toLatex(a: number): string {
    return String(a)
  }
}