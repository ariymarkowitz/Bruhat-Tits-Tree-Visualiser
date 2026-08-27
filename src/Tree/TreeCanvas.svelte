<script lang='ts' module>
  export type Characteristic = "zero" | "nonzero"
  export type Mode = "static" | "animate" | "download"
</script>

<script lang='ts'>
  import { Adic } from '../algebra/Adic/Adic';
  import { LaurentField } from '../algebra/Adic/LaurentField';
  import type { DVField } from '../algebra/Field/DVField';
  import Latex from '../ui/Latex.svelte'
  import { memoize } from '../utils/memoize.svelte'
  import { type InteractionState, type TreeOptions, TreeRenderer } from "./TreeRenderer"
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'

  type TreeCanvasProps = {
    mode: Mode
    characteristic: Characteristic
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
  const canvasScale = $derived(mode === "static" ? dpr : dpr * resolution)

  const field: DVField<unknown, unknown> = $derived(
    characteristic === "zero" ? new Adic(p) : new LaurentField(p)
  )

  // Only the static tree uses the show flags.
  // An animated tree runs whether or not its isometry is drawn.
  const staticTree = $derived.by(() => mode !== "static" ? undefined : new TreeRenderer(field, depth, {
    ...options,
    end: options.showEnd ? options.end : undefined,
    isometry: options.showIsometry ? options.isometry : undefined,
    hitbox: true
  }, width, height))

  // The renderer of the frame currently on screen, used to hit-test the mouse.
  // Only set in static mode, once the hit boxes have been filled in by a render.
  let hitTree = $state.raw<TreeRenderer<unknown, unknown> | undefined>(undefined)

  // Don't rerender the canvas if the hit box hasn't changed.
  function sameHitBox(a: InteractionState | undefined, b: InteractionState | undefined) {
    return a === b || (a !== undefined && b !== undefined
      && a.display === b.display && a.imageKey === b.imageKey)
  }
  const hitBox = memoize<InteractionState | undefined>(undefined, sameHitBox)

  let tooltip: HTMLElement | undefined = $state()
  const tooltipText: string = $derived(hitBox.get()?.display || '')

  function onMouseMove(e: MouseEvent) {
    if (!hitTree || !tooltip) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.x - rect.left) * canvas.width / rect.width / canvasScale
    const y = (e.y - rect.top) * canvas.height / rect.height / canvasScale
    const results = hitTree.hitBoxes?.search(x, y, x, y)
    if (results && results.length > 0) {
      hitBox.set(hitTree.hitBoxMap?.[results[0]])
      tooltip.style.left = `${e.pageX}px`
      tooltip.style.top = `${e.pageY - 10}px`
    } else {
      hitBox.set(undefined)
    }
  }

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    switch (mode) {
      case "static": return renderStatic(ctx)
      case "animate": return renderAnimation(ctx)
      case "download": return renderDownload(ctx)
    }
  })

  function renderStatic(ctx: CanvasRenderingContext2D) {
    const tree = staticTree
    if (!tree) return
    tree.highlight = hitBox.get()?.imageKey

    const frame = requestAnimationFrame(() => {
      tree.render(ctx, 0)
      hitTree = tree
    })
    return () => cancelAnimationFrame(frame)
  }

  function renderAnimation(ctx: CanvasRenderingContext2D) {
    const tree = new TreeRenderer(field, depth, options, width, height, resolution)

    let prevTime = 0
    let t = 0
    let frame = requestAnimationFrame(anim)
    function anim(time: number) {
      t += Math.min(time - prevTime, 1000 / 10)
      prevTime = time
      tree.render(ctx, t)
      frame = requestAnimationFrame(anim)
    }
    return () => cancelAnimationFrame(frame)
  }

  function renderDownload(ctx: CanvasRenderingContext2D) {
    const tree = new TreeRenderer(field, depth, options, width, height, resolution)

    const zip = new JSZip()
    let f = 0
    let t = 0
    let frame = requestAnimationFrame(anim)
    function anim() {
      tree.render(ctx, t)
      const imgURL = canvas.toDataURL('image/png')
      zip.file(`${f}.png`, imgURL.split('base64,')[1], { base64: true })

      if (t >= tree.loopTime) {
        zip.generateAsync({ type: "blob" }).then(blob => {
          saveAs(blob, "tree.zip")
          oncomplete()
        })
        return
      }
      f += 1
      t += 1000 / 60
      frame = requestAnimationFrame(anim)
    }
    return () => cancelAnimationFrame(frame)
  }
</script>

<canvas class='tree-canvas'
  style={`--tree-max-width: ${width}px; --tree-aspect: ${width / height}`}
  bind:this={canvas}
  width={width * canvasScale}
  height={height * canvasScale}
  onmousemove={mode === "static" ? onMouseMove : undefined}
></canvas>
{#if mode === "static"}
<div class='tooltip' bind:this={tooltip} style:visibility={tooltipText ? 'visible' : 'hidden'}>
  <div class='tooltip-content'>
    <Latex text={tooltipText} displayStyle={true}/>
  </div>
</div>
{/if}

<style lang="css">
  /* Fit the canvas to the viewport up to its natural size */
  .tree-canvas {
    width: min(100%, var(--tree-max-width), calc((100vh - 20px) * var(--tree-aspect)));
    width: min(100%, var(--tree-max-width), calc((100dvh - 20px) * var(--tree-aspect)));
    height: auto;
  }

  .tooltip {
    position:absolute;
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
