import { BruhatTitsTree } from '../algebra/Tree/BruhatTitsTree'
import { Rational, RationalField } from "../algebra/Field/Rational"
import type { Vertex } from "../algebra/Tree/BruhatTitsTree"
import type { Matrix } from "../algebra/VectorSpace/Matrix"
import type { Adj } from '../algebra/Tree/UnrootedTree'
import { angleLerp, boolLerp, boolOrLerp, lerp, radialLerp } from '../algebra/utils/math'
import { theme } from '../style/themes/themes'
import { mix } from 'color2k'
import type { Vec } from '../algebra/VectorSpace/VectorSpace'

export interface TreeOptions {
  end?: [number, number]
  isometry?: Matrix<[number, number]>
  showIsometry: boolean
  showEnd: boolean
}

interface LocalState {
  depth: number
  isLeaf: boolean
  type: number
  inEnd: boolean
  isMinTranslation: boolean
}

interface EdgeState {
  depth: number
  forward: number
  backward: number
}

interface GlobalState {
  x: number
  y: number
  zeroAngle: number
  depth: number
  edgeDepth: number
}

interface VertexGraphicsState {
  x: number
  y: number
  scale: number
  color: string
  strokeColor: string
}

interface EdgeGraphicsState {
  x1: number
  y1: number
  x2: number
  y2: number
  scale: number
  color: string
}

interface IsoInfo {
  iso: Matrix<Rational>
  minDist: number
}

export class TreeRenderer {
  width: number
  height: number

  p: number
  depth: number
  options: TreeOptions
  end?: Vec<Rational>

  showIsometry: boolean
  isoInfo: IsoInfo

  btt: BruhatTitsTree
  
  states: Map<string, LocalState>
  images: Map<string, Vertex>
  edges: Map<string, EdgeState>

  loopTime = 2000

  originGlobalState: GlobalState
  imageGlobalState: GlobalState

  initVertex: Vertex

  constructor(p: number, depth: number, options: TreeOptions, width: number, height: number) {
    this.width = width
    this.height = height

    this.p = p

    this.btt = new BruhatTitsTree(p)
    const V = this.btt.vspace
    const M = V.matrixAlgebra

    this.depth = depth

    this.options = options
    this.end = options.end ? V.fromInts(options.end) : undefined

    let iso: Matrix<Rational>
    if (options.isometry) {
      iso = options.isometry.map(v => v.map(e => Rational(e[0], e[1])))
      if (M.isSingular(iso)) {
        iso = M.one
        this.showIsometry = false
      } else {
        this.showIsometry = options.showIsometry
      }
    } else {
      iso = M.one
      this.showIsometry = false
    }
    this.isoInfo = this.makeIsoInfo(iso)

    this.states = new Map()
    this.images = new Map()
    this.edges = new Map()

    this.initVertex = this.btt.origin

    let initLocalState: LocalState = this.calculateLocalState(this.initVertex, 0, depth < 1)

    this.setLocalState(this.initVertex, initLocalState)
    this.setImage(this.initVertex, this.btt.action(this.isoInfo.iso, this.initVertex))

    // Set the states of each rendered vertex and (directed) edges.
    this.btt.iter((state, current, update) => {
      const newState: LocalState = this.calculateLocalState(update.vertex, state.depth + 1, state.depth + 1 >= depth)
      this.setLocalState(update.vertex, newState)

      const image = this.btt.action(this.isoInfo.iso, update.vertex)
      this.setImage(update.vertex, image)

      this.setEdgeState(current, update.vertex, {
        depth: newState.depth,
        forward: update.edge,
        backward: this.btt.reverse(current, update).edge
      })
  
      return {value: newState, stop: newState.isLeaf}
    }, initLocalState, this.initVertex)

    // Set the states of the images of the rendered vertices.
    // We do this after rendering all vertices so that we don't have to recalculate vertices that are already determined.
    this.btt.iterVertices(vertex => {
      const state = this.getLocalState(vertex)
      const image = this.getImage(vertex)

      this.setVertexMapOnce(this.states, image, this.calculateLocalState(image, depth + 1, true))

      return state.isLeaf
    }, this.initVertex)

    // Set the state of the images of the edges.
    this.btt.iter((_, current, update) => {
      const state = this.getLocalState(update.vertex)

      const image1 = this.getImage(current)
      const image2 = this.getImage(update.vertex)

      const state1 = this.getLocalState(image1)
      const state2 = this.getLocalState(image2)

      const adj = this.btt.path(image1, image2)[0]
      this.setEdgeState(image1, image2, {
        depth: Math.max(state1.depth, state2.depth),
        forward: adj.edge,
        backward: this.btt.reverse(image1, adj).edge
      })

      return {value: undefined, stop: state.isLeaf}
    }, undefined, this.initVertex)

    this.originGlobalState = {
      x: width/2,
      y: height/2,
      zeroAngle: 0,
      depth: 0,
      edgeDepth: 0
    }

    // Set the global state of the image.
    this.imageGlobalState = this.btt.reducePath((globalState: GlobalState, v: Vertex, adj: Adj<Vertex, number>) => {
      const localState = this.getLocalState(adj.vertex)
      const edgeState = this.getEdgeState(v, adj.vertex)

      return this.accumulate(globalState, localState, edgeState)
    }, this.initVertex, this.getImage(this.initVertex), this.originGlobalState)
  }

