import { MathJax, MathJaxContext } from "better-react-mathjax";
import React, { createContext, useEffect, useState } from "react"

type tooltipProps = {
  x: number,
  y: number,
  text?: string,
  visible?: boolean,
}

export const Tooltip = (props: tooltipProps) => {
  const [pos, setPos] = useState({x: 0, y: 0})
  const [visible, setVisible] = useState(false) 

  useEffect(() => {
    if (visible !== true) {
      setVisible(false)
    }
  }, [visible])

  return (
    <MathJaxContext hideUntilTypeset={'first'}>
      <div className="tooltip" style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        display: props.visible ? undefined : 'none'
      }}>
        <MathJax dynamic onTypeset={() => {
          if (props.x && props.y) setPos({x: props.x, y: props.y})
          if (visible) setVisible(true)
        }}>
          {props.text}
        </MathJax>
      </div>
    </MathJaxContext>
  )
}