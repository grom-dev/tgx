import type * as Tgx from './types.ts'
import { createElement, Fragment } from './jsx.ts'

function jsx(type: any, props: any, key: any): any {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  return createElement(type, props, children)
}

export {
  Fragment,
  jsx,
  jsx as jsxDEV,
  jsx as jsxs,
}

export namespace JSX {
  export type Element = Tgx.TgxElement
  export type ElementType
    = | keyof IntrinsicElements
      | Tgx.Component
  export interface ElementAttributesProperty { props: {} }
  export interface ElementChildrenAttribute { children: {} }
  export interface IntrinsicElements extends Tgx.IntrinsicElements {}
  export interface IntrinsicAttributes {}
}
