<script lang='ts'>
  import { onMount } from "svelte"
  import { TreeOptions, TreeRenderer } from "./TreeRenderer"

  export let p: number
  export let depth: number

  export let width: number
  export let height: number

  export let options: TreeOptions

  let tree: TreeRenderer
  $: tree = new TreeRenderer(p, depth, options, width, height)

  let canvas: HTMLCanvasElement
  let dpr: number = window.devicePixelRatio

  onMount(() => {
    if (!canvas) return
    if (!tree) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    let t = 0

    let frame = requestAnimationFrame(anim)
    function anim(){
      ctx.save()
      ctx.scale(dpr, dpr)
      tree.render(ctx, t)
      ctx.restore()
      t += 1000 / 60
      frame = requestAnimationFrame(anim);
    }

    return () => cancelAnimationFrame(frame)
  })
</script>

<canvas
  style={`width: ${width}px; height: ${height}px`}
  bind:this={canvas}
  width={width*dpr}
  height={height*dpr}
></canvas>

<style>
  canvas {
    background-color: black;
  }
</style>
