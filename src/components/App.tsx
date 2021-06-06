import React, { useEffect, useState } from 'react';
import { isPrime } from '../utils';
import { TreeView } from './TreeComponent';
import { MatrixInput } from './MatrixInput';
import NumericInput from "react-numeric-input";

function primeStep(component: NumericInput, direction: string) {
  const n = component.state.value
  if (n == null) return 1
  if (direction === NumericInput.DIRECTION_UP) {
    let step = 1
    while (!isPrime(n + step)) step++
    return step
  } else if (n <= 2) {
    return 0
  } else {
    let step = 1
    while (!isPrime(n - step)) step++
    return step
  }
}

function parseEnd(s: string): [number, number] | undefined {
  // Match 'a / b', where a and b are integers.
  const matches = /^(?<num>-?\d+) *(\/ *(?<den>-?\d+) *)?$/.exec(s)
  if (!matches || !matches.groups) return undefined
  const g = matches.groups
  if (g.num) {
    const num = Number(matches.groups.num)
    if (g.den) {
      const den = Number(matches.groups.den)
      if (num === 0 && den === 0) return undefined
      return [den, num]
    } else {
      return [1, num]
    }
  } else {
    return undefined
  }
}

const App = () => {
  const [inputP, setInputP] = useState<string>('2')
  const [p, setP] = useState<number>(2)

  const [inputDepth, setInputDepth] = useState([7, p])

  const [showEnd, setShowEnd] = useState(false)

  const [inputEnd, setInputEnd] = useState<string>('')
  const [end, setEnd] = useState<[number, number] | undefined>(undefined)

  const [showIso, setShowIso] = useState(false)

  const [inputIso, setInputIso] = useState<string[]>(['1', '0', '0', '1'])
  const [iso, setIso] = useState<number[][] | undefined>(undefined)

  useEffect(() => {
    const newP = Number.parseInt(inputP)
    if (Number.isInteger(newP) && isPrime(newP)) {
      setP(newP)
    }
  }, [inputP])

  useEffect(() => {
    setEnd(parseEnd(inputEnd))
  }, [inputEnd])

  useEffect(() => {
    if (inputIso.length === 4) {
      const m = inputIso.map(Number)
      console.log(m)
      if (m.every(Number.isInteger)) {
        setIso([[m[0],m[2]],[m[1],m[3]]])
      } else {
        setIso(undefined)
      }
    } else {
      setIso(undefined)
    }
  }, [inputIso])

  const validateDepth = (n: string) => {
    const v = Number.parseInt(n)
    if (Number.isInteger(v)) {
      setInputDepth([v, p])
    }
  }

  const validateEnd = (s: string) => {
    // Match a substring of 'a / b', where a and b are integers.
    if (/^-?\d* *(\/ *-?\d*)?$/.test(s)) {
      setInputEnd(s)
    }
  }

  let depth
  if (inputDepth[0] <= 1) {
    depth = 1
  } else {
    depth = Math.max(2, Math.min(inputDepth[0], Math.floor(inputDepth[0] * (inputDepth[1]+1) / (p+1))))
  }

  return (
    <div className='container'>
      <div className='tree-container'>
        <TreeView p={p} depth={depth} end={showEnd ? end : undefined} iso={showIso ? iso : undefined} />
      </div>
      <div className='sidebar'>
          <div className='sidebar-row'>
            <label htmlFor='p'>p</label>
            <NumericInput name={'p'} value={inputP} min={2} max={10} step={primeStep}
              onChange={(_, s) => setInputP(s)} style={false} />
          </div>
          <div className='sidebar-row'>
            <label htmlFor='Depth'>Depth</label>
            <NumericInput name='Depth' value={depth} min={1} max={10}
              onChange={(_, s) => validateDepth(s)} style={false} />
          </div>
          <div className='sidebar-row'>
            <div>
              <input type='checkbox' checked={showEnd} onChange={e => setShowEnd(e.target.checked)} />
              <label htmlFor='End'>End</label>
            </div>
            <input type='text' name='End' value = {inputEnd}
              onChange={e => validateEnd(e.target.value)} className={showEnd ? undefined : 'disabled'} />
          </div>
          <div className='sidebar-row'>
            <div>
              <input type='checkbox' checked={showIso} onChange={e => setShowIso(e.target.checked)} />
              <label>Isometry</label>
            </div>
            <MatrixInput value={inputIso} onChange={m => setInputIso(m)} className={showIso ? undefined : 'disabled'} />
          </div>
      </div>
    </div>
  );
};

export default App;