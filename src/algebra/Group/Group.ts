import { Monoid } from './Monoid'

export abstract class Group<GroupElement> extends Monoid<GroupElement> {
  public abstract invert(a: GroupElement): GroupElement

  // Method taken from Wikipedia
  public pow(g: GroupElement, n: number): GroupElement {
    if (n < 0) {
      g = this.invert(g)
      n = -n
    }
    return super.pow(g, n)
  }
}