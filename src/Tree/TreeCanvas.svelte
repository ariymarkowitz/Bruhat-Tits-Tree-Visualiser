<script lang='ts'>
  import { TreeOptions, TreeRenderer } from "./TreeRenderer"

  export let p: number
  export let depth: number

  export let width: number
  export let height: number

  export let options: TreeOptions

  let canvas: HTMLCanvasElement
  let dpr: number = window.devicePixelRatio

  function render(p: number, depth: number, options: TreeOptions, canvas: HTMLCanvasElement) {
    if (!canvas) return
    let tree = new TreeRenderer(p, depth, options, width, height)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    
    ctx.save()
    ctx.scale(dpr, dpr)
    tree.render(ctx, 0)
    ctx.restore()

    // let f = 0
    // let t = 0

    // const zip = new JSZip();

    // let frame = requestAnimationFrame(anim)
    // function anim(){
    //   tree.render(ctx, t)
    //   const imgURL = canvas.toDataURL('image/png')
    //   zip.file(`${f}.png`, imgURL.split('base64,')[1],{base64:true})

    //   if (t >= tree.loopTime) {
    //     zip.generateAsync({type:"blob"})
    //     .then(function (blob) {
    //         saveAs(blob, "tree.zip");
    //     });
    //   } else {
    //     f += 1
    //     t += 1000 / 60
    //     frame = requestAnimationFrame(anim);
    //   }
    // }

    // return () => cancelAnimationFrame(frame)
  }

  $: render(p, depth, options, canvas)
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
