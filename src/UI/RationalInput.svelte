<script lang='ts'>
  type RationalInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    onchange: (value: [number, number] | undefined) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    onchange = _ => {}
  }: RationalInputProps = $props()

  let value: string = $state('')
  let prevInput: string = ''

  function onInput() {
    if (!isValidInput(value)) {
      value = prevInput
      return
    }
    prevInput = value
    onchange(parse(value))
  }

  function isValidInput(input: string) {
    if (input === '') return true
    const pattern = allowInf ? /^-?\d* *(\/ *-?\d*)?$/ : /^-?\d* *(\/ *-?([1-9]\d*)?)?$/
    return pattern.test(input)
  }

  function parse(input: string): [number, number] | undefined {
    if (input === '' && emptyIsZero) return [0, 1]
    const groups = /^(?<num>-?\d+) *(\/ *(?<den>-?\d+) *)?$/.exec(input)?.groups
    if (!groups?.num) return undefined

    const num = Number(groups.num)
    if (!groups.den) return [num, 1]

    const den = Number(groups.den)
    return num === 0 && den === 0 ? undefined : [num, den]
  }
</script>

<input type='text' bind:value oninput={onInput}/>
