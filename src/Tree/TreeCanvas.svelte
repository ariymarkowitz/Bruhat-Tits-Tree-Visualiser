<script lang='ts'>
  import { TreeOptions, TreeRenderer } from "./TreeRenderer"

  export let p: number
  export let depth: number

  export let width: number
  export let height: number

  export let options: TreeOptions

  let canvas: HTMLCanvasElement
  let dpr: number = window.devicePixelRatio

  let target: String | undefined = undefined
  let mousemove = (e: MouseEvent) => {}

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
          console.log(target)
        }
      } else {
        target = undefined
      }
    }
  }

  $: render(p, depth, options, canvas)
</script>

<canvas
  style={`width: ${width}px; height: ${height}px`}
  bind:this={canvas}
  width={width*dpr}
  height={height*dpr}
  on:mousemove={mousemove}
></canvas>

<style>
  canvas {
    background-color: black;
  }
</style>
