import type { Characteristic } from '../Tree/TreeCanvas.svelte'

/** The rational number a/b. */
const q = (a: number, b = 1): [number, number] => [a, b]

/** The polynomial c₀ + c₁x + c₂x² + …, eg. `poly(0, 1)` is x and `poly()` is 0. */
const poly = (...coefficients: number[]): [number[], number[]] => [coefficients, [1]]

export interface Example {
  /** The label shown in the dropdown. */
  name: string
  characteristic: Characteristic
  p: number
  /**
   * The isometry. Note that the matrix [[a, b], [c, d]] acts on the boundary by
   * u -> (c + d*u)/(a + b*u); see MatrixInput.svelte.
   */
  matrix: [unknown, unknown][][]
}

export const examples: Example[] = [
  // Hyperbolic, translating the axis from 0 to ∞ by one step.
  {
    name: 'x ↦ 2x  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(1), q(0)], [q(0), q(2)]]
  },
  // The odd step of the Collatz map. Hyperbolic, of translation length 1.
  {
    name: 'x ↦ (3x + 1)/2  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(2), q(1)], [q(0), q(3)]]
  },
  // An involution swapping the ends 0 and ∞, fixing the line between the ends 1 and -1.
  {
    name: 'x ↦ 1/x  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(0), q(1)], [q(1), q(0)]]
  },
  // An inversion: it swaps 0 and ∞ without fixing a vertex, so it fixes an edge midpoint.
  {
    name: 'x ↦ 2/x  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(0), q(2)], [q(1), q(0)]]
  },
  // Elliptic of order 3, cyclically permuting the branches at the fixed vertex.
  {
    name: 'x ↦ (x + 1)/x  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(0), q(1)], [q(1), q(1)]]
  },
  // Hyperbolic, fixing the ends 1 and -1: its axis misses the vertex at the centre.
  {
    name: 'x ↦ (3x + 1)/(x + 3)  on  Q₂', characteristic: 'zero', p: 2,
    matrix: [[q(3), q(1)], [q(1), q(3)]]
  },
  // Elliptic, since 2 is a unit in Z₅: it fixes the axis from 0 to ∞ and rotates
  // the remaining four branches at each of its vertices.
  {
    name: 'x ↦ 2x  on  Q₅', characteristic: 'zero', p: 5,
    matrix: [[q(1), q(0)], [q(0), q(2)]]
  },
  // A parabolic of infinite order, fixing a horoball around the end ∞.
  {
    name: 'x ↦ x + 1  on  Q₃', characteristic: 'zero', p: 3,
    matrix: [[q(1), q(1)], [q(0), q(1)]]
  },
  // Multiplication by the uniformizer: the function field twin of x ↦ 2x on Q₂.
  {
    name: 'f ↦ x·f  on  F₂((x))', characteristic: 'nonzero', p: 2,
    matrix: [[poly(1), poly()], [poly(), poly(0, 1)]]
  },
  // The same matrix as x ↦ x + 1, but in characteristic p a parabolic has finite order.
  {
    name: 'f ↦ f + 1  on  F₂((x))', characteristic: 'nonzero', p: 2,
    matrix: [[poly(1), poly(1)], [poly(), poly(1)]]
  },
  // Elliptic of order 3, cyclically permuting the branches at the fixed vertex.
  {
    name: 'f ↦ (f + 1)/f  on  F₂((x))', characteristic: 'nonzero', p: 2,
    matrix: [[poly(), poly(1)], [poly(1), poly(1)]]
  },
  // An inversion: the determinant has odd valuation, so it fixes an edge midpoint.
  {
    name: 'f ↦ x/f  on  F₃((x))', characteristic: 'nonzero', p: 3,
    matrix: [[poly(), poly(0, 1)], [poly(1), poly()]]
  }
]
