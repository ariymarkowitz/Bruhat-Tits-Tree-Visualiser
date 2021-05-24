import React, { useEffect, useState } from 'react';
import { Container, Grid, Input, Segment } from 'semantic-ui-react';
import { isPrime } from '../utils';
import { TreeView } from './TreeComponent';

const s = require('./main.css');

function formatMatrix(str: string) {
  const n = str.split(',').map(s => Number(s))
  if (n.length === 4 && n.every(Number.isInteger)) {
    return [[n[0],n[3]],[n[2],n[4]]]
  } else {
    return undefined
  }
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
    if (Number.isInteger(newP) && newP > 1 && newP < 20 && isPrime(newP)) {
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
    if (Number.isInteger(v) && v > 0 && v < 10) {
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
        <Grid.Column width={12}>
          <TreeView p={p} depth={depth} end={end as [number, number]} iso={iso} />
        </Grid.Column>
        <Grid.Column width={4}>
          <Segment inverted>
            p 
            <Input inverted value={inputP} onChange={(e) => setInputP(e.target.value)} />
          </Segment>
          <Segment inverted>Depth 
            <Input inverted value={depth} onChange={(e) => validateDepth(e.target.value)} />
          </Segment>
          <Segment inverted>End 
            <Input inverted value = {inputEnd} onChange={(e) => setInputEnd(e.target.value)} />
          </Segment>
          <Segment inverted>Isometry 
            <Input inverted onChange={(e) => setIso(formatMatrix(e.target.value))} />
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default App;