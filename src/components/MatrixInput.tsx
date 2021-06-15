import React from "react"
import { MathJax } from "./MathJax";

interface MatrixInputProps {
  value: string[],
  onChange: (value: string[]) => void,
  className?: string
}

export const MatrixInput = (props: MatrixInputProps) => {
  const setArrValidated = (s: string, index: number) => {
    if (/^-?\d*$/.test(s)) {
      const arr = [...props.value]
      arr[index] = s
      props.onChange(arr)
    }
  }

  return(
    <div className={'matrix-input-container ' + props.className}>
      <MathJax tex={String.raw`\left[\rule{0cm}{1.4cm}\right.`} />
      <div className="matrix-input">
        <input type='text' value={props.value[0]} onChange={e => setArrValidated(e.target.value, 0)}/>
        <input type='text' value={props.value[1]} onChange={e => setArrValidated(e.target.value, 1)}/>
        <input type='text' value={props.value[2]} onChange={e => setArrValidated(e.target.value, 2)}/>
        <input type='text' value={props.value[3]} onChange={e => setArrValidated(e.target.value, 3)}/>
      </div>
      <MathJax tex={String.raw`\left.\rule{0cm}{1.4cm}\right]`} />
    </div>
  )
}