import React, { useEffect, useState } from "react"
import { MathJax } from "./MathJax"

interface TooltipProps {
  x: number,
  y: number,
  text?: string,
  visible?: boolean,
}

export const Tooltip = (props: TooltipProps) => {
  const _visible = props.visible ?? true

  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({x: props.x, y: props.y})
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    if (update) {
      setPos({x: props.x, y: props.y})
    }
  }, [update, props.x, props.y])

  useEffect(() => {
    if (update) {
      setVisible(_visible)
    }
  }, [update, _visible])

  return (
    <div className="tooltip" style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      display: visible ? undefined : 'none'
    }}>{
      props.text
        ? <MathJax tex={props.text}
          beforeTypeset={() => setUpdate(false)}
          onTypeset={() => setUpdate(true)}
        />
        : undefined
    }</div>
  )
}