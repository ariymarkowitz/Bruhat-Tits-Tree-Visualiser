import { Memoize } from 'fast-typescript-memoize'
import { RingAdditiveGroup } from "./RingAdditiveGroup"
import { RingMultiplicativeMonoid } from './RingMultiplicativeMonoid'

export abstract class Ring<RingElement> {
  public abstract add(a: RingElement, b: RingElement): RingElement
  public abstract negate(a: RingElement): RingElement
  public abstract multiply(a: RingElement, b: RingElement): RingElement

  public abstract readonly zero: RingElement
  public abstract readonly one: RingElement

  public equals(a: RingElement, b: RingElement) {
    return a === b
  }
  public isZero(a: RingElement) {
    return this.equals(a, this.zero)
  }

  public isOne(a: RingElement) {
    return this.equals(a, this.one)
  }

  public subtract(a: RingElement, b: RingElement) {
    return this.add(a, this.negate(b))
  }

  // There is a unique homomorphism of rings from the integers to any ring.
  public fromInt(n: number): RingElement{
    return this.additiveGroup.pow(this.one, n)
  }

  @Memoize() public get additiveGroup(): RingAdditiveGroup<RingElement> {
    return new RingAdditiveGroup(this)
  }

  @Memoize() public get multiplicativeMonoid(): RingMultiplicativeMonoid<RingElement> {
    return new RingMultiplicativeMonoid(this)
  }

  public nonZeroPow(a: RingElement, n: number): RingElement {
    return this.multiplicativeMonoid.pow(a, n)
  }

  public pow(a: RingElement, n: number): RingElement {
    if (this.isZero(a)) {
      if (n === 0) {
        throw new Error("0 to the power of 0 is undefined.")
      } else {
        return this.zero
      }
    } else {
      return this.nonZeroPow(a, n)
    }
  }
  
  public dot(a: RingElement, b: RingElement, c: RingElement, d: RingElement): RingElement {
    return this.add(this.multiply(a, c), this.multiply(b, d))
  }

  public abstract toString(): string
  public abstract toString(a: RingElement): string
  public abstract toLatex(a: RingElement): string
}