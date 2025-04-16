<script lang='ts'>
import RationalInput from "./RationalInput.svelte";

export type MatrixInputEvent = CustomEvent<[number, number][][] | undefined>

type MatrixInputProps = Partial<{
  onchange: (e: MatrixInputEvent) => void
}>
let { onchange = _ => {} }: MatrixInputProps = $props()

let state00: [number, number] | undefined = $state(undefined)
let state01: [number, number] | undefined = $state(undefined)
let state10: [number, number] | undefined = $state(undefined)
let state11: [number, number] | undefined = $state(undefined)

function setFromInput() {
  const parsed = [
    [state00, state10],
    [state01, state11]
  ].map(row => row.map(cell => cell ?? [0, 1] as [number, number]))
  onchange(new CustomEvent('change', { detail: parsed }))
}
</script>

<div class='matrix-input-container'>
  <div class="matrix-input">
    <RationalInput emptyIsZero={true} onchange={e => { state00 = e.detail; setFromInput() }}/>
    <RationalInput emptyIsZero={true} onchange={e => { state10 = e.detail; setFromInput() }}/>
    <RationalInput emptyIsZero={true} onchange={e => { state01 = e.detail; setFromInput() }}/>
    <RationalInput emptyIsZero={true} onchange={e => { state11 = e.detail; setFromInput() }}/>
  </div>
</div>