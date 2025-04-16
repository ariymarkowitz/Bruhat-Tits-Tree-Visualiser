export function mod(a: number, b: number) {
  const result = a % b
  return result < 0 ? result + b : result
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
  if (n < 2) throw new Error('n is less than 2')
  let a1 = n, b1 = 1, c1 = 0, a2 = mod(a, n), b2 = 0, c2 = 1
  while (a2 !== 1) {
    if (a2 === 0) throw new Error('a and n have common divisors')
    let mul = Math.floor(a1/a2);
    [a1, b1, c1, a2, b2, c2] = [a2, b2, c2, a1 - mul*a2, b1 - mul*b2, c1-mul*c2]
  }
  return mod(c2, n)
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