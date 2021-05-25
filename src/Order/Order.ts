export abstract class Order<Element> {
  public equals(a: Element, b: Element): boolean{
    return a === b
  }
  public abstract lt(a: Element, b: Element): boolean
  public lte(a: Element, b: Element): boolean {
    return !this.lt(a, b)
  }
  public gt(a: Element, b: Element): boolean {
    return this.lt(b, a)
  }
  public gte(a: Element, b: Element): boolean {
    return this.lte(b, a)
  }
  public min(a: Element, b: Element) {
    if (this.lte(a, b)) return a
    else return b
  }
  public max(a: Element, b: Element) {
    if (this.gte(a, b)) return a
    else return b
  }
  public minAll(arr: Element[]) {
    if (arr.length === 0) throw new Error ('Array is empty')
    return arr.reduce((min, n) => this.min(min, n), arr[1])
  }
  public maxAll(arr: Element[]) {
    if (arr.length === 0) throw new Error ('Array is empty')
    return arr.reduce((max, n) => this.max(max, n), arr[1])
  }
}