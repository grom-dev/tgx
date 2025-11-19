import type { FunctionComponent, NativeElements, TgxElement } from './types.ts'
import { Fragment, render } from './jsx.ts'

function jsx(type: any, props: any, key: any): any {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  return render(type, props, children)
}

export {
  Fragment,
  jsx,
  jsx as jsxDEV,
  jsx as jsxs,
}

export namespace JSX {
  export type Element = TgxElement
  export type ElementType
    = | keyof NativeElements
      | FunctionComponent
  export interface ElementAttributesProperty { props: {} }
  export interface ElementChildrenAttribute { children: {} }
  export interface IntrinsicElements extends NativeElements {}
  export interface IntrinsicAttributes {}
}
