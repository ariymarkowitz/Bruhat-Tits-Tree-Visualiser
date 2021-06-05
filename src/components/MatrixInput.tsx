import React, { useState } from "react"

type props = {
  value: string[],
  onChange: (value: string[]) => void
}

export const MatrixInput = (props: props) => {
  const setArrValidated = (s: string, index: number) => {
    const n = Number.parseInt(s)
    if (Number.isInteger(n) || s === '-') {
      const arr = [...props.value]
      arr[index] = s
      props.onChange(arr)
    }
  }

  return(
    <div className="matrix-input-container">
      <input value={props.value[0]} onChange={e => setArrValidated(e.target.value, 0)}/>
      <input value={props.value[1]} onChange={e => setArrValidated(e.target.value, 1)}/>
      <input value={props.value[2]} onChange={e => setArrValidated(e.target.value, 2)}/>
      <input value={props.value[3]} onChange={e => setArrValidated(e.target.value, 3)}/>
    </div>
  )
}