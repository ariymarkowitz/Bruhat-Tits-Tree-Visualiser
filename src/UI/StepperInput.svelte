<script lang='ts'>
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

  let text: string = $state(value.toString())
  let prevInput: string = $state(value.toString())

  // Prop→display sync. Not a two-way binding — it mirrors external `value` changes
  // (e.g. derived depth recomputing when p changes) into the input field without
  // mutating depthState. Replacing this with bind:value would silently lose the
  // "remember original depth when p bounces" behaviour.
  $effect(() => {
    const s = value.toString()
    text = s
    prevInput = s
  })

  function increment() {
    for (let i = value + 1; i <= max; i++) {
      if (valid(i)) { onchange(i); return }
    }
  }

  function decrement() {
    for (let i = value - 1; i >= min; i--) {
      if (valid(i)) { onchange(i); return }
    }
  }

  function onInput() {
    if (!isValidInput(text)) {
      text = prevInput
      return
    }
    prevInput = text
    if (isValidValue(text)) {
      onchange(Number(text))
    }
  }

  function isValidInput(input: string) {
    if (input === '') return true
    if (/^(0|[1-9]\d*)$/.test(input)) {
      const intInput = Number(input)
      if ((min <= 0 || intInput > 0) && intInput <= max) return true
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
  <input type='text' bind:value={text} oninput={onInput}/>
  <div class='number-input-buttons'>
    <button type="button" aria-label="Increment" class='number-input-up' onclick={increment}><i></i></button>
    <button type="button" aria-label="Decrement" class='number-input-down' onclick={decrement}><i></i></button>
  </div>
</div>
