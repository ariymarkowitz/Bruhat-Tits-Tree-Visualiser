<script lang='ts'>
  import { deepEquals } from '../utils/equals'
  import { inputValue } from './inputValue.svelte'

  type RationalPoly = [number[], number[]] | undefined

  type RationalPolyInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    value: RationalPoly
    onchange: (value: RationalPoly) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    value = undefined,
    onchange = _ => {}
  }: RationalPolyInputProps = $props()

  const input = inputValue({
    value: () => value,
    format, parse, accept: isValidInput, onchange
  })

  function isValidInput(input: string) {
    // Accept all valid characters, and at most one slash.
    return /^[\dx+\-^() ]*\/?[\dx+\-^() ]*$/.test(input)
  }

  /**
   * Parse a polynomial into a map from exponent to coefficient,
   * or undefined if the input is not a polynomial.
   */
  function parseCoefficients(input: string): Map<number, number> | undefined {
    const coefficients = new Map<number, number>()
    const terms = input.replace(/[ ()]/g, '')

    for (const [term] of terms.matchAll(/(^|[\+-])((?:(?:\^[\+-]?)|[^\+-])+)/g)) {
      const match = term.match(/^([\+-]?\d*)(x(?:\^([\+-]?\d+))?)?$/)
      if (!match) return undefined

      const [, coeff, xTerm, exp] = match
      const coefficient = coeff === '' || coeff === '+' ? 1 : coeff === '-' ? -1 : Number(coeff)
      const exponent = xTerm === undefined ? 0 : exp === undefined ? 1 : Number(exp)
      coefficients.set(exponent, (coefficients.get(exponent) ?? 0) + coefficient)
    }
    // No coefficients parses as no input.
    return coefficients.size === 0 ? undefined : coefficients
  }

  function parse(input: string): RationalPoly {
    if (input === '' && emptyIsZero) return [[0], [1]]
    const parts = input.split('/')
    if (parts.length > 2) return undefined

    const parsed = parts.map(parseCoefficients)
    if (parsed.some(map => map === undefined)) return undefined
    // A missing denominator is 1.
    const [numerator, denominator = new Map([[0, 1]])] = parsed as Map<number, number>[]

    let numerTerms = [...numerator].filter(([, coefficient]) => coefficient !== 0)
    let denomTerms = [...denominator].filter(([, coefficient]) => coefficient !== 0)
    if (numerTerms.length === 0 && denomTerms.length === 0) return undefined

    // Handle negative exponents.
    const nMin = numerTerms.length > 0 ? Math.min(...numerTerms.map(([exp]) => exp)) : 0
    const dMin = denomTerms.length > 0 ? Math.min(...denomTerms.map(([exp]) => exp)) : 0
    const minExp = Math.min(nMin, dMin)
    if (minExp < 0) {
      numerTerms = numerTerms.map(([exp, coefficient]) => [exp - minExp, coefficient])
      denomTerms = denomTerms.map(([exp, coefficient]) => [exp - minExp, coefficient])
    }

    const n = coefficientArray(numerTerms)
    const d = coefficientArray(denomTerms)
    return allowInf || d.length > 0 ? [n, d] : undefined
  }

  function format(value: RationalPoly): string {
    if (value === undefined) return ''
    const [numerator, denominator] = value
    return deepEquals(denominator, [1])
      ? formatPoly(numerator)
      : `(${formatPoly(numerator)})/(${formatPoly(denominator)})`
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
</script>

<input type='text' bind:value={input.display} oninput={input.commit}/>
