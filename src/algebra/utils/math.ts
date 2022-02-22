import { mod } from "./int"

export function lerp(a: number, b: number, t: number) {
  return (b-a)*t + a
}

export function angleLerp(a: number, b: number, t: number) {
  b = mod(b, 2*Math.PI)
  if (b - a >= Math.PI) {
    b -= 2*Math.PI
  }
  return (b-a)*t + a
}