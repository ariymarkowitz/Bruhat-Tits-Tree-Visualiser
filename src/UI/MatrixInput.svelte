<script lang="ts" module>
  const characteristics = {
    zero: {
      component: RationalInput,
      zero: [0, 1]
    },
    nonzero: {
      component: RationalPolyInput,
      zero: [[], [1]]
    }
  } as const

  const leftBracket = String.raw`\left[\rule{0cm}{3em}\right.`
  const rightBracket = String.raw`\left.\rule{0cm}{3em}\right]`
</script>
<script lang="ts">
  import RationalInput from "./RationalInput.svelte";
  import RationalPolyInput from './RationalPolyInput.svelte';
  import Latex from './Latex.svelte';

  type Cell = [unknown, unknown] | undefined

  type MatrixInputProps = {
    characteristic: keyof typeof characteristics,
    onchange?: (value: [unknown, unknown][][] | undefined) => void
  }
  let { characteristic, onchange = _ => {} }: MatrixInputProps = $props()
  let type = $derived(characteristics[characteristic])

  // The four inputs, in the order they are laid out: top row, then bottom row.
  let cells: Cell[] = $state([undefined, undefined, undefined, undefined])

  function setCell(index: number, value: Cell) {
    cells[index] = value
    const parsed = [
      [cells[0], cells[1]],
      [cells[2], cells[3]]
    ].map(row => row.map(cell => cell ?? type.zero)) as [unknown, unknown][][]
    onchange(parsed)
  }
</script>

<div class='combined-elements'>
  <Latex text={leftBracket}/>
  <div class='matrix-input-container'>
    <div class="matrix-input">
      {#each cells as _, i}
        <type.component emptyIsZero={true} onchange={v => setCell(i, v)} />
      {/each}
    </div>
  </div>
  <Latex text={rightBracket}/>
</div>
