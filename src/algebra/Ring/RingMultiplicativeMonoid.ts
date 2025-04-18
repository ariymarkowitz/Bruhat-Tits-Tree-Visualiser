import { Monoid } from '../Group/Monoid';
import type { Ring } from './Ring';

export class RingMultiplicativeMonoid<RingElement> extends Monoid<RingElement> {
  constructor(public ring: Ring<RingElement>) {
    super()
  }

  public get identity() {
    return this.ring.one
  }

  public equals(a: RingElement, b: RingElement) {
    return this.ring.equals(a, b)
  }

  public isIdentity(a: RingElement) {
    return this.ring.isOne(a)
  }

  public multiply(a: RingElement, b: RingElement) {
    return this.ring.multiply(a, b)
  }
}