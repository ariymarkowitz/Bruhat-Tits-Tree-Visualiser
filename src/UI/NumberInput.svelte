<script lang='ts' context='module'>
  export type ChangeEvent = CustomEvent<{state: number}>
</script>

<script lang='ts'>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let min: number = 1
  export let max: number = 100
  export let valid: (n: number) => boolean = n => true
  export let init: number = min

  // The numeric state of the field.
  export let state: number = init
  // The value displayed in the field.
  export let value: string = init.toString()

  // The value used by the increment buttons.
  let incrementState: number = state
  let input: string

  export const set = (n: number) => {
    if (state !== n) {
      dispatch('change', {
        state: n
      });
      state = n
      value = n.toString()
    }
  }

  function setRaw(v: string): boolean {
    if (isValidInput(v)) {
      value = v
      if (isValidValue(v)) {
        dispatch('change', {
          state: Number(v)
        });
        state = Number(v)
      }
      return true
    } else {
      return false
    }
  }

  $: input = value
  // Update `incrementvalue` if `display` is nonempty.
  // Update `value` if `incrementValue` is valid.
  $: if (value !== '') {
    incrementState = Number(value)
  }
  
  function increment() {
    for (let i = incrementState + 1; i <= max; i++) {
      if (valid(i)) {
        set(i)
        return
      }
    }
  }

  function decrement() {
    for (let i = incrementState - 1; i >= min; i--) {
      if (valid(i)) {
        set(i)
        return
      }
    }
  }

  function validateInput(e) {
    const input = e.target.value
    if (!setRaw(input)) {
      e.target.value = value
    }
  }

  function isValidInput(input: string) {
    if (input === '') return true
    if (/^(0|[1-9]\d*)$/.test(input)) {
      const intInput = Number(input)
      if ((min <= 0 || intInput > 0 ) && intInput <= max) return true
    }
    return false
  }

  function isValidValue(input: string) {
    if (input === '') return false
    const n = Number(input)
    return min <= n && max >= n && valid(n)
  }
</script>

<div class='number-input'>
  <input type='text' bind:value={input} on:input|preventDefault={validateInput}/>
  <div class='number-input-buttons'>
    <div class='number-input-up' on:click={increment}><i></i></div>
    <div class='number-input-down' on:click={decrement}><i></i></div>
  </div>
</div>