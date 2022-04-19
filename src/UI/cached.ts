import { Updater, writable } from "svelte/store"

export interface Cacheable<T> {
  subscribe(updater: Updater<T>): void
  set(value: T): void
}

export function cached<T>(value?: T, eq: (a: T, b: T) => boolean = (a, b) => a === b): Cacheable<T> {
  const store = writable(value)
  let old = value
  return {
    subscribe: store.subscribe,
    set(value) {
      if (!(old && eq(old, value))) {
        old = value
        store.set(value)
        console.log(value)
      }
    }
  }
}