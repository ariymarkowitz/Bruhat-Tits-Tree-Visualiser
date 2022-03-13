<script lang='ts'>
  export let allowInf: boolean = false
  export let emptyIsZero: boolean = false

  // The numeric state of the field.
  export let state: [number, number] | undefined = undefined
  // The value displayed in the field.
  export let value: string = ''

  let input: string
  $: input = value

  function validateInput(e) {
    const newInput = e.target.value
    if (isValidInput(input)) {
      value = newInput
      state = parse(value)
    } else {
      input = value
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
</script>

<input type='text' bind:value={input} on:input|preventDefault={validateInput}/>