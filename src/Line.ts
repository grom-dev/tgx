import type { PropsWithChildren, TgxElement } from './types.ts'
import { Fragment } from './jsx.ts'

/**
 * Simple component that wraps its children in a fragment and adds a newline.
 *
 * Useful for creating multi-line messages.
 *
 * @example
 * ```jsx
 * import { Line } from '@grom.js/tgx'
 *
 * const Greeting = (props) => (
 *   <>
 *     <Line>Hello, <b>{props.name}</b>!</Line>
 *     <Line/>
 *     <Line><i>How are you doing?</i></Line>
 *   </>
 * )
 * ```
 */
export function Line({ children }: PropsWithChildren): TgxElement {
  return Fragment({ children: [children, '\n'] })
}
