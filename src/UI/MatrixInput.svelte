<script lang="ts" module>
  export type MatrixInputEvent = CustomEvent<[unknown, unknown][][] | undefined>

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

  type MatrixInputProps = {
    characteristic: keyof typeof characteristics,
    onchange?: (e: MatrixInputEvent) => void
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
    onchange(new CustomEvent('change', { detail: parsed }))
  }
</script>

<div class='matrix-input-container'>
  <div class="matrix-input">
    <type.component emptyIsZero={true} onchange={e => { state00 = e.detail; setFromInput() }} />
    <type.component emptyIsZero={true} onchange={e => { state10 = e.detail; setFromInput() }} />
    <type.component emptyIsZero={true} onchange={e => { state01 = e.detail; setFromInput() }} />
    <type.component emptyIsZero={true} onchange={e => { state11 = e.detail; setFromInput() }} />
  </div>
</div>