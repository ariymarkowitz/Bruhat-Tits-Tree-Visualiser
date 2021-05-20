export async function latexToImg(text: string) {
  const MathJax = await loadMathJax
  let options = {
    em: 16,
    ex: 7.25,
    containerWidth: 1000,
    lineWidth: 100,
  };
  const wrapper: HTMLElement = (MathJax as any).tex2svg(text, options)
  const svgElement = wrapper.getElementsByTagName("svg")[0]
  const outerHTML = svgElement.outerHTML
  const blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'})
  const bloburl = window.URL.createObjectURL(blob)

  return await loadImage(bloburl)
}

function loadImage(bloburl: string) {
  return new Promise<HTMLCanvasElement>(resolve => {
    const image = new Image()
    image.onload = () => {
      const dpr = window.devicePixelRatio
      const canvas = document.createElement('canvas');
      canvas.width = image.width * dpr
      canvas.height = image.height * dpr
      const ctx = canvas.getContext('2d')

      if (ctx == null) {
        throw new Error('Canvas context not available')
      }

      ctx.scale(dpr, dpr)
      ctx.drawImage(image, 0, 0)

      invertColors(canvas)

      resolve(canvas)
    }
    image.src = bloburl
  })
}

function invertColors(canvas: HTMLCanvasElement) {
  if (canvas.width === 0 || canvas.height === 0) return
  
  const ctx = canvas.getContext('2d')
  if (ctx == null) throw new Error('Canvas context not available')

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
  }
  ctx.putImageData(imageData, 0, 0);
}