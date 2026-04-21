<script lang="ts" module>
  const characteristics = {
    zero: {
      type: 'zero',
      component: RationalInput,
      zero: [0, 1]
    },
    nonzero: {
      type: 'nonzero',
      component: RationalPolyInput,
      zero: [[], [1]]
    }
  } as const
</script>
<script lang="ts">
  import RationalInput from "./RationalInput.svelte";
  import RationalPolyInput from './RationalPolyInput.svelte';
  import Latex from './Latex.svelte';

  type MatrixInputProps = {
    characteristic: keyof typeof characteristics,
    onchange?: (value: [unknown, unknown][][] | undefined) => void
  }
  let { characteristic, onchange = _ => {} }: MatrixInputProps = $props()
  let type = $derived(characteristics[characteristic])

  let state00: [unknown, unknown] | undefined = $state(undefined)
  let state01: [unknown, unknown] | undefined = $state(undefined)
  let state10: [unknown, unknown] | undefined = $state(undefined)
  let state11: [unknown, unknown] | undefined = $state(undefined)

  function setFromInput() {
    const parsed = [
      [state00, state10],
      [state01, state11]
    ].map(row => row.map(cell => cell ?? type.zero)) as [unknown, unknown][][]
    onchange(parsed)
  }
</script>

<div class='combined-elements'>
  <Latex text='\left[\rule{"{"}0cm{"}"}{"{"}3em{"}"}\right.'/>
  <div class='matrix-input-container'>
    <div class="matrix-input">
      <type.component emptyIsZero={true} onchange={v => { state00 = v; setFromInput() }} />
      <type.component emptyIsZero={true} onchange={v => { state10 = v; setFromInput() }} />
      <type.component emptyIsZero={true} onchange={v => { state01 = v; setFromInput() }} />
      <type.component emptyIsZero={true} onchange={v => { state11 = v; setFromInput() }} />
    </div>
  </div>
  <Latex text='\left.\rule{"{"}0cm{"}"}{"{"}3em{"}"}\right]'/>
</div>