import React, { useEffect, useState } from 'react';
import { Container, Form, Grid, Input, Segment } from 'semantic-ui-react';
import { isPrime } from '../utils';
import { TreeView } from './TreeComponent';
import NumberInput from 'semantic-ui-react-numberinput';

function formatMatrix(str: string) {
  const n = str.split(',').map(s => Number.parseInt(s))
  if (n.length === 4 && n.every(Number.isInteger)) {
    return [[n[0],n[2]],[n[1],n[3]]]
  } else {
    return undefined
  }
}

const NumberInput2 = (props: any) => {
  return <NumberInput {...props} className='ui input number-input' />
}

const App = () => {
  const [inputP, setInputP] = useState<string>('2')
  const [p, setP] = useState<number>(2)

  const [inputDepth, setInputDepth] = useState([7, p])

  const [inputEnd, setInputEnd] = useState<string>('')
  const [end, setEnd] = useState<number[] | undefined>(undefined)

  const [iso, setIso] = useState<number[][] | undefined>(undefined)

  useEffect(() => {
    const newP = Number.parseInt(inputP)
    if (Number.isInteger(newP) && isPrime(newP)) {
      setP(newP)
    }
  }, [inputP])

  useEffect(() => {
    if (inputEnd == '') {
      setEnd(undefined)
    } else {
      const ns = inputEnd.split(',')
      if (ns.length !== 2) return
      const [a, b] = ns.map(e => Number.parseInt(e))
      if (!(Number.isInteger(a) && Number.isInteger(b))) return
      setEnd([a, b])
    }
    
  }, [inputEnd])

  const validateDepth = (n: string) => {
    const v = Number.parseInt(n)
    if (Number.isInteger(v)) {
      setInputDepth([v, p])
    }
  }

  let depth
  if (inputDepth[0] <= 1) {
    depth = 1
  } else {
    depth = Math.max(2, Math.min(inputDepth[0], Math.floor(inputDepth[0] * (inputDepth[1]+1) / (p+1))))
  }

  return (
    <Container>
      <Grid>
        <Grid.Column width={13}>
          <TreeView p={p} depth={depth} end={end as [number, number]} iso={iso} />
        </Grid.Column>
        <Grid.Column width={3}>
          <Form inverted autoComplete='off' id='tree-controls'>
            <Form.Group grouped>
              <Form.Field inline label='p' control={NumberInput2}
              buttonPlacement="right" value={inputP} minValue={1} maxValue={10}
              onChange={(value: string) => setInputP(value)} />
              <Form.Field inline label='Depth' control={NumberInput2}
              buttonPlacement="right" value={depth} minValue={1} maxValue={10}
              onChange={(value: string) => validateDepth(value)} />
              <Form.Input inline label='End' value = {inputEnd} onChange={(e: any) => setInputEnd(e.target.value)} />
              <Form.Input inline label='Isometry' onChange={(e: any) => setIso(formatMatrix(e.target.value))} />
            </Form.Group>
          </Form>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default App;