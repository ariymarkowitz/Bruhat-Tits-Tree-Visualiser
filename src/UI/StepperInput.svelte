<script lang='ts'>
  export type StepperInputEvent = CustomEvent<number>
  
  type StepperInputProps = Partial<{
    min: number
    max: number
    init: number
    valid: (n: number) => boolean
    onchange: (e: StepperInputEvent) => void
  }>

  let {
    min = 1,
    max = 100,
    init = min,
    valid = _ => true,
    onchange = _ => {}
  }: StepperInputProps = $props()

  let value: string = $state(init.toString())
  let prevInput: string = $state(init.toString())
  let numericValue: number = $state(init)

  export const set = (n: number) => {
    if (n !== numericValue) {
      numericValue = n
      value = n.toString()
    }
  }

  function setFromNumber(n: number) {
    if (n !== numericValue) {
      numericValue = n
      value = n.toString()
      onchange(new CustomEvent('change', { detail: numericValue }));
    }
  }
  
  function increment() {
    for (let i = numericValue + 1; i <= max; i++) {
      if (valid(i)) {
        setFromNumber(i)
        return
      }
    }
  }

  function decrement() {
    for (let i = numericValue - 1; i >= min; i--) {
      if (valid(i)) {
        setFromNumber(i)
        return
      }
    }
  }

  function onInput() {
    if (!isValidInput(value)) {
      value = prevInput
      return
    }
    prevInput = value
    if (isValidValue(value)) {
      numericValue = Number(value)
      onchange(new CustomEvent('change', { detail: numericValue }));
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
  <input type='text' bind:value oninput={onInput}/>
  <div class='number-input-buttons'>
    <button type="button" aria-label="Increment" class='number-input-up' onclick={increment}><i></i></button>
    <button type="button" aria-label="Decrement" class='number-input-down' onclick={decrement}><i></i></button>
  </div>
</div>