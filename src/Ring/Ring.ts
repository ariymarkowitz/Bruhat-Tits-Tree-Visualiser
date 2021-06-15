import { int } from "../utils/utils"
import { RingAdditiveGroup } from "./RingAdditiveGroup"

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
  public fromInt(n: int): RingElement{
    return this.additiveGroup.pow(this.one, n)
  }

  private _additiveGroup: RingAdditiveGroup<RingElement>
  public get additiveGroup(): RingAdditiveGroup<RingElement> {
    if (this._additiveGroup === undefined) {
      this._additiveGroup = new RingAdditiveGroup(this)
    }
    return this._additiveGroup
  }
}