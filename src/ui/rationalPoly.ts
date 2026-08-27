import { deepEquals } from '../utils/equals'

export type RationalPoly = [number[], number[]] | undefined

/** Whether the text may stand in the input box, half-finished entries included. */
export function isTypeable(text: string): boolean {
  // Accept all valid characters, and at most one slash.
  return /^[\dx+^() -]*\/?[\dx+^() -]*$/.test(text)
}

export function parse(
  text: string,
  { emptyIsZero, allowInf }: { emptyIsZero: boolean, allowInf: boolean }
): RationalPoly {
  if (text === '' && emptyIsZero) return [[0], [1]]
  const parts = text.split('/')
  if (parts.length > 2) return undefined

  const parsed = parts.map(parseCoefficients)
  // Check for a failed parse before destructuring: a denominator that failed is also
  // `undefined`, and would otherwise silently pick up the default of 1.
  if (parsed.some(map => map === undefined)) return undefined
  // A missing denominator is 1.
  const [numerator, denominator = new Map([[0, 1]])] = parsed as Map<number, number>[]

  const numerTerms = [...numerator].filter(([, coefficient]) => coefficient !== 0)
  const denomTerms = [...denominator].filter(([, coefficient]) => coefficient !== 0)
  if (numerTerms.length === 0 && denomTerms.length === 0) return undefined

  // Clear negative exponents by multiplying both sides by a power of x.
  const shift = -Math.min(0, ...numerTerms.map(([exp]) => exp), ...denomTerms.map(([exp]) => exp))
  const raise = ([exp, coefficient]: [number, number]): [number, number] => [exp + shift, coefficient]

  const n = coefficientArray(numerTerms.map(raise))
  const d = coefficientArray(denomTerms.map(raise))
  return allowInf || d.length > 0 ? [n, d] : undefined
}

export function format(value: RationalPoly): string {
  if (value === undefined) return ''
  const [numerator, denominator] = value
  return deepEquals(denominator, [1])
    ? formatPoly(numerator)
    : `(${formatPoly(numerator)})/(${formatPoly(denominator)})`
}

/**
 * Parse a polynomial into a map from exponent to coefficient,
 * or undefined if the input is not a polynomial.
 */
function parseCoefficients(input: string): Map<number, number> | undefined {
  const coefficients = new Map<number, number>()
  const terms = input.replace(/[ ()]/g, '')

  // Split on the signs that separate terms, keeping the sign with the term it belongs to.
  // A sign directly after '^' is part of the exponent, so it does not split.
  for (const [term] of terms.matchAll(/(^|[+-])((?:(?:\^[+-]?)|[^+-])+)/g)) {
    const match = term.match(/^([+-]?\d*)(x(?:\^([+-]?\d+))?)?$/)
    if (!match) return undefined

    const [, coeff, xTerm, exp] = match
    const coefficient = coeff === '' || coeff === '+' ? 1 : coeff === '-' ? -1 : Number(coeff)
    const exponent = xTerm === undefined ? 0 : exp === undefined ? 1 : Number(exp)
    coefficients.set(exponent, (coefficients.get(exponent) ?? 0) + coefficient)
  }
  // No coefficients parses as no input.
  return coefficients.size === 0 ? undefined : coefficients
}

/**
 * Write an array of coefficients by degree as a polynomial, eg. [1, 0, 2] as '2x^2 + 1'.
 */
function formatPoly(coefficients: number[]): string {
  const terms = coefficients
    .map((coefficient, exp) => ({ coefficient, exp }))
    .filter(({ coefficient }) => coefficient !== 0)
    .reverse()
    .map(({ coefficient, exp }) => {
      if (exp === 0) return `${coefficient}`
      const power = exp === 1 ? 'x' : `x^${exp}`
      return coefficient === 1 ? power : coefficient === -1 ? `-${power}` : `${coefficient}${power}`
    })
  return terms.length === 0 ? '0' : terms.join(' + ').replaceAll('+ -', '- ')
}

/**
 * Convert [exponent, coefficient] pairs into an array of coefficients by degree.
 */
function coefficientArray(terms: [number, number][]): number[] {
  const arr = new Array(Math.max(...terms.map(([exp]) => exp + 1), 0)).fill(0)
  for (const [exp, coefficient] of terms) {
    arr[exp] = coefficient
  }
  return arr
}
