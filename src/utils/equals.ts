/**
 * Structural equality for the numbers and (nested) arrays that the inputs pass around.
 */
export function deepEquals(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => deepEquals(x, b[i]))
  }
  return a === b
}
