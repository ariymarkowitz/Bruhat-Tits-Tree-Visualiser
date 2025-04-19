<script lang='ts'>
  import { onMount } from "svelte"
  import { type TreeOptions, TreeRenderer } from "./TreeRenderer"
  import type { DVField } from '../algebra/Field/DVField';
  import { Adic } from '../algebra/Adic/Adic';
  import { FunctionField } from '../algebra/Adic/FunctionField';

  type TreeCanvasProps = {
    characteristic: "zero" | "nonzero"
    p: number
    depth: number
    width: number
    height: number
    resolution: number
    options: TreeOptions<unknown>
  }
  const { characteristic, p, depth, width, height, resolution = 1, options }: TreeCanvasProps = $props()
  let field: DVField<unknown, unknown> = $derived(
    characteristic === "zero" ? new Adic(p) : new FunctionField(p)
  )
  let tree: TreeRenderer<unknown, unknown> = $derived(new TreeRenderer(field, depth, options, width, height, resolution))
  let canvas: HTMLCanvasElement

  onMount(() => {
    if (!canvas) return
    if (!tree) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    let prevTime = 0
    let t = 0

    let frame = requestAnimationFrame(anim)
    function anim(time: number){
      // Only update time by 100ms if there is too much time between rendering.
      t += Math.min(time - prevTime, 1000 / 10)
      prevTime = time

      const dpr = window.devicePixelRatio * resolution
      ctx.save()
      ctx.scale(dpr, dpr)
      tree.render(ctx, t)
      ctx.restore()

      frame = requestAnimationFrame(anim);
    }

    return () => cancelAnimationFrame(frame)
  })
</script>

<canvas class='tree-canvas'
  style={`width: 100%; max-width: ${width}px; max-height: ${height}px`}
  bind:this={canvas}
  width={width*window.devicePixelRatio * resolution}
  height={height*window.devicePixelRatio * resolution}
></canvas>
