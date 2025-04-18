export function mod(a: number, b: number) {
  const result = a % b
  return result < 0 ? result + Math.abs(b) : Math.abs(result)
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) {
    [a, b] = [b, a]
  }
  while (true) {
      if (b === 0) return a
      a %= b
      if (a === 0) return b
      b %= a
  }
}

export function inverseMod(a: number, n: number): number {
  let b = n
  let x1 = 1, x2 = 0
  while (b !== 1) {
    if (b === 0) throw new Error('a and n have common divisors')
    let r = mod(a, b)
    let q = (a - r) / b;
    [a, b, x1, x2] = [b, r, x2, x1 - q * x2]
  }
  return mod(x2, n)
}

export function isPrime(num: number): boolean {
  if (num <= 1) return false
  if (num % 2 === 0 && num > 2) return false
  const s = Math.sqrt(num)
  for(let i = 3; i <= s; i += 2) {
      if (num % i === 0) return false
  }
  return true
}