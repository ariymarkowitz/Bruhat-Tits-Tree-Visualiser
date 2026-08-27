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
  import { inputValue } from './inputValue.svelte';

  type Matrix = [unknown, unknown][][] | undefined
  type Cell = [unknown, unknown] | undefined

  type MatrixInputProps = {
    characteristic: keyof typeof characteristics,
    value?: Matrix,
    onchange?: (value: Matrix) => void
  }
  let { characteristic, value = undefined, onchange = _ => {} }: MatrixInputProps = $props()
  let type = $derived(characteristics[characteristic])

  // The display is the four cells, in the order they are laid out: top row, then bottom.
  const input = inputValue({
    value: () => value,
    format: cellsOf,
    // MatrixAlgebra stores matrices column-wise, so we transpose the entered matrix
    // (rows [a, b] and [c, d]) to get the isometry u -> (c + d*u)/(a + b*u). A cell the
    // user has not finished typing reports as zero, but stays undefined in the display.
    parse: cells => [
      [cells[0], cells[2]],
      [cells[1], cells[3]]
    ].map(row => row.map(cell => cell ?? type.zero)) as Matrix,
    onchange
  })

  function setCell(index: number, cell: Cell) {
    input.display[index] = cell
    input.commit()
  }

  function cellsOf(matrix: Matrix): Cell[] {
    return [matrix?.[0][0], matrix?.[1][0], matrix?.[0][1], matrix?.[1][1]]
  }
</script>

<div class='combined-elements'>
  <Latex text={leftBracket}/>
  <div class='matrix-input-container'>
    <div class="matrix-input">
      {#each input.display as cell, i}
        <!-- A cell's type depends on the characteristic, which the props of a dynamic
             component cannot express. -->
        <type.component emptyIsZero={true} value={cell as never} onchange={v => setCell(i, v)} />
      {/each}
    </div>
  </div>
  <Latex text={rightBracket}/>
</div>
