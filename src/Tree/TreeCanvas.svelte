<script lang='ts'>
  import Latex from '../UI/Latex.svelte'
  import { TreeOptions, TreeRenderer } from "./TreeRenderer"

  export let p: number
  export let depth: number

  export let width: number
  export let height: number

  export let options: TreeOptions

  let canvas: HTMLCanvasElement
  let dpr: number = window.devicePixelRatio

  let target: string | undefined = undefined
  let mousemove = (e: MouseEvent) => {}

  let tooltip: HTMLElement
  let tooltipText: string

  function render(p: number, depth: number, options: TreeOptions, canvas: HTMLCanvasElement) {
    if (!canvas) return
    options = {...options, hitbox: true}
    let tree = new TreeRenderer(p, depth, options, width, height)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    
    ctx.save()
    ctx.scale(dpr, dpr)
    tree.render(ctx, 0)
    ctx.restore()

    mousemove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.x - rect.left
      const y = e.y - rect.top
      const results = tree.hitBoxes.search(x, y, x, y)
      if (results.length > 0) {
        const i = results[0]
        const newTarget = tree.hitBoxValues[i]
        if (target !== newTarget) {
          target = newTarget
          tooltip.style.left = `${e.pageX}px`
          tooltip.style.top = `${e.pageY - 10}px`
        }
      } else {
        target = undefined
      }
    }
  }
  $: tooltipText = target || ''
  $: if (tooltip) tooltip.style.visibility = tooltipText ? 'visible' : 'hidden'

  $: render(p, depth, options, canvas)
</script>

<canvas
  style={`width: ${width}px; height: ${height}px`}
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

<style>
  canvas {
    background-color: black;
  }

  .tooltip {
    position:absolute;
    visibility: hidden;
    z-index: 1;
    pointer-events: none;
  }

  .tooltip-content {
    font-size: 14px;
    background-color: black;
    border: 1px solid white;
    color: white;
    border-radius: 4px;
    position: absolute;
    bottom: 100%;
    transform:translateX(-50%);
    width: max-content;
    text-align: center;
    padding: 5px;
  }
</style>
