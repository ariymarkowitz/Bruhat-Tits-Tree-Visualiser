<script lang='ts'>
  import { inputValue } from './inputValue.svelte'
  import * as rational from './rational'

  type RationalInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    value: rational.Rational
    onchange: (value: rational.Rational) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    value = undefined,
    onchange = _ => {}
  }: RationalInputProps = $props()

  const input = inputValue({
    value: () => value,
    format: rational.format,
    parse: text => rational.parse(text, { emptyIsZero }),
    accept: text => rational.isTypeable(text, { allowInf }),
    onchange
  })
</script>

<input type='text' bind:value={input.display} oninput={input.commit}/>
