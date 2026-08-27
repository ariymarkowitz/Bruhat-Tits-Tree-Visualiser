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
 * not fully synchronised: Editing the display might not change the value, and
 * multiple displays may correspond to the same value. But an external change to
 * the value (not by user input) will update the display to match.
 * 
 * The source of truth for the value exists upstream of the input element; it is
 * read through `value()` and user input is handled through the 'onchange'
 * callback. When the value is changed upstream, the display is changed using
 * `format` without triggering `onchange`.
 * 
 * When the input itself is changed, the element handles the update by setting
 * `display` (either explicitly or via double binding) and calling `commit()`.
 * If `accept(display)` outputs `false`, then the change is immediately reverted,
 * as if nothing was typed. Otherwise, `parse(value)` is passed to `onchange` if
 * it does not return `incomplete`.
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
