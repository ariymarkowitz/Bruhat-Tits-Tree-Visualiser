// Helps for keeping track of what the number is supposed to represent.
export type int = number

export function mod(a: int, b: int) {
  const result = a % b
  if (result < 0) return result + b
  else return result
}

export function gcd(a: int, b: int): int {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) {
    [a, b] = [b, a]
  }
  while (true) {
      if (b == 0) return a
      a %= b
      if (a == 0) return b
      b %= a
  }
}

export function isPrime(num: int): boolean {
  if (num <= 1) return false
  if (num % 2 === 0 && num > 2) return false
  const s = Math.sqrt(num)
  for(let i = 3; i <= s; i += 2) {
      if (num % i === 0) return false
  }
  return true
}