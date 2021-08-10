import { KonvaEventObject } from "konva/lib/Node";
import "konva/lib/shapes/Circle";
import "konva/lib/shapes/Line";
import "konva/lib/shapes/Rect";
import React, { useMemo } from "react";
import { Circle, Group, Layer, Line, Stage } from "react-konva/lib/ReactKonvaCore";
import { theme } from "../style/themes/themes";
import { BruhatTitsTree, Vertex } from '../Tree/BruhatTitsTree';
import * as Tree from "../Tree/Tree";
import { Seq } from "../utils/Seq";
import { mod } from "../utils/int";
import { Matrix } from "../VectorSpace/Matrix";
import { Rational } from "../Field/Rational";
import { Vec } from "../VectorSpace/VectorSpace";

type Tree<T> = Tree.Tree<T>
type BTT = BruhatTitsTree

interface IsometryInfo {
  matrix: Matrix<Rational>;
  minDist: number;
  vertex: Vertex;
}

interface TooltipProps {
  x: number,
  y: number,
  text: string
}
type TooltipShowEvent = (e: TooltipProps) => void
type TooltipHideEvent = () => void

interface BTTProps {
  p: number,
  options: BTTOptions
  onTooltipShow?: TooltipShowEvent
  onTooltipHide?: TooltipHideEvent
}

export interface BTTOptions {
  depth: number,
  end?: [number, number],
  iso?: number[][],
  showInfEnd?: boolean,
  showRootImage?: boolean
}

interface GraphicsNodeProps {
  node: Tree<VertexCachedInfo>
  address: number[]
  x: number,
  y: number,
  angle: number,
  graphics: GraphicsProps
  display: string
}

interface GraphicsProps {
  radius: number,
  branchWidth: number,
  branchLength: number,
  strokeWidth: number,
  fillColor: string,
  edgestrokecolor: string
  circlestrokecolor: string
}

interface VertexCachedInfo {
  vertex: Vertex,
  isMinTranslation?: boolean
  inEnd?: boolean
  inInfEnd?: boolean
}

const treeTheme = theme.tree

export const BTTComponent = ({p, options, onTooltipShow, onTooltipHide}: BTTProps) => {
  const width = 800
  const height = 800

  const tree = makeTree(p, options, onTooltipShow, onTooltipHide)

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Group x={width/2} y={height/2}>
          <Group>{tree.edges}</Group>
          <Group>{tree.vertices}</Group>
        </Group>
      </Layer>
    </Stage>
  )
}

const BTTNode = (props: GraphicsNodeProps, key: number, onTooltipShow?: TooltipShowEvent, onTooltipHide?: TooltipHideEvent) => {
  return <Circle
    x = {props.x}
    y = {props.y}
    radius={props.graphics.radius}
    strokeWidth={props.graphics.strokeWidth}
    fill={props.graphics.fillColor}
    stroke={props.graphics.circlestrokecolor}
    key = {key}
    onMouseMove = {(e) => {
      if (onTooltipShow) handleMouseMove(onTooltipShow, e, props.display)
    }}
    onMouseLeave = {(e) => {
      if (onTooltipHide) handleMouseLeave(onTooltipHide, e)
    }}
  />
}

const TreeEdge = (props: GraphicsNodeProps, x: number, y: number, key: number) => {
  return <Line
    x = {x}
    y = {y}
    points = {[0, 0, props.x - x, props.y - y]}
    strokeWidth = {props.graphics.branchWidth}
    stroke = {props.graphics.edgestrokecolor}
    key = {key}
  />
}

function handleMouseMove(onTooltipShow: TooltipShowEvent, e: KonvaEventObject<MouseEvent>, display: string) {
  onTooltipShow({x: e.evt.pageX, y: e.evt.pageY, text: display})
}

function handleMouseLeave(onTooltipHide: TooltipHideEvent, e: KonvaEventObject<MouseEvent>) {
  onTooltipHide()
}

function makeTree(p: number, options: BTTOptions, onTooltipShow?: TooltipShowEvent, onTooltipHide?: TooltipHideEvent) {
  const btt = useMemo(() => new BruhatTitsTree(p), [p])
  const tree = useMemo(() => btt.make(options.depth), [btt, options.depth])

  const endAdic = useMemo(
    () => (options.end ? btt.vspace.fromInts(options.end) : undefined),
    [btt, options.end]
  )
  
  const isoAdic = useMemo(() => {
    const _isoAdic = (options.iso ? btt.vspace.matrixAlgebra.fromInts(options.iso) : undefined)
    return _isoAdic && !btt.vspace.matrixAlgebra.isSingular(_isoAdic) ? _isoAdic : undefined
  }, [btt, options.iso])

  const graphicsTree = useMemo(
    () => makeGraphicsTree(btt, tree, options, endAdic, isoAdic),
    [btt, tree, options]
  )

  type TreeNode = {node: Tree<GraphicsNodeProps>, parent: Tree<GraphicsNodeProps> | null}
  const vertexIter = Tree.iter<TreeNode>(
    (data) => data.node.forest.map(n => ({node: n, parent: data.node})),
    {node: graphicsTree, parent: null}
  )
  const edgeIter = Tree.iter<TreeNode>(
    (data) => data.node.forest.map(n => ({node: n, parent: data.node})),
    {node: graphicsTree, parent: null}
  )
  return {
    vertices: new Seq(vertexIter)
      .mapIndexed((n, i) => BTTNode(n.node.value, i, onTooltipShow, onTooltipHide))
      .toArray(),
    edges: new Seq(edgeIter)
      .filter(n => n.parent != null)
      .mapIndexed((n, i) => TreeEdge(n.node.value, n.parent!.value.x, n.parent!.value.y, i))
      .toArray()
  }
}

