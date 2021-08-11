// Adapted from https://gist.github.com/GiacoCorsiglia/1619828473f4b34d3d914a16fcbf10f3.

import React, { useLayoutEffect, useRef, useState } from "react"

interface MathProps {
  tex: string,
  display?: boolean,
  beforeTypeset?: () => void
  onTypeset?: () => void
}

export function MathJax({ tex, display = false, beforeTypeset, onTypeset }: MathProps) {
  // Store this in local state so we can make the component re-render when
  // it's updated.
  const rootElementRef = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const mathElement = rootElementRef.current
    if (!ready) {
      MathJaxPromise.then(() => setReady(true))
      return
    }
    if (mathElement === null) return

    if (beforeTypeset) beforeTypeset()

    MathJaxPromise.then((MathJaxObject) => {
      MathJaxObject.texReset()

      // Construct options.
      const options = MathJaxObject.getMetricsFor(mathElement)
      options.display = display

      MathJaxObject.tex2svgPromise(tex, options)
      .then((node: SVGElement) => {
        if (onTypeset) onTypeset()
        mathElement.innerHTML = ""
        mathElement.appendChild(node)
      })
      .catch(function (err: Error) {
        console.error(err)
      })
    })
  }, [tex, display, ready])

  return <span ref={rootElementRef} />
}