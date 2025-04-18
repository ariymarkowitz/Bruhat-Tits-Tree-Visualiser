import { parseToRgba } from 'color2k'
import Flatbush from 'flatbush'
import { Rational } from "../algebra/Field/Rationals"
import type { Vertex } from "../algebra/Tree/BruhatTitsTree"
import { BruhatTitsTree } from '../algebra/Tree/BruhatTitsTree'
import type { Adj } from '../algebra/Tree/UnrootedTree'
import { angleLerp, boolOrLerp, discreteLerp, lerp } from '../algebra/utils/math'
import type { Matrix } from "../algebra/VectorSpace/Matrix"
import type { Vec } from '../algebra/VectorSpace/VectorSpace'
import { mixRgba } from '../utils/color'
import type { Theme } from './../style/themes/themes'
import { Memoize } from 'fast-typescript-memoize'

export interface TreeOptions {
  end?: [number, number]
  isometry?: Matrix<[number, number]>
  showIsometry: boolean
  showEnd: boolean
  hitbox?: boolean
  highlight?: string
  theme: Theme
}

export interface InteractionState {
  key: string
  display: string
  imageKey: string
}

/**
 * The state known to a vertex, regardless of choice of origin.
 */
interface StaticState {
  depth: number
  isLeaf: boolean
  type: number
  inEnd: boolean
  isAbsolute: boolean
  event: InteractionState
}

/**
 * The state that is relative to the parent.
 */
interface RelativeState {
  zeroAngle: number
  edgeDepth: number
  angle: number
}

/**
 * The state of the vertex that is relative to the canvas.
 */
interface AbsoluteState {
  x: number
  y: number
}

const Relative = Symbol('Relative')
const Absolute = Symbol('Absolute')

interface VertexStateRelative {
  type: typeof Relative
  static: StaticState
  relative: RelativeState
  absolute?: AbsoluteState
}

interface VertexStateAbsolute {
  type: typeof Absolute
  static: StaticState
  relative: RelativeState
  absolute: AbsoluteState
}

type VertexState = VertexStateRelative | VertexStateAbsolute

interface EdgeState {
  forward: number
  reverse: number
}

/**
 * The state used to draw a vertex.
 */
interface VertexGraphics {
  x: number
  y: number
  scale: number
  color: string
  strokeColor: string
  event: InteractionState
}

/**
 * The state used to draw an edge.
 */
interface EdgeGraphics {
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
  isIdentity: boolean
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

  btt: BruhatTitsTree

  staticStates: Map<string, StaticState> = new Map()
  states: Map<string, VertexState> = new Map()

  loopTime = 2000

  showIsometry!: boolean
  isoInfo!: IsoInfo

  root!: Vertex
  rootImage!: Vertex

  hitBoxes!: Flatbush
  hitBoxMap!: Array<InteractionState>

  constructor(p: number, depth: number, options: TreeOptions, width: number, height: number, resolution: number = 1) {
    this.width = width
    this.height = height
    this.resolution = resolution

    this.p = p

    this.btt = new BruhatTitsTree(p)
    const V = this.btt.vspace

    this.depth = depth

    this.options = options
    this.end = options.end ? V.fromInts(options.end) : undefined

    this.setupIsometry()
    this.cacheAllVertices()
  }

  setupIsometry() {
    const M = this.btt.vspace.matrixAlgebra
    let iso: Matrix<Rational>
    if (this.options.isometry) {
      iso = this.options.isometry.map(v => v.map(e => Rational(e[0], e[1])))
      if (M.isSingular(iso)) {
        iso = M.one
        this.showIsometry = false
      } else {
        this.showIsometry = this.options.showIsometry
      }
    } else {
      iso = M.one
      this.showIsometry = false
    }

    this.isoInfo = {
      iso,
      minDist: this.btt.minVertexTranslationDistance(iso),
      isReflection: this.btt.isReflection(iso),
      isIdentity: this.btt.isIdentity(iso)
    }
  }

  edgeState(v: Vertex, adj: Adj<Vertex, number>): EdgeState {
    return {
      forward: adj.edge,
      reverse: this.btt.reverseEdge(v, adj.vertex, adj.edge)
    }
  }

