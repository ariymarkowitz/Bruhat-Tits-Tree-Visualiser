<script lang='ts'>
  import { inputValue } from './inputValue.svelte'

  type Rational = [number, number] | undefined

  type RationalInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    value: Rational
    onchange: (value: Rational) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    value = undefined,
    onchange = _ => {}
  }: RationalInputProps = $props()

  const input = inputValue({
    value: () => value,
    format, parse, accept: isValidInput, onchange
  })

  function isValidInput(input: string) {
    if (input === '') return true
    const pattern = allowInf ? /^-?\d* *(\/ *-?\d*)?$/ : /^-?\d* *(\/ *-?([1-9]\d*)?)?$/
    return pattern.test(input)
  }

  function parse(input: string): Rational {
    if (input === '' && emptyIsZero) return [0, 1]
    const groups = /^(?<num>-?\d+) *(\/ *(?<den>-?\d+) *)?$/.exec(input)?.groups
    if (!groups?.num) return undefined

    const num = Number(groups.num)
    if (!groups.den) return [num, 1]

    const den = Number(groups.den)
    return num === 0 && den === 0 ? undefined : [num, den]
  }

  function format(value: Rational): string {
    if (value === undefined) return ''
    const [num, den] = value
    return den === 1 ? `${num}` : `${num}/${den}`
  }
</script>

<input type='text' bind:value={input.display} oninput={input.commit}/>
