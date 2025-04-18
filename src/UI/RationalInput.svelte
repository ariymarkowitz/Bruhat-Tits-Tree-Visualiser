<script lang='ts'>
  export type RationalInputEvent = CustomEvent<[number, number] | undefined>

  type RationalInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    onchange: (e: RationalInputEvent) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    onchange = _ => {}
  }: RationalInputProps = $props()

  let value: string = $state('')
  let prevInput: string = $state('')

  function onInput() {
    if (!isValidInput(value)) {
      value = prevInput
      return
    }
    prevInput = value
    const parsed = parse(value)
    if (parsed) {
      onchange(new CustomEvent('change', { detail: parsed }))
    } else {
      onchange(new CustomEvent('change', { detail: undefined }))
    }
  }

  function isValidInput(input: string) {
    if (input === '') return true
    if (allowInf) {
      return (/^-?\d* *(\/ *-?\d*)?$/.test(input))
    } else {
      return (/^-?\d* *(\/ *-?([1-9]\d*)?)?$/.test(input))
    }
  }

  function parse(input: string): [number, number] | undefined {
    if (input === '' && emptyIsZero) return [0, 1]
    const matches = /^(?<num>-?\d+) *(\/ *(?<den>-?\d+) *)?$/.exec(input)
    if (!matches || !matches.groups) return undefined
    const g = matches.groups
    if (g.num) {
      const num = Number(matches.groups.num)
      if (g.den) {
        const den = Number(matches.groups.den)
        if (num === 0 && den === 0) return undefined
        return [num, den]
      } else {
        return [num, 1]
      }
    } else {
      return undefined
    }
  }

  // export function set(input: [number, number] | undefined) {
  //   value = input ? `${input[0]} / ${input[1]}` : ''
  // }

</script>

<input type='text' bind:value oninput={onInput}/>