  calculateLocalState(v: Vertex, depth: number, isLeaf: boolean): LocalState {
    return {
      depth,
      isLeaf,
      type: depth % 2,
      inEnd: this.end ? this.btt.inEnd(v, this.end) : false,
      isMinTranslation: this.btt.translationDistance(this.isoInfo.iso, v) === this.isoInfo.minDist
    }
  }

  makeIsoInfo(iso: Matrix<Rational>): IsoInfo {
    return {
      iso,
      minDist: this.btt.minTranslationDistance(iso)
    }
  }

  setVertexMapOnce<T>(map: Map<string, T>, vertex: Vertex, value: T) {
    const key = this.btt.vertexToString(vertex)
    if (!map.has(key)) {
      map.set(key, value)
    }
  }

  getVertexMap<T>(map: Map<string, T>, vertex: Vertex): T {
    const value = map.get(this.btt.vertexToString(vertex))
    if (value === undefined) {
      throw new Error('Vertex not found in map')
    }
    return value
  }

  setLocalState(vertex: Vertex, state: LocalState) {
    this.setVertexMapOnce(this.states, vertex, state)
  }

  getLocalState(vertex: Vertex): LocalState {
    return this.getVertexMap(this.states, vertex)
  }

  setImage(vertex: Vertex, image: Vertex) {
    this.setVertexMapOnce(this.images, vertex, image)
  }

  getImage(vertex: Vertex): Vertex {
    return this.getVertexMap(this.images, vertex)
  }

  edgeKey(v1: Vertex, v2: Vertex): string {
    return `${this.btt.vertexToString(v1)} ${this.btt.vertexToString(v2)}`
  }

  setEdgeState(v1: Vertex, v2: Vertex, value: EdgeState) {
    const key = this.edgeKey(v1, v2)
    if (!this.edges.has(key)) {
      this.edges.set(this.edgeKey(v1, v2), value)
    }
  }

  getEdgeState(v1: Vertex, v2: Vertex): EdgeState {
    const value = this.edges.get(this.edgeKey(v1, v2))
    if (value === undefined) throw new Error('Edge not found in map')
    return value
  }

  accumulate(state: GlobalState, local: LocalState, edge: EdgeState): GlobalState {
    const scale = Math.pow(0.8 * Math.pow(1/this.p, 0.45), edge.depth - 1) * Math.pow(this.p, 0.2)
    const angle = state.zeroAngle - 2*Math.PI/(this.p+1)*edge.forward

    return {
      x: state.x + 160 * scale * Math.cos(angle),
      y: state.y + 160 * scale * Math.sin(angle),
      zeroAngle: angle + 2*Math.PI/(this.p+1)*edge.backward + Math.PI,
      depth: local.depth,
      edgeDepth: edge.depth
    }
  }

  interpLocalStates(state1: LocalState, state2: LocalState, t: number): LocalState {
    return {
      depth: lerp(state1.depth, state2.depth, t),
      isLeaf: boolOrLerp(state1.isLeaf, state2.isLeaf, t),
      type: lerp(state1.type, state2.type, t),
      inEnd: boolLerp(state1.inEnd, state2.inEnd, t),
      isMinTranslation: boolLerp(state1.isMinTranslation, state2.isMinTranslation, t)
    }
  }

  interpEdgeStates(state1: EdgeState, state2: EdgeState, t: number): EdgeState {
    return {
      depth: lerp(state1.depth, state2.depth, t),
      forward: radialLerp(state1.forward, state2.forward, t, this.p+1),
      backward: radialLerp(state1.backward, state2.backward, t, this.p+1),
    }
  }

  interpGlobalStates(state1: GlobalState, state2: GlobalState, t: number): GlobalState {
    return {
      x: lerp(state1.x, state2.x, t),
      y: lerp(state1.y, state2.y, t),
      zeroAngle: angleLerp(state1.zeroAngle, state2.zeroAngle, t),
      depth: lerp(state1.depth, state2.depth, t),
      edgeDepth: lerp(state1.edgeDepth, state2.edgeDepth, t)
    }
  }

