import { describe, expect, test } from 'vitest'
import { mod, gcd, inverseMod, isPrime } from './int'

describe('mod', () => {
  test('positive numbers', () => {
    expect(mod(7, 5)).toBe(2)
    expect(mod(12, 7)).toBe(5)
  })
  test('negative numbers', () => {
    expect(mod(-7, 5)).toBe(3)
    expect(mod(-12, 7)).toBe(2)
  })
  test('zero', () => {
    expect(mod(0, 5)).toBe(0)
    expect(mod(5, 5)).toBe(0)
    expect(mod(-5, 5)).toBe(0)
    expect(mod(-7, -3)).toBe(2)
  })
})

describe('gcd', () => {
  test('positive numbers', () => {
    expect(gcd(12, 8)).toBe(4)
    expect(gcd(100, 10)).toBe(10)
  })
  test('negative numbers', () => {
    expect(gcd(-12, 8)).toBe(4)
    expect(gcd(12, -8)).toBe(4)
    expect(gcd(-12, -8)).toBe(4)
  })
  test('zero', () => {
    expect(gcd(0, 5)).toBe(5)
    expect(gcd(5, 0)).toBe(5)
    expect(gcd(0, 0)).toBe(0)
  })
})

describe('inverseMod', () => {
  test('basic cases', () => {
    expect(inverseMod(2, 5)).toBe(3)
    expect(inverseMod(3, 7)).toBe(5)
    expect(inverseMod(1, 13)).toBe(1)
  })
  test('throws when not invertible', () => {
    expect(() => inverseMod(2, 4)).toThrow()
    expect(() => inverseMod(0, 5)).toThrow()
  })
  test('negative a', () => {
    expect(inverseMod(-3, 7)).toBe(2)
  })
})

describe('isPrime', () => {
  test('primes', () => {
    expect(isPrime(2)).toBe(true)
    expect(isPrime(3)).toBe(true)
    expect(isPrime(5)).toBe(true)
    expect(isPrime(13)).toBe(true)
    expect(isPrime(97)).toBe(true)
  })
  test('non-primes', () => {
    expect(isPrime(0)).toBe(false)
    expect(isPrime(1)).toBe(false)
    expect(isPrime(-7)).toBe(false)
    expect(isPrime(4)).toBe(false)
    expect(isPrime(100)).toBe(false)
  })
})
