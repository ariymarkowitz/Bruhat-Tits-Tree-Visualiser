<script lang='ts'>
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'
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
    options: TreeOptions<unknown>
    resolution?: number
    oncomplete?: () => void
  }
  const { characteristic, p, depth, width, height, options, resolution = 1, oncomplete = () => {} }: TreeCanvasProps = $props()
  let field: DVField<unknown, unknown> = $derived(
    characteristic === "zero" ? new Adic(p) : new FunctionField(p)
  )
  let tree: TreeRenderer<unknown, unknown> = $derived(new TreeRenderer(field, depth, options, width, height, resolution))
  let canvas: HTMLCanvasElement

  onMount(() => {
    if (!canvas) return
    if (!tree) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    let f = 0
    let t = 0

    let done = false

    const zip = new JSZip();

    let frame = requestAnimationFrame(anim)
    function anim(){
      let dpr = window.devicePixelRatio * resolution
      ctx.save()
      ctx.scale(dpr, dpr)
      tree.render(ctx, t)
      ctx.restore()

      if (done) {
        zip.generateAsync({type:"blob"})
        .then(function (blob) {
            saveAs(blob, "tree.zip")
            oncomplete()
        });
        return
      }
      const imgURL = canvas.toDataURL('image/png')
      zip.file(`${f}.png`, imgURL.split('base64,')[1],{base64:true})
      if (t >= tree.loopTime) {
        done = true
        t = 0
        frame = requestAnimationFrame(anim)
      } else {
        f += 1
        t += 1000 / 60
        frame = requestAnimationFrame(anim)
      }
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
