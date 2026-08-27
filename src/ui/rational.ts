export type Rational = [number, number] | undefined

/** Whether the text may stand in the input box, half-finished entries included. */
export function isTypeable(text: string, { allowInf }: { allowInf: boolean }): boolean {
  if (text === '') return true
  const pattern = allowInf ? /^-?\d* *(\/ *-?\d*)?$/ : /^-?\d* *(\/ *-?([1-9]\d*)?)?$/
  return pattern.test(text)
}

export function parse(text: string, { emptyIsZero }: { emptyIsZero: boolean }): Rational {
  if (text === '' && emptyIsZero) return [0, 1]
  const groups = /^(?<num>-?\d+) *(\/ *(?<den>-?\d+) *)?$/.exec(text)?.groups
  if (!groups?.num) return undefined

  const num = Number(groups.num)
  if (!groups.den) return [num, 1]

  const den = Number(groups.den)
  return num === 0 && den === 0 ? undefined : [num, den]
}

export function format(value: Rational): string {
  if (value === undefined) return ''
  const [num, den] = value
  return den === 1 ? `${num}` : `${num}/${den}`
}
