import React, { createElement, useState } from "react"
import { MathJax, MathJaxContext } from "better-react-mathjax";

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  }
};

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
      <MathJaxContext hideUntilTypeset={'first'} version={3} config={config} >
        <MathJax>{String.raw`$\left[\rule{0cm}{1.4cm}\right.$`}</MathJax>
        <div className="matrix-input">
          <input type='text' value={props.value[0]} onChange={e => setArrValidated(e.target.value, 0)}/>
          <input type='text' value={props.value[1]} onChange={e => setArrValidated(e.target.value, 1)}/>
          <input type='text' value={props.value[2]} onChange={e => setArrValidated(e.target.value, 2)}/>
          <input type='text' value={props.value[3]} onChange={e => setArrValidated(e.target.value, 3)}/>
        </div>
        <MathJax>{String.raw`$\left.\rule{0cm}{1.4cm}\right]$`}</MathJax>
      </MathJaxContext>
    </div>
  )
}