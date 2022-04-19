<script lang='ts'>
import RationalInput from "./RationalInput.svelte";

export let state: [number, number][][] | undefined = undefined
let state00: [number, number] | undefined
let state01: [number, number] | undefined
let state10: [number, number] | undefined
let state11: [number, number] | undefined

$: if (state00 && state01 && state10 && state11) {
  state = [[state00, state10], [state01, state11]]
} else {
  state = undefined
}
</script>

<div class='matrix-input-container'>
  <div class="matrix-input">
    <RationalInput bind:state={state00} emptyIsZero={true}/>
    <RationalInput bind:state={state01} emptyIsZero={true}/>
    <RationalInput bind:state={state10} emptyIsZero={true}/>
    <RationalInput bind:state={state11} emptyIsZero={true}/>
  </div>
</div>