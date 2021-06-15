import { Group } from "../Group/Group"
import { Ring } from "./Ring"

export class RingAdditiveGroup<RingElement> extends Group<RingElement> {
  private _ring: Ring<RingElement>
  public get ring(): Ring<RingElement> {
    return this._ring
  }

  private _identity: RingElement
  public get identity() {
    return this._identity
  }

  public constructor(field: Ring<RingElement>) {
    super()
    this._ring = field
  }

  public multiply(a: RingElement, b: RingElement) {
    return this.ring.add(a, b)
  }

  public invert(a: RingElement): RingElement {
    return this.ring.negate(a)
  }
}