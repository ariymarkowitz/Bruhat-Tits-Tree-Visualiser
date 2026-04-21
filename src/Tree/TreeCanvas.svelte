<script lang='ts'>
  import { Adic } from '../algebra/Adic/Adic';
  import { LaurentField } from '../algebra/Adic/LaurentField';
  import type { DVField } from '../algebra/Field/DVField';
  import Latex from '../ui/Latex.svelte'
  import { type InteractionState, type TreeOptions, TreeRenderer } from "./TreeRenderer"
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'

  type TreeCanvasProps = {
    mode: "static" | "animate" | "download"
    characteristic: "zero" | "nonzero"
    p: number
    depth: number
    width: number
    height: number
    options: TreeOptions<unknown>
    resolution?: number
    oncomplete?: () => void
  }

  const { mode, characteristic, p, depth, width, height, options, resolution = 1, oncomplete = () => {} }: TreeCanvasProps = $props()

  let canvas: HTMLCanvasElement
  const dpr = window.devicePixelRatio

  let hitBoxInfo = $state.raw<InteractionState | undefined>(undefined)
  function setHitBoxInfo(val: InteractionState | undefined) {
    const prev = hitBoxInfo
    if (!(prev === val || (prev !== undefined && val !== undefined && prev.display === val.display && prev.imageKey === val.imageKey))) {
      hitBoxInfo = val
    }
  }
  let mousemove: (e: MouseEvent) => void = $state(_ => {})

  let tooltip: HTMLElement | undefined = $state()
  let tooltipText: string = $derived(hitBoxInfo?.display || '')
  $effect(() => {
    if (tooltip) tooltip.style.visibility = tooltipText ? 'visible' : 'hidden'
  })

  const field: DVField<unknown, unknown> = $derived(
    characteristic === "zero" ? new Adic(p) : new LaurentField(p)
  )

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    if (mode === "static") {
      const _options: TreeOptions<unknown> = {
        ...options,
        end: options.showEnd ? options.end : undefined,
        isometry: options.showIsometry ? options.isometry : undefined,
        hitbox: true,
        highlight: hitBoxInfo?.imageKey
      }
      const tree = new TreeRenderer(field, depth, _options, width, height)
      const frame = requestAnimationFrame(() => {
        ctx.save()
        ctx.scale(dpr, dpr)
        tree.render(ctx, 0)
        ctx.restore()
        mousemove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect()
          const x = (e.x - rect.left) * canvas.width / rect.width / dpr
          const y = (e.y - rect.top) * canvas.height / rect.height / dpr
          const results = tree.hitBoxes.search(x, y, x, y)
          if (results.length > 0) {
            const i = results[0]
            setHitBoxInfo(tree.hitBoxMap[i])
            tooltip!.style.left = `${e.pageX}px`
            tooltip!.style.top = `${e.pageY - 10}px`
          } else {
            setHitBoxInfo(undefined)
          }
        }
      })
      return () => cancelAnimationFrame(frame)
    }

    const scaledDpr = dpr * resolution
    const tree = new TreeRenderer(field, depth, options, width, height, resolution)

    if (mode === "animate") {
      let prevTime = 0
      let t = 0
      let frame = requestAnimationFrame(anim)
      function anim(time: number) {
        t += Math.min(time - prevTime, 1000 / 10)
        prevTime = time
        ctx.save()
        ctx.scale(scaledDpr, scaledDpr)
        tree.render(ctx, t)
        ctx.restore()
        frame = requestAnimationFrame(anim)
      }
      return () => cancelAnimationFrame(frame)
    }

    // download mode
    const zip = new JSZip()
    let f = 0
    let t = 0
    let done = false
    let frame = requestAnimationFrame(anim)
    function anim() {
      ctx.save()
      ctx.scale(scaledDpr, scaledDpr)
      tree.render(ctx, t)
      ctx.restore()
      if (done) {
        zip.generateAsync({ type: "blob" }).then(blob => {
          saveAs(blob, "tree.zip")
          oncomplete()
        })
        return
      }
      const imgURL = canvas.toDataURL('image/png')
      zip.file(`${f}.png`, imgURL.split('base64,')[1], { base64: true })
      if (t >= tree.loopTime) {
        done = true
        t = 0
      } else {
        f += 1
        t += 1000 / 60
      }
      frame = requestAnimationFrame(anim)
    }
    return () => cancelAnimationFrame(frame)
  })
</script>

<canvas class='tree-canvas'
  style={`width: 100%; max-width: ${width}px; max-height: ${height}px`}
  bind:this={canvas}
  width={mode === "static" ? width * dpr : width * dpr * resolution}
  height={mode === "static" ? height * dpr : height * dpr * resolution}
  onmousemove={mode === "static" ? mousemove : undefined}
></canvas>
{#if mode === "static"}
<div class='tooltip' bind:this={tooltip}>
  <div class='tooltip-content'>
    <Latex text={tooltipText}/>
  </div>
</div>
{/if}

<style lang="css">
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
