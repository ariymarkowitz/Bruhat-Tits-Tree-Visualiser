import React from "react"

import { MathComponent } from 'mathjax-react'

type props = {
  value: string[],
  onChange: (value: string[]) => void,
  className?: string
}

export const MatrixInput = (props: props) => {
  const setArrValidated = (s: string, index: number) => {
    if (/^-?\d*$/.test(s)) {
      const arr = [...props.value]
      arr[index] = s
      props.onChange(arr)
    }
  }

  return(
    <div className={'matrix-input-container ' + props.className}>
      <MathComponent tex={String.raw`\left[\rule{0cm}{1.4cm}\right.`} display={false} />
      <div className="matrix-input">
        <input type='text' value={props.value[0]} onChange={e => setArrValidated(e.target.value, 0)}/>
        <input type='text' value={props.value[1]} onChange={e => setArrValidated(e.target.value, 1)}/>
        <input type='text' value={props.value[2]} onChange={e => setArrValidated(e.target.value, 2)}/>
        <input type='text' value={props.value[3]} onChange={e => setArrValidated(e.target.value, 3)}/>
      </div>
      <MathComponent tex={String.raw`\left.\rule{0cm}{1.4cm}\right]`} display={false} />
    </div>
  )
}