  staticStateFromParams(v: Vertex, depth: number): StaticState {
    const image = this.btt.action(this.isoInfo.iso, v)
    return {
      depth,
      isLeaf: depth >= this.depth,
      type: depth % 2,
      inEnd: this.end ? this.btt.inEnd(v, this.end) : false,
      isAbsolute: this.btt.translationDistance(this.isoInfo.iso, v) === this.isoInfo.minDist,
      event: {
        key: this.cacheKey(v),
        display: this.btt.vertexToLatex(v),
        imageKey: this.cacheKey(image)
      }
    }
  }

  staticState(v: Vertex, parentState: StaticState): StaticState {
    return this.staticStateFromParams(v, parentState.depth + 1)
  }

  /**
   * Get the key of a vertex.
   */
  cacheKey(v: Vertex): string {
    return this.btt.vertexToString(v)
  }

  /**
   * Cache a vertex-indexed map.
   */
  cache<S, T extends S>(map: Map<string, S>, v: Vertex, value: T): T {
    const key = this.btt.vertexToString(v)
    map.set(key, value)
    return value
  }

  cacheStaticState(v: Vertex, parentState: StaticState): StaticState {
    const key = this.btt.vertexToString(v)
    if (this.staticStates.has(key)) {
      return this.staticStates.get(key)!
    } else {
      const state = this.staticState(v, parentState)
      this.staticStates.set(key, state)
      return state
    }
  }

  relativeState(staticState: StaticState, parent: VertexState, edge: EdgeState): VertexStateRelative {
    const angle = this.edgeAngle(edge.forward) + parent.relative.zeroAngle
    const zeroAngle = Math.PI + angle - this.edgeAngle(edge.reverse)
    const edgeDepth = Math.min(staticState.depth, parent.static.depth)
    return {
      type: Relative,
      static: staticState,
      relative: {
        zeroAngle,
        edgeDepth,
        angle
      }
    }
  }

  absoluteState(current: VertexState, parent: VertexStateAbsolute): VertexStateAbsolute {
    const angle = current.relative.angle
    return {
      ...current,
      type: Absolute,
      absolute: {
        x: parent.absolute.x + Math.cos(angle) * this.edgeLength(current.relative.edgeDepth),
        y: parent.absolute.y + Math.sin(angle) * this.edgeLength(current.relative.edgeDepth),
      }
    }
  }

  getStartVertex(iso: IsoInfo) {
    return this.btt.minTranslationVertexNearOrigin(iso.iso)
  }

  state(staticState: StaticState, parent: VertexState, edge: EdgeState): VertexState {
    let state: VertexState = this.relativeState(staticState, parent, edge)
    if (staticState.isAbsolute) {
      if (!parent.static.isAbsolute) throw new Error('Parent of absolute vertex is not absolute')
      if (parent.type !== Absolute) throw new Error('Parent of absolute vertex has no absolute state')
      state = this.absoluteState(state, parent)
    }
    return state
  }

  cacheState(v: Vertex, parentState: VertexState, edge: EdgeState): VertexState {
    const key = this.cacheKey(v)
    if (this.states.has(key)) return this.states.get(key)!

    const staticState = this.cacheStaticState(v, parentState.static)
    const state = this.state(staticState, parentState, edge)
    this.states.set(key, state)
    return state
  }

  originStaticState(): StaticState {
    return this.cache(this.staticStates, this.btt.origin, this.staticStateFromParams(this.btt.origin, 0))
  }

  originState(): VertexStateAbsolute {
    return {
      type: Absolute,
      static: this.originStaticState(),
      relative: {
        zeroAngle: 0,
        edgeDepth: 0,
        angle: 0
      },
      absolute: {
        x: this.width/2,
        y: this.height/2
      }
    }
  }

  rootState(v: Vertex): VertexStateAbsolute {
    interface PathState {
      vertex: Vertex,
      state: VertexStateAbsolute
    }

    const path = this.btt.path(this.btt.origin, v)
    const state = path.reduce<PathState>((previous: PathState, adj) => {
      const edgeState = this.edgeState(previous.vertex, adj)
      const staticState = this.cacheStaticState(adj.vertex, previous.state.static)
      const relativeState = this.relativeState(staticState, previous.state, edgeState)
      const absoluteState = this.absoluteState(relativeState, previous.state)
      return {
        vertex: adj.vertex,
        state: absoluteState
      }
    }, {
      vertex: this.btt.origin,
      state: this.originState()
    }).state

    return this.cache(this.states, v, state)
  }

