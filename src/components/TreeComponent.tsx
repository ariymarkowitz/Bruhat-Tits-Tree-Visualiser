import { Seq } from "immutable";
import { KonvaEventObject } from "konva/lib/Node";
import React, { useContext, useMemo, useState } from "react"
import { Circle, Group, Layer, Line, Stage } from "react-konva"
import { AdicNumber, Zero } from "../Adic/Adic";
import { rationalField } from "../Field/Rational";
import BruhatTitsTree, { vertex } from '../Tree/BruhatTitsTree';
import { Tree, tree } from "../Tree/Tree";
import { colors } from "../ui/colors/Colors";
import { matrix } from "../VectorSpace/Matrix";
import { vec } from "../VectorSpace/VectorSpace";
import { MainTooltip, Tooltip } from "./Tooltip";

type gens = matrix<AdicNumber>
type pvec = vec<AdicNumber>
type BTT = BruhatTitsTree

type props = {
  p: number,
  depth: number,
  end?: [number, number]
  iso?: number[][]
}

type nodeProps = {
  node: tree<vertex>
  address: number[]
  x: number,
  y: number,
  angle: number,
  graphics: graphicsProps
  display: string
}

type graphicsProps = {
  radius: number,
  branchWidth: number,
  branchLength: number,
  strokeWidth: number,
  color: string,
  edgestrokecolor: string
  circlestrokecolor: string
}

export const TreeView = (props: props) => {
  const width = 800
  const height = 800
  
  const makeTooltip = () => {
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [text, setText] = useState<string>('')
    const [visible, setVisible] = useState(false)

    const tooltip = {setX, setY, setText, setVisible}

    return {tooltipProps: {x, y, text, visible}, tooltip}
  }
  
  const {tooltipProps, tooltip} = makeTooltip()

  const tree = makeTree(tooltip, props.p, props.depth, props.end)

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Group x={width/2} y={height/2}>
          <Group>{tree.edges}</Group>
          <Group>{tree.vertices}</Group>
        </Group>
      </Layer>
      <Layer listening={false}>
        <Tooltip x={tooltipProps.x} y={tooltipProps.y} text={tooltipProps.text} visible={tooltipProps.visible}/>
      </Layer>
    </Stage>
  )
}

const TreeNode = (tooltip: any, props: nodeProps, key: number) => {
  return <Circle
    x = {props.x}
    y = {props.y}
    radius={props.graphics.radius}
    strokeWidth={props.graphics.strokeWidth}
    fill={props.graphics.color}
    stroke={props.graphics.circlestrokecolor}
    key = {key}
    onMouseMove = {(e) => handleMouseMove(tooltip, e, props.display)}
    onMouseLeave = {(e) => handleMouseLeave(tooltip, e)}
    />
}

const TreeEdge = (props: nodeProps, x: number, y: number, key: number) => {
  return <Line
    x = {x}
    y = {y}
    points = {[0, 0, props.x - x, props.y - y]}
    strokeWidth = {props.graphics.branchWidth}
    stroke = {props.graphics.edgestrokecolor}
    key = {key}
  />
}

function handleMouseMove(context: MainTooltip.context | null, e: KonvaEventObject<MouseEvent>, display: string) {
  if (context === null) return
  const stage = e.target.getStage()
  if (stage === null) return
  const pos = stage.getPointerPosition()
  if (pos === null) return
  context.setX!(pos.x + 10)
  context.setY!(pos.y)
  context.setText!(display)
  context.setVisible!(true)
}

function handleMouseLeave(context: MainTooltip.context | null, e: KonvaEventObject<MouseEvent>) {
  if (context === null) return
  context.setVisible!(false)
}

function makeTree(tooltip: any, p: number, depth: number, end?: [number, number]) {
  const btt = useMemo(() => new BruhatTitsTree(p), [p])
  const tree = useMemo(() => btt.make(depth), [btt, depth])

  const endAdic = end ? btt.vspace.fromInts(end) : end

  const graphicsTree = makeGraphicsTree(btt, tree, endAdic)

  type treenode = {node: tree<nodeProps>, parent: tree<nodeProps> | null}
  return {
    vertices: Seq(Tree.seq<treenode>(
        (data) => data.node.forest.map(n => ({node: n, parent: data.node})),
        {node: graphicsTree, parent: null}
      ))
      .map((n, i) => TreeNode(tooltip, n.node.value, i))
      .toArray(),
    edges: Seq(Tree.seq<treenode>(
        (data) => data.node.forest.map(n => ({node: n, parent: data.node})),
        {node: graphicsTree, parent: null}
      ))
      .filter(n => n.parent != null)
      .map((n, i) => TreeEdge(n.node.value, n.parent!.value.x, n.parent!.value.y, i))
      .toArray()
  }
}

function circlestrokecolor(tree: BTT, lattice: vertex, end?: pvec) {
  if (end == undefined) {
    return colors.primary
  }
  const onPath = tree.vspace.inLattice(tree.vertexToGens(lattice), end)
  return onPath ? colors.accent : colors.primary
}

function edgestrokecolor(tree: BTT, lattice: vertex, end?: pvec) {
  if (end == undefined) {
    return colors.secondary
  }
  const onPath = tree.vspace.inLattice(tree.vertexToGens(lattice), end)
  return onPath ? colors.accent : colors.secondary
}

function defaultGraphicsProps(tree: BTT, lattice: vertex, end?: pvec): graphicsProps {
  return {
    radius: 10,
    branchLength: 240 * Math.pow(tree.p, 0.5),
    branchWidth: 4,
    strokeWidth: 2,
    color: colors.primary,
    circlestrokecolor: circlestrokecolor(tree, lattice, end),
    edgestrokecolor: edgestrokecolor(tree, lattice, end)
  }
}

function updateGraphicsProps(tree: BTT, lattice: vertex, props: graphicsProps, end?: pvec): graphicsProps {
  return {
    radius: props.radius * 0.75,
    branchLength: props.branchLength * 0.75 / Math.pow(tree.p, 0.4),
    branchWidth: props.branchWidth * 0.8,
    strokeWidth: Math.max(props.strokeWidth * 0.8, 1),
    color: props.color === colors.primary ? colors.alternative : colors.primary,
    circlestrokecolor: circlestrokecolor(tree, lattice, end),
    edgestrokecolor: edgestrokecolor(tree, lattice, end)
  }
}

function makeGraphicsTree(btt: BTT, tree: tree<vertex>, end?: pvec): tree<nodeProps> {
  const turnangle = 2*Math.PI/(btt.p+1)
  const rootDisplay = displayLattice(tree.value, btt)

  return Tree.make((data: nodeProps) => {
    const forest = data.node.forest.map((child, i) => {
      const graphics = updateGraphicsProps(btt, child.value, data.graphics, end) 

      const node = child
      const angle = Math.PI-(i + 1)*turnangle + data.angle
      const x = data.x + graphics.branchLength * Math.cos(angle)
      const y = data.y + graphics.branchLength * Math.sin(angle)
      const display = displayLattice(child.value, btt)

      return {node, angle, x, y, display, graphics}
    })
    return {value: data, forest}
  }, {
    node: tree,
    x: 0,
    y: 0,
    angle: Math.PI + turnangle,
    display: rootDisplay,
    graphics: defaultGraphicsProps(btt, tree.value, end)
  })
}

function displayLattice(v: vertex, btt: BruhatTitsTree) {
  const F = btt.field

  const r = F.toRational(v.u)

  const n = r.den === 1 ? `${r.num}` : `\\frac{${r.num}}{${r.den}}`
  return `[${n}]_{${v.n}}`
}