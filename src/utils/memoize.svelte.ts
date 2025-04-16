export type Memoize<T> = {
  get: () => T
  set: (newValue: T) => void
}

export function memoize<T>(init: T, eq: (a: T, b: T) => boolean): Memoize<T> {
  let value = $state.raw(init)
  return {
    get() {
      return value
    },
    set(newValue: T) {
      if (!eq(value, newValue)) {
        value = newValue
      }
    }
  }
}