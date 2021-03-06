import { parseToRgba } from 'color2k'
import { cache } from 'decorator-cache-getter'
import Flatbush from 'flatbush'
import { Rational } from "../algebra/Field/Rational"
import type { Vertex } from "../algebra/Tree/BruhatTitsTree"
import { BruhatTitsTree } from '../algebra/Tree/BruhatTitsTree'
import type { Adj } from '../algebra/Tree/UnrootedTree'
import { angleLerp, boolOrLerp, discreteLerp, lerp, radialLerp } from '../algebra/utils/math'
import type { Matrix } from "../algebra/VectorSpace/Matrix"
import type { Vec } from '../algebra/VectorSpace/VectorSpace'
import { mixRgba } from '../utils/color'
import type { Theme } from './../style/themes/themes'

export interface TreeOptions {
  end?: [number, number]
  isometry?: Matrix<[number, number]>
  showIsometry: boolean
  showEnd: boolean
  hitbox?: boolean
  highlight?: string
  theme: Theme
}

/**
 * The state known to a vertex, regardless of choice of origin.
 */
interface LocalState {
  depth: number
  isLeaf: boolean
  type: number
  inEnd: boolean
  isMinTranslation: boolean
  key: string
  hitBoxInfo: HitBoxInfo
}

/**
 * The state known to a (directed) edge, regardless of choice of origin.
 */
interface EdgeState {
  depth: number
  forward: number
  backward: number
}

/**
 * The global state calculated for each vertex, accumulated via the local state
 */
interface GlobalState {
  x: number
  y: number
  angle: number
  // Only used to set the angle of the image of the origin.
  zeroAngle: number
  depth: number
  edgeDepth: number
}

/**
 * The state used to draw a vertex.
 */
interface VertexGraphicsState {
  x: number
  y: number
  scale: number
  color: string
  strokeColor: string
  hitBoxInfo: HitBoxInfo
}

/**
 * The state used to draw an edge.
 */
interface EdgeGraphicsState {
  x1: number
  y1: number
  x2: number
  y2: number
  scale: number
  color: string
  subdivide: boolean
}

interface IsoInfo {
  iso: Matrix<Rational>
  minDist: number
  isReflection: boolean
}

export interface HitBoxInfo {
  display: string
  imageKey?: string
}

/**
 * Stores all the data needed to render the tree.
 * 
 * All values that need interpolating are stored in maps,
 * to speed up calculation.
 */
export class TreeRenderer {
  width: number
  height: number
  resolution: number

  p: number
  depth: number
  options: TreeOptions
  end?: Vec<Rational>

  showIsometry: boolean
  isoInfo: IsoInfo

  btt: BruhatTitsTree
  
  /**
   * The local states of each vertex.
   */
  states: Map<string, LocalState>
  /**
   * The images of each vertex.
   */
  images: Map<string, Vertex>
  /**
   * The state of (directed) edges of neighbouring vertices.
   */
  edges: Map<string, EdgeState>
  /**
   * The angles of each vertex, relative to the parent.
   * This is stored in the vertex instead of the edge to avoid
   * the need for parent edges.
   * 
   * A full circle is `this.p+1`.
   */
  angles: Map<string, number>
  /**
   * The angle of the image of each vertex, relative to the parent.
   */
  imageAngles: Map<string, number>

  loopTime = 2000

  originGlobalState: GlobalState
  imageGlobalState: GlobalState

  initVertex: Vertex

  hitBoxes: Flatbush
  hitBoxMap: Array<HitBoxInfo>

