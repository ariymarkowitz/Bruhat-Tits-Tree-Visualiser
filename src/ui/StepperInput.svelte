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
    parse: text => isComplete(text) ? Number(text) : incomplete,
    accept: isTypeable,
    onchange
  })

  /** The nearest value in the given direction that `valid` accepts, if any. */
  function nextValid(from: number, step: 1 | -1): number | undefined {
    for (let i = from + step; min <= i && i <= max; i += step) {
      if (valid(i)) return i
    }
    return undefined
  }

  const nextValue = $derived(nextValid(value, 1))
  const prevValue = $derived(nextValid(value, -1))

  function moveTo(target: number | undefined) {
    if (target !== undefined) onchange(target)
  }

  /** Whether the text may stand in the input box, half-finished entries included. */
  function isTypeable(input: string) {
    if (input === '') return true
    if (!/^(0|[1-9]\d*)$/.test(input)) return false
    const n = Number(input)
    return (min <= 0 || n > 0) && n <= max
  }

  /** Whether the text names a value this stepper can report. */
  function isComplete(input: string) {
    if (input === '') return false
    const n = Number(input)
    return min <= n && max >= n && valid(n)
  }
</script>

<div class='number-input'>
  <input type='text' bind:value={input.display} oninput={input.commit}/>
  <div class='number-input-buttons'>
    <button type="button" aria-label="Increment" class='number-input-up' disabled={nextValue === undefined} onclick={() => moveTo(nextValue)}><i></i></button>
    <button type="button" aria-label="Decrement" class='number-input-down' disabled={prevValue === undefined} onclick={() => moveTo(prevValue)}><i></i></button>
  </div>
</div>
