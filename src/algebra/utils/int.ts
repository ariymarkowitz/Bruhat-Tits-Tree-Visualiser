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
  let y1 = 0, y2 = 1
  while (n !== 1) {
    if (n === 0) throw new Error('a and n have common divisors')
    let q = Math.floor(a/n);
    [a, n, y1, y2] = [n, a % n, y2 - q * y1, y1]
  }
  return mod(y2, n)
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