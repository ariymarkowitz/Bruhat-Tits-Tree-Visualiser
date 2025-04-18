/**
 * The integers as a ring.
 */

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
    const quotient = Math.floor(a / b)
    const remainder = a - quotient * b
    return [quotient, remainder]
  }
  
  public div(a: number, b: number): number {
    return Math.floor(a / b)
  }

  public mod(a: number, b: number): number {
    return a % b
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