import { mod } from "./int"

export function lerp(a: number, b: number, t: number) {
  return (b-a)*t + a
}

export function radialLerp(a: number, b: number, t: number, fullAngle: number) {
  b = a + mod(b - a, fullAngle)
  if (b - a >= fullAngle/2) {
    b -= fullAngle
  }
  return mod((b-a)*t + a, fullAngle)
}

export function angleLerp(a: number, b: number, t: number) {
  return radialLerp(a, b, t, 2*Math.PI)
}

export function discreteLerp<T>(a: T, b: T, t: number) {
  return (t < 1) ? a : b
}

export function boolOrLerp(a: boolean, b: boolean, t: number) {
  return (t < 1 && a) || (t > 0 && b)
}