import { KonvaEventObject } from "konva/lib/Node";
import "konva/lib/shapes/Circle";
import "konva/lib/shapes/Line";
import "konva/lib/shapes/Rect";
import React, { useMemo } from "react";
import { Circle, Group, Layer, Line, Stage } from "react-konva/lib/ReactKonvaCore";
import { AdicNumber } from "../Adic/Adic";
import { theme } from "../style/themes/themes";
import { BruhatTitsTree, vertex } from '../Tree/BruhatTitsTree';
import * as Tree from "../Tree/Tree";
import { Seq } from "../utils/Seq";
import { mod } from "../utils/utils";
import { Matrix } from "../VectorSpace/Matrix";

type AdicVec = [AdicNumber, AdicNumber]
type Tree<T> = Tree.Tree<T>
type BTT = BruhatTitsTree

interface IsometryInfo {
  matrix: Matrix<AdicNumber>;
  minDist: number;
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

interface NodeProps {
  node: Tree<vertex>
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

const BTTNode = (props: NodeProps, key: number, onTooltipShow?: TooltipShowEvent, onTooltipHide?: TooltipHideEvent) => {
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

const TreeEdge = (props: NodeProps, x: number, y: number, key: number) => {
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
    () => (options.end ? btt.vspace.fromInts(options.end) : undefined) as [AdicNumber, AdicNumber],
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

  type TreeNode = {node: Tree<NodeProps>, parent: Tree<NodeProps> | null}
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

function circlefillcolor(tree: BTT, v: vertex, options: BTTOptions, iso?: IsometryInfo) {
  if (options.showRootImage) {
    if (iso && tree.lengthOfImage(iso.matrix, v) === 0) {
      return treeTheme.rootImage
    } else if (!iso && tree.field.isZero(v.u) && v.n === 0) {
      return treeTheme.rootImage
    }
  }
  if (mod(v.n, 2) === 1) {
    return treeTheme.type1
  } else {
    return treeTheme.type0
  }
}

function circlestrokecolor(tree: BTT, v: vertex, options: BTTOptions, end?: AdicVec, iso?: IsometryInfo) {
  if (iso) {
    if (iso.minDist !== 0 && tree.translationDistance(iso.matrix, v) === iso.minDist) {
      return treeTheme.translationAxis
    } else if (iso.minDist === 0 && tree.translationDistance(iso.matrix, v) === 0) {
      return treeTheme.fixedPoints
    }
  }
  if (end !== undefined && tree.inEnd(v, end)) {
    return treeTheme.end
  } else if (options.showInfEnd && tree.inInfEnd(v)) {
    return treeTheme.infBranch
  } else {
    return treeTheme.vertexStroke
  }
}

function edgestrokecolor(tree: BTT, v1: vertex, v2: vertex, options: BTTOptions, end?: AdicVec, iso?: IsometryInfo) {
  if (iso) {
    if (
      iso.minDist !== 0
      && tree.translationDistance(iso.matrix, v1) === iso.minDist
      && tree.translationDistance(iso.matrix, v2) === iso.minDist
    ) {
      return treeTheme.translationAxis
    } else if (
        iso.minDist === 0
        && tree.translationDistance(iso.matrix, v1) === 0
        && tree.translationDistance(iso.matrix, v2) === 0
    ) {
      return treeTheme.fixedPoints
    }
  }
  if (end !== undefined && tree.inEnd(v1, end) && tree.inEnd(v2, end)) {
    return treeTheme.end
  } else if (options.showInfEnd && tree.inInfEnd(v1) && tree.inInfEnd(v2)) {
    return treeTheme.infBranch
  } else {
    return treeTheme.edge
  }
}

function defaultGraphicsProps(tree: BTT, v: vertex, options: BTTOptions,
  end?: AdicVec, iso?: IsometryInfo): GraphicsProps {
  return {
    radius: treeTheme.vertexRadius,
    branchLength: 240 * Math.pow(tree.p, 0.5),
    branchWidth: treeTheme.branchWidth,
    strokeWidth: treeTheme.vertexStrokeWidth,
    fillColor: circlefillcolor(tree, v, options, iso),
    circlestrokecolor: circlestrokecolor(tree, v, options, end, iso),
    edgestrokecolor: ''
  }
}

function updateGraphicsProps(
  tree: BTT, v: vertex, parent: vertex, props: GraphicsProps,
  options: BTTOptions, end?: AdicVec, iso?: IsometryInfo
): GraphicsProps {
  return {
    radius: props.radius * 0.75,
    branchLength: props.branchLength * 0.75 / Math.pow(tree.p, 0.4),
    branchWidth: props.branchWidth * 0.8,
    strokeWidth: Math.max(props.strokeWidth * 0.8, 1),
    fillColor: circlefillcolor(tree, v, options, iso),
    circlestrokecolor: circlestrokecolor(tree, v, options, end, iso),
    edgestrokecolor: edgestrokecolor(tree, v, parent, options, end, iso)
  }
}

function makeGraphicsTree(
    btt: BTT, tree: Tree<vertex>, options: BTTOptions,
    end?: AdicVec, iso?: Matrix<AdicNumber>
  ): Tree<NodeProps> {
  const turnangle = 2*Math.PI/(btt.p+1)
  const rootDisplay = displayLattice(tree.value, btt)

  const isoInfo = iso ? {matrix: iso, minDist: btt.minTranslationDistance(iso)} : undefined

  return Tree.make((data: NodeProps) => {
    const forest = data.node.forest.map((child, i) => {
      const graphics = updateGraphicsProps(btt, child.value, data.node.value, data.graphics, options, end, isoInfo) 

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
    graphics: defaultGraphicsProps(btt, tree.value, options, end, isoInfo)
  })
}

function displayLattice(v: vertex, btt: BruhatTitsTree) {
  const F = btt.field

  const r = F.toRational(v.u)

  const n = r.den === 1 ? `${r.num}` : `\\frac{${r.num}}{${r.den}}`
  return `\\left[${n}\\right]_{${v.n}}`
}