  cacheStateFromPath(v: Vertex, state: VertexState, w: Vertex) {
    interface PathState {
      vertex: Vertex,
      state: VertexState
    }

    const path = this.btt.path(v, w)
    const finalState = path.reduce<PathState>((previous: PathState, adj) => {
      const edgeState = {
        forward: adj.edge,
        reverse: this.btt.reverse(previous.vertex, adj).edge
      }
      return {
        vertex: adj.vertex,
        state: this.cacheState(adj.vertex, previous.state, edgeState)
      }
    }, { vertex: this.btt.origin, state }).state

    return finalState
  }

  cacheAllVertices() {
    interface State {
      vertex: Vertex
      state: VertexState
      image: Vertex
      imageState: VertexState
    }

    const iso = this.isoInfo.iso

    this.root = this.btt.minTranslationVertexNearOrigin(iso)
    this.rootImage = this.btt.action(iso, this.root)
    const state = this.rootState(this.root)
    const imageState = this.cacheStateFromPath(this.root, state, this.rootImage)
    
    this.btt.iter<State>((prev: State, _, adj) => {
      const vertex = adj.vertex
      const image = this.btt.action(iso, vertex)

      const edgeState = this.edgeState(prev.vertex, adj)
      const imageAdj = this.btt.path(prev.image, image)[0]
      const imageEdgeState = this.edgeState(prev.image, imageAdj)

      const state = this.cacheState(vertex, prev.state, edgeState)
      const imageState = this.cacheState(image, prev.imageState, imageEdgeState)

      return {
        value: {
          vertex, image, state, imageState
        }, stop: state.static.isLeaf
      }
    }, { vertex: this.root, state: state, image: this.rootImage, imageState }, this.root)
  }

  key(v: Vertex): string {
    return this.btt.vertexToString(v)
  }

  edgeLength(depth: number): number {
    const scale = Math.pow(0.8 * Math.pow(1/this.p, 0.45), depth) * Math.pow(this.p, 0.2)
    return 160 * scale
  }

  edgeAngle(edge: number): number {
    return -edge * 2*Math.PI / (this.p + 1)
  }

  interpStaticStates(state1: StaticState, state2: StaticState, t: number): StaticState {
    return {
      depth: lerp(state1.depth, state2.depth, t),
      isLeaf: boolOrLerp(state1.isLeaf, state2.isLeaf, t),
      type: lerp(state1.type, state2.type, t),
      inEnd: discreteLerp(state1.inEnd, state2.inEnd, t),
      isAbsolute: discreteLerp(state1.isAbsolute, state2.isAbsolute, t),
      event: discreteLerp(state1.event, state2.event, t)
    }
  }

  interpRelativeStates(state1: RelativeState, state2: RelativeState, t: number): RelativeState {
    return {
      zeroAngle: angleLerp(state1.zeroAngle, state2.zeroAngle, t),
      edgeDepth: lerp(state1.edgeDepth, state2.edgeDepth, t),
      angle: angleLerp(state1.angle, state2.angle, t),
    }
  }

  interpAbsoluteStates(state1: VertexStateAbsolute, state2: VertexStateAbsolute, t: number): AbsoluteState {
    return {
      x: lerp(state1.absolute.x, state2.absolute.x, t),
      y: lerp(state1.absolute.y, state2.absolute.y, t)
    }
  }

  interpStates(state1: VertexState, state2: VertexState, t: number): VertexState {
    if (state1.type === Absolute && state2.type === Absolute) {
      return {
        type: Absolute,
        static: this.interpStaticStates(state1.static, state2.static, t),
        relative: this.interpRelativeStates(state1.relative, state2.relative, t),
        absolute: this.interpAbsoluteStates(state1, state2, t)
      }
    } else if (state1.type === Relative && state2.type === Relative) {
      return {
        type: Relative,
        static: this.interpStaticStates(state1.static, state2.static, t),
        relative: this.interpRelativeStates(state1.relative, state2.relative, t)
      }
    } else {
      throw new Error('Types of states are not equal')
    }
  }

  vertexColor(state: VertexState): string {
    if (this.options.highlight && state.static.event.key === this.options.highlight) {
      return this.theme.tree.highlightVertex
    }
    return mixRgba(this.type0Color, this.type1Color, state.static.type)
  }

