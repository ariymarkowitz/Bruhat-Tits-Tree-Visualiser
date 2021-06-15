export abstract class Group<GroupElement> {
  public abstract identity: GroupElement
  public abstract multiply(a: GroupElement, b: GroupElement): GroupElement
  public abstract invert(a: GroupElement): GroupElement

  public equals(a: GroupElement, b: GroupElement): boolean {
    return a === b
  }

  public isIdentity(a: GroupElement): boolean {
    return this.equals(a, this.identity)
  }

  // Method taken from Wikipedia
  public pow(g: GroupElement, n: number): GroupElement {
    if (n < 0) {
      g = this.invert(g)
      n = -n
    } else if (n === 0) {
      return this.identity
    }
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