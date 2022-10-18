<script lang='ts'>
  import { cached } from '../UI/cached'

  import Latex from '../UI/Latex.svelte'
  import { InteractionState, TreeOptions, TreeRenderer } from "./TreeRenderer"

  export let p: number
  export let depth: number

  export let width: number
  export let height: number

  export let options: TreeOptions

  let canvas: HTMLCanvasElement
  let dpr: number = window.devicePixelRatio

  const hitBoxInfo = cached<InteractionState | undefined>(
    undefined,
    (a, b) => a === b || (a !== undefined && b !== undefined && a.display === b.display && a.imageKey === b.imageKey)
  )
  let mousemove = (e: MouseEvent) => {}

  let tooltip: HTMLElement
  let tooltipText: string

  let _options: TreeOptions
  $: _options = {...options, hitbox: true, highlight: $hitBoxInfo?.imageKey}

  function render(p: number, depth: number, options: TreeOptions, canvas: HTMLCanvasElement) {
    if (!canvas) return
    options = {...options, hitbox: true, highlight: $hitBoxInfo?.imageKey}
    let tree = new TreeRenderer(p, depth, options, width, height)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    
    ctx.save()
    ctx.scale(dpr, dpr)
    tree.render(ctx, 0)
    ctx.restore()

    mousemove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.x - rect.left)*canvas.width/rect.width/dpr
      const y = (e.y - rect.top)*canvas.height/rect.height/dpr
      const results = tree.hitBoxes.search(x, y, x, y)
      if (results.length > 0) {
        const i = results[0]
        hitBoxInfo.set(tree.hitBoxMap[i])
        tooltip.style.left = `${e.pageX}px`
        tooltip.style.top = `${e.pageY - 10}px`
      } else {
        hitBoxInfo.set(undefined)
      }
    }
  }
  $: tooltipText = $hitBoxInfo?.display || ''
  $: if (tooltip) tooltip.style.visibility = tooltipText ? 'visible' : 'hidden'

  $: requestAnimationFrame(_ => render(p, depth, _options, canvas))
</script>

<canvas class='tree-canvas'
  style={`width: 100%; max-width: ${width}px; max-height: ${height}px`}
  bind:this={canvas}
  width={width*dpr}
  height={height*dpr}
  on:mousemove={mousemove}
></canvas>
<div class='tooltip' bind:this={tooltip}>
  <div class='tooltip-content'>
    <Latex bind:text={tooltipText}/>
  </div>
</div>

<style lang="scss">
  .tooltip {
    position:absolute;
    visibility: hidden;
    z-index: 1;
    pointer-events: none;
  }

  .tooltip-content {
    font-size: 14px;
    background-color: var(--bgColor);
    border: 1px solid var(--borderColor);
    color: var(--textColor);
    border-radius: 4px;
    position: absolute;
    bottom: 100%;
    transform:translateX(-50%);
    width: max-content;
    text-align: center;
    padding: 5px;
  }
</style>