  constructor(p: number, depth: number, options: TreeOptions, width: number, height: number, resolution: number = 1) {
    this.width = width
    this.height = height
    this.resolution = resolution

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
    this.angles = new Map()
    this.imageAngles = new Map()

    this.initVertex = this.btt.origin

    const initImage = this.btt.action(this.isoInfo.iso, this.initVertex)
    this.setImage(this.initVertex, initImage)
    let initLocalState: LocalState = this.calculateLocalState(this.initVertex, 0, depth < 1, initImage)
    this.setLocalState(this.initVertex, initLocalState)

    // Set the states of each rendered vertex and (directed) edges.
    this.btt.iter((state, current, update) => {
      const image = this.btt.action(this.isoInfo.iso, update.vertex)
      this.setImage(update.vertex, image)
      const newState: LocalState = this.calculateLocalState(update.vertex, state.depth + 1, state.depth + 1 >= depth, image)
      this.setLocalState(update.vertex, newState)

      this.setEdgeState(current, update.vertex, {
        depth: newState.depth,
        forward: update.edge,
        backward: this.btt.reverse(current, update).edge
      })

      return {value: newState, stop: newState.isLeaf}
    }, initLocalState, this.initVertex)

    // Set the state of the images of the vertices and edges.
    this.btt.iter((_, current, update) => {
      const state = this.getLocalState(update.vertex)

      const image1 = this.getImage(current)
      const image2 = this.getImage(update.vertex)

      const key = this.btt.vertexToString(image2)
      if (!this.states.has(key)) {
        // TODO: This assumes that the image of the origin is still in the original tree.
        // Is this worth fixing?
        const newImageState = this.calculateLocalState(image2, this.getLocalState(image1).depth + 1, true)
        this.states.set(key, newImageState)
      }

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

    // Set the angle of the vertices.
    const HALFANGLE = (this.p+1)/2
    this.setAngle(this.initVertex, HALFANGLE)
    this.setImageAngle(this.initVertex, HALFANGLE)
    this.btt.iter((state, parent, update) => {
      const edge = this.getEdgeState(parent, update.vertex)
      const imageEdge = this.getEdgeState(this.getImage(parent), this.getImage(update.vertex))
      const angle = edge.forward
      const imageAngle = imageEdge.forward
      this.setAngle(update.vertex, angle - state.angle - HALFANGLE)
      this.setImageAngle(update.vertex, imageAngle - state.imageAngle - HALFANGLE)

      return {value: {angle: edge.backward, imageAngle: imageEdge.backward}, stop: this.getLocalState(update.vertex).isLeaf}
    }, {angle: this.getAngle(this.initVertex), imageAngle: this.getImageAngle(this.initVertex)}, this.initVertex)

    // Set the global state of the origin.
    this.originGlobalState = {
      x: width/2,
      y: height/2,
      zeroAngle: 0,
      angle: 0, //2*Math.PI*(1/(this.p+1) - 1/4),
      depth: 0,
      edgeDepth: 0
    }

    // Set the global state of the image of the origin.
    this.imageGlobalState = this.btt.reducePath((globalState: GlobalState, v: Vertex, adj: Adj<Vertex, number>) => {
      const localState = this.getLocalState(adj.vertex)
      const edgeState = this.getEdgeState(v, adj.vertex)
      const angle = this.getAngle(adj.vertex)
      return this.accumulate(globalState, localState, edgeState, angle)
    }, this.initVertex, this.getImage(this.initVertex), this.originGlobalState)
    this.imageGlobalState.angle = this.imageGlobalState.zeroAngle
  }

  get numberOfVertices(): number {
    return (this.p**(this.depth)*(this.p + 1) - 2)/(this.p - 1)
  }

  calculateLocalState(v: Vertex, depth: number, isLeaf: boolean, image?: Vertex): LocalState {
    return {
      depth,
      isLeaf,
      type: depth % 2,
      inEnd: this.end ? this.btt.inEnd(v, this.end) : false,
      isMinTranslation: this.btt.translationDistance(this.isoInfo.iso, v) === this.isoInfo.minDist,
      key: this.btt.vertexToString(v),
      hitBoxInfo: {
        display: this.btt.vertexToLatex(v),
        imageKey: image ? this.btt.vertexToString(image) : undefined
      }
    }
  }

  makeIsoInfo(iso: Matrix<Rational>): IsoInfo {
    return {
      iso,
      minDist: this.btt.minVertexTranslationDistance(iso),
      isReflection: this.btt.isReflection(iso)
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

  hasEdgeState(v1: Vertex, v2: Vertex): boolean {
    const key = this.edgeKey(v1, v2)
    return (this.edges.has(key))
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

  setAngle(v: Vertex, angle: number) {
    this.setVertexMapOnce(this.angles, v, angle)
  }

  getAngle(v: Vertex): number {
    return this.getVertexMap(this.angles, v)
  }

  setImageAngle(v: Vertex, angle: number) {
    this.setVertexMapOnce(this.imageAngles, v, angle)
  }

  getImageAngle(v: Vertex): number {
    return this.getVertexMap(this.imageAngles, v)
  }

  accumulate(state: GlobalState, local: LocalState, edge: EdgeState, prevAngle: number): GlobalState {
    const scale = Math.pow(0.8 * Math.pow(1/this.p, 0.45), edge.depth - 1) * Math.pow(this.p, 0.2)
    const angle = state.angle - 2*Math.PI*prevAngle/(this.p+1)
    
    return {
      x: state.x + 160 * scale * Math.cos(angle),
      y: state.y + 160 * scale * Math.sin(angle),
      zeroAngle: angle + Math.PI + edge.backward * 2*Math.PI/(this.p + 1),
      angle,
      depth: local.depth,
      edgeDepth: edge.depth,
    }
  }

  interpLocalStates(state1: LocalState, state2: LocalState, t: number): LocalState {
    return {
      depth: lerp(state1.depth, state2.depth, t),
      isLeaf: boolOrLerp(state1.isLeaf, state2.isLeaf, t),
      type: lerp(state1.type, state2.type, t),
      inEnd: discreteLerp(state1.inEnd, state2.inEnd, t),
      isMinTranslation: discreteLerp(state1.isMinTranslation, state2.isMinTranslation, t),
      key: discreteLerp(state1.key, state2.key, t),
      hitBoxInfo: discreteLerp(state1.hitBoxInfo, state2.hitBoxInfo, t)
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
      angle: angleLerp(state1.angle, state2.angle, t),
      depth: lerp(state1.depth, state2.depth, t),
      edgeDepth: lerp(state1.edgeDepth, state2.edgeDepth, t),
    }
  }

  interpAngle(angle1: number, angle2: number, t: number): number {
    return radialLerp(angle1, angle2, t, this.p+1)
  }

  vertexColor(state: LocalState): string {
    if (this.options.highlight && state.key === this.options.highlight) {
      return this.theme.tree.highlightVertex
    }
    return mixRgba(this.type0Color, this.type1Color, state.type)
  }

  vertexStrokeColor(state: LocalState): string {
    if (this.showIsometry && !this.isoInfo.isReflection && state.isMinTranslation) {
      return this.isoInfo.minDist === 0 ? this.theme.tree.fixedPoints : this.theme.tree.translationAxis
    }
    if (this.options.showEnd && state.inEnd) return this.theme.tree.end
    return this.theme.tree.vertexStroke
  }

  edgeColor(state1: LocalState, state2: LocalState): string {
    if (this.showIsometry && !this.isoInfo.isReflection && state1.isMinTranslation && state2.isMinTranslation) {
      return this.isoInfo.minDist === 0 ? this.theme.tree.fixedPoints : this.theme.tree.translationAxis
    }
    if (this.options.showEnd && state1.inEnd && state2.inEnd) return this.theme.tree.end
    return this.theme.tree.edge
  }

  makeVertexGraphicsState(local: LocalState, global: GlobalState): VertexGraphicsState {
    return {
      x: global.x,
      y: global.y,
      scale: Math.pow(0.75, global.depth),
      color: this.vertexColor(local),
      strokeColor: this.vertexStrokeColor(local),
      hitBoxInfo: local.hitBoxInfo
    }
  }

  makeEdgeGraphicsState(local1: LocalState, global1: GlobalState, local2: LocalState, global2: GlobalState): EdgeGraphicsState {
    return {
      x1: global1.x,
      y1: global1.y,
      x2: global2.x,
      y2: global2.y,
      scale: Math.pow( 0.8 / Math.pow(this.p, 0.4), global2.edgeDepth - 1),
      color: this.edgeColor(local1, local2),
      subdivide: this.showIsometry && this.isoInfo.isReflection && local1.isMinTranslation && local2.isMinTranslation 
    }
  }

  drawVertex(context: CanvasRenderingContext2D, state: VertexGraphicsState) {
    const radius = this.theme.tree.vertexRadius * state.scale
    context.fillStyle = state.color
    context.strokeStyle = state.strokeColor
    context.lineWidth = this.theme.tree.vertexStrokeWidth * state.scale
    context.beginPath()
    context.arc(state.x, state.y, radius, 0, 2 * Math.PI)
    context.fill()
    context.stroke()

    if (this.options.hitbox) {
      const i = this.hitBoxes.add(state.x - radius, state.y - radius, state.x + radius, state.y + radius)
      this.hitBoxMap[i] = state.hitBoxInfo
    }
  }

  drawEdge(context: CanvasRenderingContext2D, state: EdgeGraphicsState) {
    context.strokeStyle = state.color
    context.lineWidth = this.theme.tree.branchWidth * state.scale
    context.beginPath()
    context.moveTo(state.x1, state.y1)
    context.lineTo(state.x2, state.y2)
    context.stroke()

    // If the midpoint is fixed, draw a small circle denoting the fixed point.
    if (state.subdivide) {
      context.fillStyle = this.theme.tree.fixedPoints
      context.lineWidth = this.theme.tree.vertexStrokeWidth * state.scale
      const radius = this.theme.tree.vertexRadius * state.scale*0.7
      context.beginPath()
      context.arc((state.x1 + state.x2)/2, (state.y1 + state.y2)/2, radius, 0, 2 * Math.PI)
      context.fill()
      context.stroke()
    }
  }

  interpolateTime(t): number {
    return (1-Math.cos((t * (Math.PI) / this.loopTime) % Math.PI))/2
  }

  render(context: CanvasRenderingContext2D, t: number) {
    const dpi = this.resolution * window.devicePixelRatio
    context.clearRect(0, 0, context.canvas.width / this.resolution, context.canvas.height / this.resolution)

    const vertexCanvas = document.createElement('canvas')
    vertexCanvas.width = context.canvas.width
    vertexCanvas.height = context.canvas.height

    const vertexContext = vertexCanvas.getContext('2d')
    if (vertexContext === null) {throw new Error('Failed to create canvas')}
    vertexContext.scale(dpi, dpi)

    const i = this.interpolateTime(t)

    const initLocalState1 = this.getLocalState(this.initVertex)
    const initLocalState2 = this.getLocalState(this.getImage(this.initVertex))
    const initLocalState: LocalState = this.interpLocalStates(initLocalState1, initLocalState2, i)

    const initGlobalState: GlobalState = this.interpGlobalStates(this.originGlobalState, this.imageGlobalState, i)

    if (this.options.hitbox) {
      this.hitBoxes = new Flatbush(this.numberOfVertices, 4, Int32Array)
      this.hitBoxMap = new Array(this.numberOfVertices)
    }

    this.drawVertex(vertexContext, this.makeVertexGraphicsState(initLocalState, initGlobalState))

    this.btt.iter((state, current, update) => {
      const {local: prevLocalState, global: prevGlobalState} = state
      const prevImage = this.getImage(current)
      const image = this.getImage(update.vertex)

      const localState = this.getLocalState(update.vertex)
      const imageLocalState = this.getLocalState(image)

      const edgeState = this.getEdgeState(current, update.vertex)
      const imageEdgeState = this.getEdgeState(prevImage, image)

      const angle = this.getAngle(update.vertex)
      const imageAngle = this.getImageAngle(update.vertex)

      const newLocalState = this.interpLocalStates(localState, imageLocalState, i)
      const newGlobalState = this.accumulate(
        prevGlobalState,
        newLocalState,
        this.interpEdgeStates(edgeState, imageEdgeState, i),
        this.interpAngle(angle, imageAngle, i)
      )
      const vertexGraphicsState = this.makeVertexGraphicsState(newLocalState, newGlobalState)
      const edgeGraphicsState = this.makeEdgeGraphicsState(prevLocalState, prevGlobalState, newLocalState, newGlobalState)

      this.drawVertex(vertexContext, vertexGraphicsState)
      this.drawEdge(context, edgeGraphicsState)
      
      return {value: {local: newLocalState, global: newGlobalState}, stop: localState.isLeaf}
    }, {local: initLocalState, global: initGlobalState}, this.initVertex)

    context.drawImage(vertexCanvas, 0, 0, vertexCanvas.width/dpi, vertexCanvas.height/dpi)

    if (this.hitBoxes) {
      this.hitBoxes.finish()
    }
  }

  get theme() {
    return this.options.theme
  }

  @cache get type0Color() {
    return parseToRgba(this.theme.tree.type0)
  }

  @cache get type1Color() {
    return parseToRgba(this.theme.tree.type1)
  }
}