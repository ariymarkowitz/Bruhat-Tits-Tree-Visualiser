<script lang='ts'>
  export let min: number = 1
  export let max: number = 100
  export let valid: (n: number) => boolean = n => true
  export let init: number = min

  // The value visible outside of the input.
  export let value: number = init
  // The value to display in the input field.
  export let display: string = init.toString()

  // The value used by the increment buttons.
  let incrementValue: number = value
  let input: HTMLInputElement

  export const set = (n: number) => {
    value = n
    display = n.toString()
  }

  function setRaw(v: string): boolean {
    if (isValidInput(v)) {
      display = v
      if (isValidValue(v)) {
        value = Number(v)
      }
      return true
    } else {
      return false
    }
  }

  $: if (input) input.value = display.toString()
  // Update `incrementvalue` if `display` is nonempty.
  // Update `value` if `incrementValue` is valid.
  $: if (display !== '') {
    incrementValue = Number(display)
  }
  
  function increment() {
    for (let i = incrementValue + 1; i <= max; i++) {
      if (valid(i)) {
        set(i)
        return
      }
    }
  }

  function decrement() {
    for (let i = incrementValue - 1; i >= min; i--) {
      if (valid(i)) {
        set(i)
        return
      }
    }
  }

  function validateInput(e) {
    const input = e.target.value
    if (!setRaw(input)) {
      e.target.value = display
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
  <input type='text' bind:this={input} on:input|preventDefault={validateInput}/>
  <div class='number-input-buttons'>
    <div class='number-input-up' on:click={increment}><i></i></div>
    <div class='number-input-down' on:click={decrement}><i></i></div>
  </div>
</div>