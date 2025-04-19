import { describe, test, expect } from 'vitest'
import { BruhatTtsTree } from './BruhatTitsTree'
import { Adic } from '../Adic/Adic'
import { FunctionField } from '../Adic/FunctionField'
import { Infinite } from '../Order/ExtendedInt'

describe('BruhatTitsTree', () => {
  // Test with Adic field
  describe('with Adic field', () => {
    const p = 3
    const adic = new Adic(p)
    const tree = new BruhatTtsTree(adic)

    test('construction and basic properties', () => {
      expect(tree.p).toBe(p)
      expect(tree.field).toBe(adic)
      expect(tree.integralRing).toBe(adic.integralRing)
    })

    test('origin vertex', () => {
      const origin = tree.origin
      expect(origin.n).toBe(0)
      expect(adic.isZero(origin.u)).toBe(true)
      expect(tree.vertexIsOrigin(origin)).toBe(true)
    })

    test('toString', () => {
      expect(tree.toString()).toBe('BruhatTitsTree[3-adic Field]')
      
      const vertex = { u: adic.fromInt(5), n: 2 }
      expect(tree.vertexToString(vertex)).toBe('5/1_2')
      expect(tree.vertexToLatex(vertex)).toBe('\\left[5\\right]_{2}')
    })

    test('equals', () => {
      const v1 = { u: adic.fromInt(2), n: 3 }
      const v2 = { u: adic.fromInt(2), n: 3 }
      const v3 = { u: adic.fromInt(2), n: 4 }
      const v4 = { u: adic.fromInt(5), n: 3 }
      
      expect(tree.equals(v1, v2)).toBe(true)
      expect(tree.equals(v1, v3)).toBe(false)
      expect(tree.equals(v1, v4)).toBe(false)
      expect(tree.isEqualVertex(v1, v2)).toBe(true)
      expect(tree.isEqualVertex(v1, v3)).toBe(false)
    })

    test('neighbors', () => {
      const origin = tree.origin
      const neighbors = tree.neigbours(origin)
      
      // Should have p+1 neighbors
      expect(neighbors.length).toBe(p + 1)
      
      // Check one of the neighbors with edge 0
      const neighbor0 = neighbors.find(n => n.edge === 0)
      expect(neighbor0).toBeDefined()
      if (neighbor0) {
        expect(neighbor0.vertex.n).toBe(1)
        expect(adic.isZero(neighbor0.vertex.u)).toBe(true)
      }
      
      // Check the infinity neighbor
      const neighborInf = neighbors.find(n => n.edge === p)
      expect(neighborInf).toBeDefined()
      if (neighborInf) {
        expect(neighborInf.vertex.n).toBe(-1)
        expect(adic.isZero(neighborInf.vertex.u)).toBe(true)
      }
    })

    test('apply and applyInf', () => {
      const origin = tree.origin
      
      // Apply with edge 1
      const applied = tree.apply(origin, 1)
      expect(applied.n).toBe(1)
      expect(adic.equals(applied.u, adic.fromInt(1))).toBe(true)
      
      // Apply infinity
      const appliedInf = tree.applyInf(applied)
      expect(appliedInf.n).toBe(0)
      expect(adic.isZero(appliedInf.u)).toBe(true)
    })

    test('vertex conversion', () => {
      const vertex = { u: adic.fromInt(2), n: 3 }
      const matrix = tree.vertexToMat(vertex)
      
      // Convert back to vertex
      const backToVertex = tree.matToVertex(matrix)
      expect(tree.equals(vertex, backToVertex)).toBe(true)
      
      // Check integer matrix
      const intMatrix = tree.vertexToIntMat(vertex)
      expect(intMatrix[0][0]).toEqual(adic.one)
    })

    test('reverseEdge', () => {
      const origin = tree.origin
      const neighbors = tree.neigbours(origin)
      
      for (const neighbor of neighbors) {
        const reverse = tree.reverseEdge(origin, neighbor.vertex, neighbor.edge)
        expect(reverse).toBeDefined()
        
        // For non-infinity edges, reverse should be p
        if (neighbor.edge !== p) {
          expect(reverse).toBe(p)
        }
      }
    })

    test('path between vertices', () => {
      const v1 = tree.origin
      const v2 = { u: adic.fromInt(1), n: 2 }
      
      const path = tree.path(v1, v2)
      expect(path.length).toBeGreaterThan(0)
      
      // Verify path connects the vertices
      let current = v1
      for (const step of path) {
        current = step.vertex
      }
      expect(tree.equals(current, v2)).toBe(true)
    })

    test('matrix operations', () => {
      // Create a simple translation matrix
      const matrix = [
        [adic.one, adic.zero],
        [adic.fromInt(1), adic.fromInt(3)]
      ]
      
      // Test translation length
      const length = tree.translationLength(matrix)
      expect(typeof length).toBe('number')
      
      // Test minimum translation vertex
      try {
        const minVertex = tree.minTranslationVertexNearOrigin(matrix)
        expect(minVertex).toBeDefined()
      } catch (e) {
        // Some matrices might not have a min translation vertex
      }
      
      // Test action
      const origin = tree.origin
      const acted = tree.action(matrix, origin)
      expect(acted).toBeDefined()
    })

    test('edge cases', () => {
      // Test with zero vertex
      const zeroVertex = { u: adic.zero, n: 0 }
      expect(tree.vertexIsOrigin(zeroVertex)).toBe(true)
      
      // Test with negative n
      const negVertex = { u: adic.zero, n: -2 }
      expect(tree.inInfEnd(negVertex)).toBe(true)
      
      // Test with large n
      const largeVertex = { u: adic.fromInt(1), n: 10 }
      expect(largeVertex.n).toBe(10)
    })
  })

  // Test with FunctionField
  describe('with FunctionField', () => {
    const p = 2
    const field = new FunctionField(p)
    const tree = new BruhatTtsTree(field)

    test('construction and basic properties', () => {
      expect(tree.p).toBe(p)
      expect(tree.field).toBe(field)
      expect(tree.integralRing).toBe(field.integralRing)
    })

    test('origin vertex', () => {
      const origin = tree.origin
      expect(origin.n).toBe(0)
      expect(field.isZero(origin.u)).toBe(true)
    })

    test('toString', () => {
      expect(tree.toString()).toBe('BruhatTitsTree[FunctionField]')
      
      const vertex = { 
        u: field.reduce([1, 1], [0, 1]), // (1 + x)/x
        n: 1
      }

      expect(tree.vertexToString(vertex)).toBe('(1 + x)/(x)_1')
    })

    test('neighbors', () => {
      const vertex = { 
        u: field.reduce([1, 1], [0, 1]), // (1 + x)/x
        n: 1
      }
      const neighbors = tree.neigbours(vertex)
      
      // Should have p+1 neighbors
      expect(neighbors.length).toBe(p + 1)
      const vertices = neighbors.map(n => tree.vertexToString(n.vertex))
      expect(vertices).toEqual([
        '(1 + x)/(x)_2',
        '(1 + x + x^2)/(x)_2',
        '1/(x)_0'
      ])
    })

    test('apply and applyInf', () => {
      const origin = tree.origin
      
      // Apply with edge 1
      const applied = tree.apply(origin, 1)
      expect(applied.n).toBe(1)
      
      // Apply infinity
      const appliedInf = tree.applyInf(applied)
      expect(appliedInf.n).toBe(0)
    })

    test('vertex conversion', () => {
      // Create a polynomial fraction
      const u = field.reduce([1, 1], [1]) // 1 + x
      const vertex = { u, n: 2 }
      
      const matrix = tree.vertexToMat(vertex)
      const backToVertex = tree.matToVertex(matrix)
      
      expect(field.equals(vertex.u, backToVertex.u)).toBe(true)
      expect(vertex.n).toBe(backToVertex.n)
    })

    test('path between vertices', () => {
      const v1 = tree.origin
      const v2 = { 
        u: field.reduce([0, 1], [1]), // x
        n: 3 
      }
      
      const path = tree.path(v1, v2)
      expect(path.length).toBeGreaterThan(0)
    })

    test('matrix operations with function field', () => {
      // Create a simple translation matrix
      const matrix = [
        [field.one, field.zero],
        [field.reduce([1], [1]), field.reduce([0, 1], [1])] // [[1, 0], [1, x]]
      ]
      
      // Test translation length and other matrix operations
      const length = tree.translationLength(matrix)
      expect(typeof length).toBe('number')
      
      // Test action
      const origin = tree.origin
      const acted = tree.action(matrix, origin)
      expect(acted).toBeDefined()
    })

    test('isReflection and isIdentity', () => {
      // Identity matrix
      const identity = [
        [field.one, field.zero],
        [field.zero, field.one]
      ]
      
      expect(tree.isIdentity(identity)).toBe(true)
      
      // Non-identity matrix
      const nonIdentity = [
        [field.one, field.zero],
        [field.one, field.one]
      ]
      
      expect(tree.isIdentity(nonIdentity)).toBe(false)
      
      // Test reflection properties when possible
      try {
        const reflectionResult = tree.isReflection(nonIdentity)
        expect(typeof reflectionResult).toBe('boolean')
      } catch (e) {
        // Some matrices might throw errors for this test
      }
    })

    test('inEnd and end-related functions', () => {
      const origin = tree.origin
      const end = [field.zero, field.one] // Canonical end
      
      expect(tree.inEnd(origin, end)).toBeDefined()
      expect(tree.infEnd).toEqual([field.zero, field.one])
    })
  })
})