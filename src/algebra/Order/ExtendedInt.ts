import { Order } from "./Order"

export const Infinite = Symbol('Infinite')
export type ExtendedInt = number | typeof Infinite

export class ExtendedIntOrd extends Order<ExtendedInt> {

  public lt(a: ExtendedInt, b: ExtendedInt): a is number {
    return (a !== Infinite) && (b === Infinite || a < b)
  }
  public lte(a: ExtendedInt, b: ExtendedInt): boolean {
    return (b === Infinite) || (a !== Infinite && a <= b)
  }
  public min(a: ExtendedInt, b: number): number
  public min(a: number, b: ExtendedInt): number
  public min(a: number, b: number): number
  public min(a: ExtendedInt, b: ExtendedInt): ExtendedInt
  public min(a: ExtendedInt, b: ExtendedInt) {
    if (a === Infinite) return b
    if (b === Infinite) return a
    return Math.min(a, b)
  }
  public max(a: ExtendedInt, b: ExtendedInt): ExtendedInt
  public max(a: number, b: number): number
  public max(a: ExtendedInt, b: ExtendedInt) {
    if (a === Infinite) return a
    if (b === Infinite) return b
    return Math.max(a, b)
  }
  public mulInt(a: ExtendedInt, b: number): ExtendedInt {
    if (a === Infinite) return a
    return a*b
  }
  public divInt(a: ExtendedInt, b: number): ExtendedInt {
    if (a === Infinite) return a
    return Math.floor(a/b)
  }
}

export const EIntOrd = new ExtendedIntOrd()