import { describe, expect, test } from 'vitest'
import { incomplete, inputValue, type InputValue } from './inputValue.svelte'

/**
 * Covers `commit` — how an edit becomes a reported value, and what happens when it
 * cannot. That is where the four inputs genuinely differ, so it is the part worth
 * pinning down.
 *
 * The prop→display sync is not covered: it is an `$effect`, and vite-plugin-svelte
 * compiles test modules in SSR mode, where effects never run. Testing it would mean
 * adding jsdom. Until then it is checked by hand, via the Depth-and-p walkthrough
 * in App.svelte.
 */
function harness<Value, Display>(
  initial: Value,
  options: Omit<Parameters<typeof inputValue<Value, Display>>[0], 'value' | 'onchange'>,
  /** How the owner responds to a reported value. Defaults to storing it as-is. */
  receive: (reported: Value) => Value = reported => reported
) {
  let owned = initial
  const input: InputValue<Display> = inputValue<Value, Display>({
    ...options,
    value: () => owned,
    onchange: reported => { owned = receive(reported) }
  })
  return {
    input,
    get value() { return owned },
    /** A keystroke, arriving before `commit` runs — the order `bind:value` produces. */
    type(edit: Display) { input.display = edit; input.commit() }
  }
}

/** A number field: text that is not a number reports nothing, as StepperInput does. */
const numberField = {
  format: (n: number) => n.toString(),
  parse: (text: string) => /^\d+$/.test(text) ? Number(text) : incomplete,
  accept: (text: string) => /^\d*$/.test(text)
}

describe('inputValue', () => {
  test('shows the initial value', () => {
    expect(harness(2, numberField).input.display).toBe('2')
  })

  test('reports what is typed', () => {
    const h = harness(2, numberField)
    h.type('37')
    expect(h.value).toBe(37)
    expect(h.input.display).toBe('37')
  })

  test('a rejected edit is undone to the last accepted display', () => {
    const h = harness(2, numberField)
    h.type('37')
    h.type('37x')
    expect(h.input.display).toBe('37')
    expect(h.value).toBe(37)
  })

  test('an edit that names no value keeps the previous value', () => {
    // StepperInput's `p`: '' is typeable but is not a number, so `p` stays put and the
    // half-finished text is left alone for the user to keep editing.
    const h = harness(2, numberField)
    h.type('')
    expect(h.value).toBe(2)
    expect(h.input.display).toBe('')
    h.type('3')
    expect(h.value).toBe(3)
  })

  test('an undone edit does not report anything', () => {
    let reports = 0
    const h = harness(2, { ...numberField }, reported => { reports++; return reported })
    h.type('9x')
    expect(reports).toBe(0)
    expect(h.value).toBe(2)
  })

  test('a value that can be nothing reports nothing', () => {
    // RationalInput's end point, where `undefined` is a value rather than `incomplete`.
    // This is the distinction the two behaviours turn on.
    const h = harness<number | undefined, string>(1, {
      format: n => n === undefined ? '' : n.toString(),
      parse: text => text === '' ? undefined : Number(text)
    })
    h.type('')
    expect(h.value).toBeUndefined()
    expect(h.input.display).toBe('')
  })

  test('a structural display syncs like a textual one', () => {
    // MatrixInput: the display is cells, and a cell still being typed reports as 0.
    const h = harness<number[], (number | undefined)[]>([1, 2], {
      format: pair => [...pair],
      parse: cells => cells.map(cell => cell ?? 0)
    })
    h.input.display[0] = undefined
    h.input.commit()
    expect(h.value).toEqual([0, 2])
    expect(h.input.display).toEqual([undefined, 2])
  })
})
