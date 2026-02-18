import type {
  Component,
  IntrinsicElements,
  TgxElement,
  TgxElementFragment,
  TgxNode,
} from './types.ts'

export function createElement<T extends keyof IntrinsicElements>(
  type: T,
  props: IntrinsicElements[T],
  children: TgxNode,
): TgxElement
export function createElement(
  type: Component,
  props: any,
  children: TgxNode,
): TgxElement
export function createElement(
  type: unknown,
  props: any,
  children: TgxNode,
): TgxElement {
  if (typeof type === 'string' && isNativeTag(type)) {
    return createElementIntrinsic({
      tag: type,
      props: { ...props, children },
    })
  }

  if (typeof type === 'function')
    return type({ ...props, children })

  throw new Error(`Invalid JSX component: ${type}.`)
}

export function Fragment(props?: { children?: TgxNode }): TgxElementFragment {
  return {
    type: 'fragment',
    subelements: elementsFromNode(props?.children ?? []),
  }
}

function elementsFromNode(node: TgxNode): TgxElement[] {
  switch (typeof node) {
    case 'string':
    case 'number':
    case 'boolean':
      return [{ type: 'plain', value: node }]
  }

  if (node == null)
    return [{ type: 'plain', value: node }]

  if (Array.isArray(node))
    return node.flatMap(child => elementsFromNode(child))

  return [node]
}

function isNativeTag(tag: string): tag is keyof IntrinsicElements {
  return ([
    'b',
    'i',
    'u',
    's',
    'spoiler',
    'a',
    'emoji',
    'code',
    'codeblock',
    'blockquote',
  ]).includes(tag)
}

function createElementIntrinsic(
  options: {
    [K in keyof IntrinsicElements]: {
      tag: K
      props: IntrinsicElements[K]
    }
  }[keyof IntrinsicElements],
): TgxElement {
  switch (options.tag) {
    case 'b':
      return {
        type: 'text',
        entity: { type: 'bold' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'i':
      return {
        type: 'text',
        entity: { type: 'italic' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'u':
      return {
        type: 'text',
        entity: { type: 'underline' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 's':
      return {
        type: 'text',
        entity: { type: 'strikethrough' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'spoiler':
      return {
        type: 'text',
        entity: { type: 'spoiler' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'a':
      return {
        type: 'text',
        entity: { type: 'link', url: options.props.href },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'emoji':
      return {
        type: 'text',
        entity: { type: 'custom-emoji', id: options.props.id, alt: options.props.alt },
        subelements: [],
      }
    case 'code':
      return {
        type: 'text',
        entity: { type: 'code' },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'codeblock':
      return {
        type: 'text',
        entity: { type: 'codeblock', language: options.props.lang },
        subelements: elementsFromNode(options.props.children ?? []),
      }
    case 'blockquote':
      return {
        type: 'text',
        entity: { type: 'blockquote', expandable: !!options.props.expandable },
        subelements: elementsFromNode(options.props.children ?? []),
      }
  }
}