  vertexStrokeColor(state: VertexState): string {
    if (this.showIsometry && !this.isoInfo.isReflection && state.static.isAbsolute) {
      return this.isoInfo.minDist === 0 ? this.theme.tree.fixedPoints : this.theme.tree.translationAxis
    }
    if (this.options.showEnd && state.static.inEnd) return this.theme.tree.end
    return this.theme.tree.vertexStroke
  }

  edgeColor(state1: VertexState, state2: VertexState): string {
    if (this.showIsometry && !this.isoInfo.isReflection && state1.static.isAbsolute && state2.static.isAbsolute) {
      return this.isoInfo.minDist === 0 ? this.theme.tree.fixedPoints : this.theme.tree.translationAxis
    }
    if (this.options.showEnd && state1.static.inEnd && state2.static.inEnd) return this.theme.tree.end
    return this.theme.tree.edge
  }

  makeVertexGraphicsState(state: VertexStateAbsolute): VertexGraphics {
    return {
      x: state.absolute.x,
      y: state.absolute.y,
      scale: Math.pow(0.75, state.static.depth),
      color: this.vertexColor(state),
      strokeColor: this.vertexStrokeColor(state),
      event: state.static.event
    }
  }

  makeEdgeGraphicsState(state1: VertexStateAbsolute, state2: VertexStateAbsolute): EdgeGraphics {
    return {
      x1: state1.absolute.x,
      y1: state1.absolute.y,
      x2: state2.absolute.x,
      y2: state2.absolute.y,
      scale: Math.pow( 0.8 / Math.pow(this.p, 0.4), state2.relative.edgeDepth),
      color: this.edgeColor(state1, state2),
      subdivide: this.showIsometry && this.isoInfo.isReflection && state1.static.isAbsolute && state2.static.isAbsolute 
    }
  }

  drawVertex(context: CanvasRenderingContext2D, state: VertexGraphics) {
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
      this.hitBoxMap[i] = state.event
    }
  }

  drawEdge(context: CanvasRenderingContext2D, state: EdgeGraphics) {
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

  interpolateTime(t: number): number {
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

    if (this.options.hitbox) {
      this.hitBoxes = new Flatbush(this.numberOfVertices, 4, Int32Array)
      this.hitBoxMap = new Array(this.numberOfVertices)
    }

    const rootKey = this.cacheKey(this.root)
    const rootImageKey = this.cacheKey(this.rootImage)

    const rootState = this.states.get(rootKey)
    const rootImageState = this.states.get(rootImageKey)
    if (rootState === undefined) throw new Error('Root state not cached')
    if (rootImageState === undefined) throw new Error('Root image state not cached')

    const rootInterpState = this.interpStates(rootState, rootImageState, i)
    if (rootInterpState.type !== Absolute) throw new Error('Root state is not absolute')
    this.drawVertex(vertexContext, this.makeVertexGraphicsState(rootInterpState))

    this.btt.iter((prevState: VertexStateAbsolute, current, adj) => {
      const state = this.states.get(this.cacheKey(adj.vertex))
      if (state === undefined) throw new Error('Vertex state not cached')
      const imageState = this.states.get(state.static.event.imageKey)
      if (imageState === undefined) throw new Error('Vertex image state not cached')
      const interpState = this.interpStates(state, imageState, i)
      const absoluteState = interpState.type === Absolute ? interpState : this.absoluteState(interpState, prevState)
      const vertexGraphicsState = this.makeVertexGraphicsState(absoluteState)
      const edgeGraphicsState = this.makeEdgeGraphicsState(prevState, absoluteState)

      this.drawVertex(vertexContext, vertexGraphicsState)
      this.drawEdge(context, edgeGraphicsState)
      
      return {value: absoluteState, stop: state.static.isLeaf}
    }, rootInterpState, this.root)

    context.drawImage(vertexCanvas, 0, 0, vertexCanvas.width/dpi, vertexCanvas.height/dpi)

    if (this.hitBoxes) {
      this.hitBoxes.finish()
    }
  }

  get theme() {
    return this.options.theme
  }

  @Memoize() get type0Color() {
    return parseToRgba(this.theme.tree.type0)
  }

  @Memoize() get type1Color() {
    return parseToRgba(this.theme.tree.type1)
  }

  @Memoize() get numberOfVertices() {
    return (this.p**(this.depth)*(this.p + 1) - 2)/(this.p - 1)
  }
}