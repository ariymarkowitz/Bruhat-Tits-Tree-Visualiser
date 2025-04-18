/**
 * The integers as a ring.
 */

import { mod } from '../utils/int'
import { EuclideanDomain } from './EuclideanDomain'

export class IntegerRing extends EuclideanDomain<number> {
  public zero = 0
  public one = 1

  public fromInt(n: number): number {
    return n
  }
  
  public add(a: number, b: number): number {
    return a + b
  }

  public subtract(a: number, b: number): number {
    return a - b
  }
  
  public negate(a: number): number {
    return -a
  }
  
  public multiply(a: number, b: number): number {
    return a * b
  }

  public edNorm(a: number): number {
    return Math.abs(a)
  }
  
  public divmod(a: number, b: number): [number, number] {
    // Integer division and remainder
    // a = b * q + r
    // where 0 <= r < |b|
    const r = mod(a, b)
    const q = (a - r) / b
    return [q, r]
  }
  
  public div(a: number, b: number): number {
    return b > 0 ? Math.floor(a / b) : Math.ceil(a / b)
  }

  public mod(a: number, b: number): number {
    return mod(a, b)
  }

  public toString(): string;
  public toString(a: number): string
  public toString(a?: number): string {
    if (a === undefined) {
      return 'Z'
    }
    return String(a)
  }
  public toLatex(a: number): string {
    return String(a)
  }
}

export const Integers = new IntegerRing()