  vertexColor(state: LocalState): string {
    return mix(theme.tree.type0, theme.tree.type1, state.type)
  }

  vertexStrokeColor(state: LocalState): string {
    if (this.showIsometry && state.isMinTranslation) {
      return this.isoInfo.minDist === 0 ? theme.tree.fixedPoints : theme.tree.translationAxis
    }
    if (state.inEnd) return theme.tree.end
    return theme.tree.vertexStroke
  }

  edgeColor(state1: LocalState, state2: LocalState): string {
    if (this.showIsometry && state1.isMinTranslation && state2.isMinTranslation) {
      return this.isoInfo.minDist === 0 ? theme.tree.fixedPoints : theme.tree.translationAxis
    }
    if (state1.inEnd && state2.inEnd) return theme.tree.end
    return theme.tree.edge
  }

  makeVertexGraphicsState(local: LocalState, global: GlobalState): VertexGraphicsState {
    return {
      x: global.x,
      y: global.y,
      scale: Math.pow(0.75, global.depth),
      color: this.vertexColor(local),
      strokeColor: this.vertexStrokeColor(local)
    }
  }

  makeEdgeGraphicsState(local1: LocalState, global1: GlobalState, local2: LocalState, global2: GlobalState): EdgeGraphicsState {
    return {
      x1: global1.x,
      y1: global1.y,
      x2: global2.x,
      y2: global2.y,
      scale: Math.pow( 0.8 / Math.pow(this.p, 0.4), global2.edgeDepth - 1),
      color: this.edgeColor(local1, local2)
    }
  }

  drawVertex(context: CanvasRenderingContext2D, state: VertexGraphicsState) {
    context.fillStyle = state.color
    context.strokeStyle = state.strokeColor
    context.lineWidth = theme.tree.vertexStrokeWidth * state.scale
    context.beginPath()
    context.arc(state.x, state.y, theme.tree.vertexRadius * state.scale, 0, 2 * Math.PI, false)
    context.fill()
    context.stroke()
  }

  drawEdge(context: CanvasRenderingContext2D, state: EdgeGraphicsState) {
    context.strokeStyle = state.color
    context.lineWidth = theme.tree.branchWidth * state.scale
    context.beginPath()
    context.moveTo(state.x1, state.y1)
    context.lineTo(state.x2, state.y2)
    context.stroke()
  }

  interpolateTime(t): number {
    return (1-Math.cos((t * (Math.PI) / this.loopTime) % Math.PI))/2
  }

  render(context: CanvasRenderingContext2D, t: number) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    const vertexCanvas = document.createElement('canvas')
    vertexCanvas.width = context.canvas.width
    vertexCanvas.height = context.canvas.height

    const vertexContext = vertexCanvas.getContext('2d')
    if (vertexContext === null) {throw new Error('Failed to create canvas')}
    vertexContext.scale(devicePixelRatio, devicePixelRatio)

    const i = this.interpolateTime(t)

    const initLocalState1 = this.getLocalState(this.initVertex)
    const initLocalState2 = this.getLocalState(this.getImage(this.initVertex))
    const initLocalState: LocalState = this.interpLocalStates(initLocalState1, initLocalState2, i)

    const initGlobalState: GlobalState = this.interpGlobalStates(this.originGlobalState, this.imageGlobalState, i)

    this.drawVertex(vertexContext, this.makeVertexGraphicsState(initLocalState, initGlobalState))

    this.btt.iter((state, current, update) => {
      const {local: prevLocalState, global: prevGlobalState} = state
      const prevImage = this.getImage(current)
      const image = this.getImage(update.vertex)

      const localState = this.getLocalState(update.vertex)
      const imageLocalState = this.getLocalState(image)

      const edgeState = this.getEdgeState(current, update.vertex)
      const imageEdgeState = this.getEdgeState(prevImage, image)

      const newLocalState = this.interpLocalStates(localState, imageLocalState, i)
      const newGlobalState = this.accumulate(
        prevGlobalState,
        newLocalState,
        this.interpEdgeStates(edgeState, imageEdgeState, i)
      )
      const vertexGraphicsState = this.makeVertexGraphicsState(newLocalState, newGlobalState)
      const edgeGraphicsState = this.makeEdgeGraphicsState(prevLocalState, prevGlobalState, newLocalState, newGlobalState)

      this.drawVertex(vertexContext, vertexGraphicsState)
      this.drawEdge(context, edgeGraphicsState)
      
      return {value: {local: newLocalState, global: newGlobalState}, stop: localState.isLeaf}
    }, {local: initLocalState, global: initGlobalState}, this.initVertex)

    context.drawImage(vertexCanvas, 0, 0, vertexCanvas.width/devicePixelRatio, vertexCanvas.height/devicePixelRatio)
  }
}