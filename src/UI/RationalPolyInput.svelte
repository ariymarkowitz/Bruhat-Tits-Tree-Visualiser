<script lang='ts'>
  export type RationalPolyInputEvent = CustomEvent<[number[], number[]] | undefined>

  type RationalPolyInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    onchange: (e: RationalPolyInputEvent) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    onchange = _ => {}
  }: RationalPolyInputProps = $props()

  let value: string = $state('')

  function onInput() {
    const parsed = parse(value)
    if (parsed) {
      onchange(new CustomEvent('change', { detail: parsed }))
    } else {
      onchange(new CustomEvent('change', { detail: undefined }))
    }
  }

  function parseCoefficients(input: string): Map<number, number> | undefined {
    const coefficients = new Map<number, number>()
    input = input.replace(/[ \(\)]/g, '')

    for (const [term] of input.matchAll(/(^|[\+-])((?:(?:\^[\+-]?)|[^\+-])+)/g)) {
      const match = term.match(/^([\+-]?\d*)(x(?:\^([\+-]?\d+))?)?$/)
      if (!match) return undefined
      
      const [_, coeff, xTerm, exp] = match
      const coefficient = coeff === '' || coeff === '+' ? 1 : coeff === '-' ? -1 : Number(coeff)
      const exponent = xTerm === undefined ? 0 : exp === undefined ? 1 : Number(exp)
      if (exponent < 0) return undefined

      coefficients.set(exponent, (coefficients.get(exponent) || 0) + coefficient)
    }
    return coefficients
  }

  function parse(input: string): [number[], number[]] | undefined {
    if (input === '' && emptyIsZero) return [[0], [1]]
    const parts = input.split('/')
    if (parts.length > 2) return undefined

    const maps = parts.map(part => parseCoefficients(part))
    if (maps.some(map => map === undefined)) return undefined

    let numerators = maps[0]!
    let denominators = maps[1] ?? new Map<number, number>([[0, 1]])

    // Remove zero coefficients
    let nEntries = Array.from(numerators.entries()).filter(([_, value]) => value !== 0)
    let dEntries = Array.from(denominators.entries()).filter(([_, value]) => value !== 0)
    if (nEntries.length === 0 && dEntries.length === 0) return undefined

    // Handle negative exponents
    const nMin = nEntries.length > 0 ? Math.min(...nEntries.map(([key]) => key)) : 0
    const dMin = dEntries.length > 0 ? Math.min(...dEntries.map(([key]) => key)) : 0
    const minExp = Math.min(nMin, dMin)
    if (minExp < 0) {
      nEntries = nEntries.map(([key, value]) => [key - minExp, value])
      dEntries = dEntries.map(([key, value]) => [key - minExp, value])
    }

    const n = arrayFromEntries(nEntries)
    const d = arrayFromEntries(dEntries)
    return allowInf || d.length > 0 ? [n, d] : undefined 
  }

  function arrayFromEntries(entries: [number, number][]): number[] {
    const arr = new Array(Math.max(...entries.map(([key]) => key + 1), 0)).fill(0)
    for (const [key, value] of entries) {
      arr[key] = value
    }
    return arr
  }

</script>

<input type='text' bind:value oninput={onInput}/>