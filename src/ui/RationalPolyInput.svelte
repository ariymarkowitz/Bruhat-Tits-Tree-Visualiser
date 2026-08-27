<script lang='ts'>
  import { inputValue } from './inputValue.svelte'
  import * as rationalPoly from './rationalPoly'

  type RationalPolyInputProps = Partial<{
    allowInf: boolean
    emptyIsZero: boolean
    value: rationalPoly.RationalPoly
    onchange: (value: rationalPoly.RationalPoly) => void
  }>

  let {
    allowInf = false,
    emptyIsZero = false,
    value = undefined,
    onchange = _ => {}
  }: RationalPolyInputProps = $props()

  const input = inputValue({
    value: () => value,
    format: rationalPoly.format,
    parse: text => rationalPoly.parse(text, { emptyIsZero, allowInf }),
    accept: rationalPoly.isTypeable,
    onchange
  })
</script>

<input type='text' bind:value={input.display} oninput={input.commit}/>
