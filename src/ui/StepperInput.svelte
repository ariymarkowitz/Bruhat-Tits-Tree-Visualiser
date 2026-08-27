<script lang='ts'>
  import { incomplete, inputValue } from './inputValue.svelte'

  type StepperInputProps = {
    min?: number
    max?: number
    value: number
    valid?: (n: number) => boolean
    onchange?: (n: number) => void
  }

  let {
    min = 1,
    max = 100,
    value,
    valid = _ => true,
    onchange = _ => {}
  }: StepperInputProps = $props()

  const input = inputValue({
    value: () => value,
    format: n => n.toString(),
    parse: text => isValidValue(text) ? Number(text) : incomplete,
    accept: isValidInput,
    onchange
  })

  const nextValue = $derived.by(() => {
    for (let i = value + 1; i <= max; i++) {
      if (valid(i)) return i
    }
    return undefined
  })

  const prevValue = $derived.by(() => {
    for (let i = value - 1; i >= min; i--) {
      if (valid(i)) return i
    }
    return undefined
  })

  function increment() {
    if (nextValue !== undefined) onchange(nextValue)
  }

  function decrement() {
    if (prevValue !== undefined) onchange(prevValue)
  }

  function isValidInput(input: string) {
    if (input === '') return true
    if (!/^(0|[1-9]\d*)$/.test(input)) return false
    const n = Number(input)
    return (min <= 0 || n > 0) && n <= max
  }

  function isValidValue(input: string) {
    if (input === '') return false
    const n = Number(input)
    return min <= n && max >= n && valid(n)
  }
</script>

<div class='number-input'>
  <input type='text' bind:value={input.display} oninput={input.commit}/>
  <div class='number-input-buttons'>
    <button type="button" aria-label="Increment" class='number-input-up' disabled={nextValue === undefined} onclick={increment}><i></i></button>
    <button type="button" aria-label="Decrement" class='number-input-down' disabled={prevValue === undefined} onclick={decrement}><i></i></button>
  </div>
</div>
