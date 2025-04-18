<script lang='ts'>
  import { Adic } from '../algebra/Adic/Adic';
  import { LaurentField } from '../algebra/Adic/LaurentField';
  import type { DVField } from '../algebra/Field/DVField';
  import Latex from '../ui/Latex.svelte'
  import { memoize } from '../utils/memoize.svelte';
  import { type InteractionState, type TreeOptions, TreeRenderer } from "./TreeRenderer"

  type TreeCanvasProps = {
    characteristic: "zero" | "nonzero"
    p: number
    depth: number
    width: number
    height: number
    options: TreeOptions<unknown>
  }

  const { characteristic, p, depth, width, height, options }: TreeCanvasProps = $props()

  let canvas: HTMLCanvasElement
  let dpr: number = $state(window.devicePixelRatio)

  const hitBoxInfo = memoize<InteractionState | undefined>(
    undefined,
    (a, b) => a === b || (a !== undefined && b !== undefined && a.display === b.display && a.imageKey === b.imageKey)
  )
  let mousemove: (e: MouseEvent) => void = $state(_ => {})

  let tooltip: HTMLElement
  let tooltipText: string = $derived(hitBoxInfo.get()?.display || '')
  $effect(() => {
    if (tooltip) tooltip.style.visibility = tooltipText ? 'visible' : 'hidden'
  })

  let field: DVField<unknown, unknown> = $derived(
    characteristic === "zero" ? new Adic(p) : new LaurentField(p)
  )

  let _options: TreeOptions<unknown> = $derived({
    ...options,
    end: options.showEnd ? options.end : undefined,
    isometry: options.showIsometry ? options.isometry : undefined,
    hitbox: true,
    highlight: hitBoxInfo.get()?.imageKey
  })

  function render<F, R>(field: DVField<F, R>, depth: number, options: TreeOptions<R>, canvas: HTMLCanvasElement) {
    if (!canvas) return
    options = {...options, hitbox: true, highlight: hitBoxInfo.get()?.imageKey}
    let tree = new TreeRenderer(field, depth, options, width, height)
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

  function startRender<F, R>(field: DVField<F, R>, depth: number, options: TreeOptions<R>, canvas: HTMLCanvasElement): number {
    return requestAnimationFrame(_ => render(field, depth, options, canvas))
  }
  $effect(() => {
    const n = startRender(field, depth, _options, canvas)
    return () => cancelAnimationFrame(n)
  })
</script>

<canvas class='tree-canvas'
  style={`width: 100%; max-width: ${width}px; max-height: ${height}px`}
  bind:this={canvas}
  width={width*dpr}
  height={height*dpr}
  onmousemove={mousemove}
></canvas>
<div class='tooltip' bind:this={tooltip}>
  <div class='tooltip-content'>
    <Latex text={tooltipText}/>
  </div>
</div>

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
