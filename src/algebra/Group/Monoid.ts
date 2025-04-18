export abstract class Monoid<MonoidElement> {
  public abstract identity: MonoidElement
  public abstract multiply(a: MonoidElement, b: MonoidElement): MonoidElement

  public equals(a: MonoidElement, b: MonoidElement): boolean {
    return a === b
  }

  public isIdentity(a: MonoidElement): boolean {
    return this.equals(a, this.identity)
  }

  // Method taken from Wikipedia
  public pow(g: MonoidElement, n: number): MonoidElement {
    if (n < 0) {
      throw new Error('Exponent is negative.')
    }
    if (n === 0) return this.identity
    let h = this.identity
    while (n > 1) {
      if (n % 2 === 0) {
        h = this.multiply(g, h)
        g = this.multiply(g, g)
        n = (n-1)/2
      }
    }
    return this.multiply(g, h)
  }
}