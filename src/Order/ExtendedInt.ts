import { int } from "../utils"
import { Order } from "./Order"

export const Infinite = Symbol('Infinite')
export type extendedInt = int | typeof Infinite

export class ExtendedInt extends Order<extendedInt> {

  public lt(a: extendedInt, b: extendedInt) {
    return (a !== Infinite) && (b === Infinite || a < b)
  }
  public lte(a: extendedInt, b: extendedInt): boolean {
    return (b === Infinite) || (a !== Infinite && a <= b)
  }
  public min(a: extendedInt, b: int): int
  public min(a: int, b: extendedInt): int
  public min(a: int, b: int): int
  public min(a: extendedInt, b: extendedInt): extendedInt
  public min(a: extendedInt, b: extendedInt) {
    if (a === Infinite) return b
    if (b === Infinite) return a
    return Math.min(a, b)
  }
  public max(a: extendedInt, b: extendedInt): extendedInt
  public max(a: int, b: int): int
  public max(a: extendedInt, b: extendedInt) {
    if (a === Infinite) return a
    if (b === Infinite) return b
    return Math.min(a, b)
  }
  public mulInt(a: extendedInt, b: int): extendedInt {
    if (a === Infinite) return a
    return a*b
  }
  public divInt(a: extendedInt, b: int): extendedInt {
    if (a === Infinite) return a
    return Math.floor(a/b)
  }
}

export const eInt = new ExtendedInt()