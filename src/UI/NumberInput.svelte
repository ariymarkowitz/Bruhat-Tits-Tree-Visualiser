<script lang='ts'>
  export let min: number = 1
  export let max: number = 100
  export let valid: (n: number) => boolean = n => true
  export let init: number = min

  let state = init
  let value: string = state.toString()
  let input = value

  $: input = value

  $: {
    if (value !== '') {
      const intValue = Number(value)
      if (intValue >= min && intValue <= max && valid(intValue)) {
        state = intValue
      }
    }
  }
  
  function increment() {
    for (let i = state + 1; i <= max; i++) {
      if (valid(i)) {
        value = i.toString()
        return
      }
    }
  }

  function decrement() {
    for (let i = state - 1; i >= min; i--) {
      if (valid(i)) {
        value = i.toString()
        return
      }
    }
  }

  function validateInput(e) {
    if (inputIsValid(input)) {
      value = input
    } else {
      input = value
    }
  }

  function inputIsValid(input: string) {
    if (input === '') return true
    if (/^(0|[1-9]\d*)$/.test(input)) {
      const intInput = Number(input)
      if (min <= intInput && intInput <= max) return true
    }
    return false
  }
</script>

<div class='number-input'>
  <input type='text' bind:value={input} on:input|preventDefault={validateInput}/>
  <div class='number-input-buttons'>
    <div class='number-input-up' on:click={increment}><i></i></div>
    <div class='number-input-down' on:click={decrement}><i></i></div>
  </div>
</div>