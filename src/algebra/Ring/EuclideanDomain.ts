/**
 * An integral domain that allows for a form of division with remainder.
 * This allows for the definition of the Euclidean algorithm.
 */

import { Ring } from './Ring';

export abstract class EuclideanDomain<RingElement> extends Ring<RingElement> {
  /**
   * Returns the norm used to determine the remainder.
   */
  public abstract edNorm(a: RingElement): number
  /**
   * Returns q and r such that a = b * q + r, where r = 0 or |r| < |b|.
   */ 
  public abstract divmod(a: RingElement, b: RingElement): [RingElement, RingElement]

  public div(a: RingElement, b: RingElement): RingElement {
    return this.divmod(a, b)[0]
  }

  public mod(a: RingElement, b: RingElement): RingElement {
    return this.divmod(a, b)[1]
  }

  public gcd(a: RingElement, b: RingElement): RingElement {
    while (!this.isZero(b)) {
      [a, b] = [b, this.mod(a, b)]
    }
    return a
  }

  /**
   * Returns the extended GCD of a and b, i.e., returns (gcd(a, b), x, y, s, t) such that
   * gcd(a, b) = a * x + b * y and a * s + b * t = 0, where s and t are coprime.
   * In particular, t = -a / gcd(a, b) and s = b / gcd(a, b) up to scalar multiples.
   */
  public extendedGCD(a: RingElement, b: RingElement): [RingElement, RingElement, RingElement, RingElement, RingElement] {
    let x0 = this.one
    let x1 = this.zero
    let y0 = this.zero
    let y1 = this.one

    while (!this.isZero(b)) {
      const [q, r] = this.divmod(a, b);
      [a, b, x0, y0, x1, y1] = [
        b, r, x1, y1,
        this.subtract(x0, this.multiply(q, x1)),
        this.subtract(y0, this.multiply(q, y1))
      ]
    }
    return [a, x0, y0, x1, y1]
  }

  public inverseMod(a: RingElement, b: RingElement): RingElement {
    const [gcd, x] = this.extendedGCD(a, b)
    if (!this.isOne(gcd)) throw new Error('No inverse exists.')
    return this.mod(x, b)
  }
}