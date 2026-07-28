<script lang='ts'>
  type RationalPolyInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    onchange: (value: [number[], number[]] | undefined) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    onchange = _ => {}
  }: RationalPolyInputProps = $props()

  let value: string = $state('')

  function onInput() {
    onchange(parse(value))
  }

  /**
   * Parse a polynomial into a map from exponent to coefficient.
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
    return coefficients
  }

  function parse(input: string): [number[], number[]] | undefined {
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

    // Handle negative exponents
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

<input type='text' bind:value oninput={onInput}/>
