import { deepEquals } from '../utils/equals'

/**
 * Indicates that the displayed input does not parse to a value.
 */
export const incomplete = Symbol('incomplete')

export type InputValue<Display> = {
  /** The editable display. Bind the control to this. */
  display: Display
  /** Report the display as a value, or undo the edit if `accept` rejects it. */
  commit: () => void
}

export type InputValueOptions<Value, Display> = {
  /** The current value, read from props so external changes are tracked. */
  value: () => Value
  /** How a value is shown. */
  format: (value: Value) => Display
  /** What a display means, or `incomplete` to keep reporting the previous value. */
  parse: (display: Display) => Value | typeof incomplete
  /** Whether a display is typeable at all. A rejected edit is undone. */
  accept?: (display: Display) => boolean
  onchange: (value: Value) => void
}
/**
 * Creates a coordinated pair of value and display states. The two states are
 * only loosely coupled: editing the display might not change the value, and
 * different displays might correspond to the same value. An external change to
 * the value (one not driven by the element) updates the display to match.
 * 
 * The source of truth for the value lives upstream of the input element; it is
 * read through `value()` and updated through 'onchange'. The other direction
 * (a change driven by the element) is handled by setting `display` (directly or
 * via `bind:`) and calling `commit()`.
 */

export function inputValue<Value, Display>(
  { value, format, parse, accept = () => true, onchange }: InputValueOptions<Value, Display>
): InputValue<Display> {
  const initial = format(value())
  let display = $state(initial)
  // The last display `accept` allowed, restored when a later edit is rejected.
  let accepted = initial
  // The value this input last reported. Anything else in `value` came from outside.
  let emitted = value()

  $effect(() => {
    const current = value()
    if (deepEquals(current, emitted)) return
    emitted = current
    display = accepted = format(current)
  })

  return {
    get display() { return display },
    set display(edit) { display = edit },

    commit: () => {
      if (!accept(display)) {
        display = accepted
        return
      }
      accepted = display
      const parsed = parse(display)
      if (parsed === incomplete) return
      emitted = parsed
      onchange(parsed)
    }
  }
}