function circlefillcolor(btt: BTT, v: Vertex, options: BTTOptions, iso?: IsometryInfo) {
  if (options.showRootImage) {
    if (iso && btt.isEqualVertex(iso.vertex, v)) {
      return treeTheme.rootImage
    } else if (!iso && btt.vertexIsRoot(v)) {
      return treeTheme.rootImage
    }
  }
  if (mod(v.n, 2) === 1) {
    return treeTheme.type1
  } else {
    return treeTheme.type0
  }
}

function circlestrokecolor(v: VertexCachedInfo, iso?: IsometryInfo) {
  if (iso && v.isMinTranslation) {
    return iso.minDist === 0 ? treeTheme.fixedPoints : treeTheme.translationAxis
  }
  if (v.inEnd) return treeTheme.end
  if (v.inInfEnd) return treeTheme.infBranch
  return treeTheme.vertexStroke
}

function edgestrokecolor(v1: VertexCachedInfo, v2: VertexCachedInfo, iso?: IsometryInfo) {
  if (iso && v1.isMinTranslation && v2.isMinTranslation) {
    return iso.minDist === 0 ? treeTheme.fixedPoints : treeTheme.translationAxis
  }
  if (v1.inEnd && v2.inEnd) return treeTheme.end
  if (v1.inInfEnd && v2.inInfEnd) return treeTheme.infBranch
  return treeTheme.edge
}

function defaultGraphicsProps(tree: BTT, v: VertexCachedInfo, options: BTTOptions,
  end?: Vec<Rational>, iso?: IsometryInfo): GraphicsProps {
  return {
    radius: treeTheme.vertexRadius,
    branchLength: 240 * Math.pow(tree.p, 0.5),
    branchWidth: treeTheme.branchWidth,
    strokeWidth: treeTheme.vertexStrokeWidth,
    fillColor: circlefillcolor(tree, v.vertex, options, iso),
    circlestrokecolor: circlestrokecolor(v, iso),
    edgestrokecolor: ''
  }
}

function updateGraphicsProps(
  tree: BTT, v: VertexCachedInfo, parent: VertexCachedInfo, props: GraphicsProps,
  options: BTTOptions, end?: Vec<Rational>, iso?: IsometryInfo
): GraphicsProps {
  return {
    radius: props.radius * 0.75,
    branchLength: props.branchLength * 0.75 / Math.pow(tree.p, 0.4),
    branchWidth: props.branchWidth * 0.8,
    strokeWidth: Math.max(props.strokeWidth * 0.8, 1),
    fillColor: circlefillcolor(tree, v.vertex, options, iso),
    circlestrokecolor: circlestrokecolor(v, iso),
    edgestrokecolor: edgestrokecolor(v, parent, iso)
  }
}

function makeVertexCachedInfo(v: Vertex, btt: BTT, options: BTTOptions,
  iso?: IsometryInfo, end?: Vec<Rational>): VertexCachedInfo {
  return {
    vertex: v,
    isMinTranslation: iso
      ? (iso.minDist !== 0 && btt.translationDistance(iso.matrix, v) === iso.minDist)
        || iso.minDist === 0 && btt.translationDistance(iso.matrix, v) === 0
      : undefined,
    inEnd: end ? btt.inEnd(v, end) : undefined,
    inInfEnd: options.showInfEnd ? btt.inInfEnd(v) : undefined
  }
}

function makeIsoInfo(iso: Matrix<Rational>, btt: BTT): IsometryInfo {
  return {
    matrix: iso,
    minDist: btt.minTranslationDistance(iso),
    vertex: btt.gensToVertex(iso)
  }
}

function makeCachedVertexTree(
  btt: BTT, tree: Tree<Vertex>, options: BTTOptions,
  end?: Vec<Rational>, iso?: IsometryInfo
): Tree<VertexCachedInfo> {
  return Tree.map(node => makeVertexCachedInfo(node, btt, options, iso, end), tree)
}

function makeGraphicsTree(
  btt: BTT, tree: Tree<Vertex>, options: BTTOptions,
  end?: Vec<Rational>, iso?: Matrix<Rational>
): Tree<GraphicsNodeProps> {
  const turnangle = 2*Math.PI/(btt.p+1)
  const rootDisplay = displayLattice(tree.value, btt)

  const isoInfo = iso ? makeIsoInfo(iso, btt) : undefined
  const cachedTree = makeCachedVertexTree(btt, tree, options, end, isoInfo)

  return Tree.make((data: GraphicsNodeProps) => {
    const forest = data.node.forest.map((child, i) => {
      const graphics = updateGraphicsProps(btt, child.value, data.node.value, data.graphics, options, end, isoInfo) 

      const node = child
      const angle = Math.PI-(i + 1)*turnangle + data.angle
      const x = data.x + graphics.branchLength * Math.cos(angle)
      const y = data.y + graphics.branchLength * Math.sin(angle)
      const display = displayLattice(child.value.vertex, btt)

      return {node, angle, x, y, display, graphics}
    })
    return {value: data, forest}
  }, {
    node: cachedTree,
    x: 0,
    y: 0,
    angle: Math.PI + turnangle,
    display: rootDisplay,
    graphics: defaultGraphicsProps(btt, cachedTree.value, options, end, isoInfo)
  })
}

function displayLattice(v: Vertex, btt: BruhatTitsTree) {
  const F = btt.field

  const r = v.u

  const n = r.den === 1 ? `${r.num}` : `\\frac{${r.num}}{${r.den}}`
  return `\\left[${n}\\right]_{${v.n}}`
}