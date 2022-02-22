import type { int } from "../utils/int"
import { Order } from "./Order"

export const Infinite = Symbol('Infinite')
export type ExtendedInt = int | typeof Infinite

export class ExtendedIntOrd extends Order<ExtendedInt> {

  public lt(a: ExtendedInt, b: ExtendedInt): a is int {
    return (a !== Infinite) && (b === Infinite || a < b)
  }
  public lte(a: ExtendedInt, b: ExtendedInt): boolean {
    return (b === Infinite) || (a !== Infinite && a <= b)
  }
  public min(a: ExtendedInt, b: int): int
  public min(a: int, b: ExtendedInt): int
  public min(a: int, b: int): int
  public min(a: ExtendedInt, b: ExtendedInt): ExtendedInt
  public min(a: ExtendedInt, b: ExtendedInt) {
    if (a === Infinite) return b
    if (b === Infinite) return a
    return Math.min(a, b)
  }
  public max(a: ExtendedInt, b: ExtendedInt): ExtendedInt
  public max(a: int, b: int): int
  public max(a: ExtendedInt, b: ExtendedInt) {
    if (a === Infinite) return a
    if (b === Infinite) return b
    return Math.min(a, b)
  }
  public mulInt(a: ExtendedInt, b: int): ExtendedInt {
    if (a === Infinite) return a
    return a*b
  }
  public divInt(a: ExtendedInt, b: int): ExtendedInt {
    if (a === Infinite) return a
    return Math.floor(a/b)
  }
}

export const EIntOrd = new ExtendedIntOrd()