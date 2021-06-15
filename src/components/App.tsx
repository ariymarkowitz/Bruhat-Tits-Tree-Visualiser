import React, { useEffect, useMemo, useState } from 'react';
import { isPrime } from '../utils/utils';
import { TreeComponentOptions, TreeView } from './TreeComponent';
import { MatrixInput } from './MatrixInput';
import NumericInput from "react-numeric-input";
import { Tooltip } from './Tooltip';
import { LabelWithCheckbox, Sidebar, SidebarLeft, SidebarRight, SidebarRow } from './Sidebar';

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

  const [showInfEnd, setShowInfEnd] = useState(false)
  const [showRootImage, setShowRootImage] = useState(false)

  const [inputIso, setInputIso] = useState<string[]>(['1', '0', '0', '1'])
  const [iso, setIso] = useState<number[][] | undefined>(undefined)

  const [tooltipPos, setTooltipPos] = useState({x: 0, y: 0})
  const [tooltipText, setTooltipText] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)

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

  let depth: number
  if (inputDepth[0] <= 1) {
    depth = 1
  } else {
    depth = Math.max(2, Math.min(inputDepth[0], Math.floor(inputDepth[0] * (inputDepth[1]+1) / (p+1))))
  }

  const options: TreeComponentOptions = useMemo(() => ({
    depth: depth,
    end: showEnd ? end : undefined,
    iso: showIso ? iso : undefined,
    showInfEnd: showInfEnd,
    showRootImage: showRootImage,
  }), [depth, showEnd, end, showIso, iso, showInfEnd, showRootImage])

  return (
    <div className='container'>
      <div className='tree-container'>
        <TreeView p={p} options={options}
          onTooltipShow={e => {
            setTooltipPos({x: e.x + 10, y: e.y})
            setTooltipText(e.text)
            setTooltipVisible(true)
          }}
          onTooltipHide={() => setTooltipVisible(false)}
        />
      </div>
      <Sidebar>
        <SidebarRow>
          <SidebarLeft>
            <label htmlFor='p'>p</label>
          </SidebarLeft>
          <SidebarRight>
            <NumericInput name={'p'} value={inputP} min={2} max={10} step={primeStep}
              onChange={(_, s) => setInputP(s)} style={false} />
          </SidebarRight>
        </SidebarRow>
        <SidebarRow>
          <SidebarLeft>
            <label htmlFor='Depth'>Depth</label>
          </SidebarLeft>
          <SidebarRight>
            <NumericInput name='Depth' value={depth} min={1} max={10}
              onChange={(_, s) => validateDepth(s)} style={false} />
          </SidebarRight>
        </SidebarRow>
        <hr />
        <SidebarRow>
          <SidebarLeft>
            <LabelWithCheckbox checked={showEnd} htmlFor='End' onChange={e => setShowEnd(e.target.checked)}>
              End
            </LabelWithCheckbox>
          </SidebarLeft>
          <SidebarRight>
            <input type='text' name='End' value = {inputEnd}
              onChange={e => validateEnd(e.target.value)} className={showEnd ? undefined : 'disabled'} />
          </SidebarRight>
        </SidebarRow>
        <SidebarRow>
          <SidebarLeft>
            <input type='checkbox' checked={showInfEnd} name='show-inf-end'
              onChange={e => setShowInfEnd(e.target.checked)} />
          </SidebarLeft>
          <SidebarRight>
            <div><label htmlFor='show-inf-end'>Show end at infinity</label></div>
          </SidebarRight>
        </SidebarRow>
        <SidebarRow>
          <SidebarLeft>
            <LabelWithCheckbox checked={showIso} onChange={e => setShowIso(e.target.checked)}>
              Isometry
            </LabelWithCheckbox>
          </SidebarLeft>
          <SidebarRight>
            <MatrixInput value={inputIso} onChange={m => setInputIso(m)} className={showIso ? undefined : 'disabled'} />
          </SidebarRight>
        </SidebarRow>
        <SidebarRow>
          <SidebarLeft>
            <input type='checkbox' checked={showRootImage} name='show-root-image'
            onChange={e => setShowRootImage(e.target.checked)} />
          </SidebarLeft>
          <SidebarRight>
            <div><label htmlFor='show-root-image'>Show image of origin</label></div>
          </SidebarRight>
        </SidebarRow>
      </Sidebar>
      <Tooltip x={tooltipPos.x} y={tooltipPos.y} text={tooltipText} visible={tooltipVisible}/>
    </div>
  );
};

export default App;