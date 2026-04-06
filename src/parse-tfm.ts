import type { MarkedToken, Token } from 'marked'
import type { IntrinsicElements, TgxElement, TgxNode } from './types.ts'
import { lexer } from 'marked'
import { createElement, Fragment } from './jsx.ts'

/**
 * Parses [Telegram-flavored Markdown](https://github.com/grom-dev/tfm) to
 * {@link TgxElement}.
 */
export function parseTfm(tfm: string): TgxElement {
  return Fragment({ children: renderBlockTokens(tokenize(tfm)) })
}

const LEXER_OPTIONS = {
  async: false,
  // GFM is required for strikethrough, task lists, etc.
  gfm: true,
  pedantic: false,
  silent: false,
} as const

function tokenize(str: string): Array<Token> {
  return lexer(str, LEXER_OPTIONS)
}

const BLOCK_TOKEN_TYPES = new Set(['heading', 'paragraph', 'list', 'code', 'blockquote', 'hr'])

/**
 * Renders a block-level token stream (top-level, list item content, blockquote
 * content). Inserts `separator` before block-type tokens when any content was
 * already emitted — including non-block tokens like `text` (which appears
 * before a nested `list` in tight list items).
 *
 * `listDepth` tracks nesting level to adjust bullet/number prefixes.
 */
function renderBlockTokens(tokens: Array<Token>, separator = '\n\n', listDepth = 0): Array<TgxNode> {
  const result: Array<TgxNode> = []
  // Set to true for any non-space token, so that a non-block token (e.g.
  // `text` in a tight list item) still triggers a separator before a following
  // block token (e.g. a nested `list`).
  let seenContent = false
  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]!
    if (token.type === 'space') {
      i++
      continue
    }
    if (token.type === 'html') {
      const consumed = consumeHtmlTag(tokens, i)
      if (consumed) {
        if (seenContent) {
          result.push(separator)
        }
        seenContent = true
        result.push(renderHtmlTag(consumed.tag, consumed.attrs, consumed.innerTokens))
        i = consumed.nextIndex
      } else {
        i++
      }
      continue
    }
    if (BLOCK_TOKEN_TYPES.has(token.type) && seenContent) {
      result.push(separator)
    }
    seenContent = true
    result.push(renderToken(token as MarkedToken, listDepth))
    i++
  }
  return result
}

/**
 * Renders an inline token stream (content of paragraphs, emphasis, links,
 * etc.). Never inserts block separators.
 */
function renderInlineTokens(tokens: Array<Token>): Array<TgxNode> {
  const result: Array<TgxNode> = []
  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]!
    if (token.type === 'html') {
      const consumed = consumeHtmlTag(tokens, i)
      if (consumed) {
        result.push(renderHtmlTag(consumed.tag, consumed.attrs, consumed.innerTokens))
        i = consumed.nextIndex
        continue
      }
    }
    result.push(renderToken(token as MarkedToken))
    i++
  }
  return result
}

/**
 * Tries to consume a `<tag>...</tag>` HTML structure starting at index `i`.
 * Handles both single-token (`<tag>content</tag>`) and multi-token forms where
 * marked splits the opening tag, inner content, and closing tag separately.
 * Returns `null` if the token at `i` is not a recognised open tag.
 */
function consumeHtmlTag(
  tokens: Array<Token>,
  i: number,
): {
  tag: string
  attrs: Record<string, string | undefined>
  innerTokens: Array<MarkedToken>
  nextIndex: number
} | null {
  const token = tokens[i]
  if (!token || token.type !== 'html') {
    return null
  }
  const open = parseHtmlOpenTag(token.text)
  if (!open) {
    return null
  }
  const { tag, attrs, rest } = open

  // Single token: `<tag>content</tag>`
  const singleClose = rest.match(new RegExp(`^([\\s\\S]*?)</${tag}>\\s*$`, 'i'))
  if (singleClose) {
    return { tag, attrs, innerTokens: tokenize(singleClose[1]!) as Array<MarkedToken>, nextIndex: i + 1 }
  }

  // Multi-token: scan ahead for the matching closing tag
  for (let j = i + 1; j < tokens.length; j++) {
    const t = tokens[j]!
    if (t.type === 'html' && t.text.trim() === `</${tag}>`) {
      const innerRaw = rest + tokens.slice(i + 1, j).map((t) => t.raw).join('')
      return { tag, attrs, innerTokens: tokenize(innerRaw) as Array<MarkedToken>, nextIndex: j + 1 }
    }
  }

  return null
}

function renderToken(token: MarkedToken, listDepth = 0): TgxNode {
  switch (token.type) {
    case 'heading':
    case 'strong':
      return createElement('b', {}, renderInlineTokens(token.tokens))
    case 'em':
      return createElement('i', {}, renderInlineTokens(token.tokens))
    case 'del':
      return createElement('s', {}, renderInlineTokens(token.tokens))
    case 'code':
      return createElement('codeblock', { lang: token.lang }, token.text)
    case 'codespan':
      return createElement('code', {}, token.text)
    case 'link':
      return createElement('a', { href: token.href }, renderInlineTokens(token.tokens))
    case 'text':
    case 'paragraph':
    case 'list_item':
      return token.tokens ? renderInlineTokens(token.tokens) : token.text
    case 'br':
      return '\n'
    case 'hr':
      return '—————————'
    case 'escape':
      return token.text
    case 'blockquote':
      return createElement('blockquote', {}, renderBlockTokens(token.tokens))
    case 'image':
      return createElement('emoji', { alt: token.text, id: token.href }, null)
    case 'list': {
      const nodes: Array<TgxNode> = []
      const indent = '  '.repeat(listDepth)
      const bulletPrefix = `${indent}• `
      const orderedPrefix = (i: number): string => `${indent}${i + 1}. `
      const itemSeparator = token.loose ? '\n\n' : '\n'
      token.items.forEach((item, i) => {
        nodes.push(
          item.task
            ? '' // task items are handled by the checkbox token
            : (token.ordered ? orderedPrefix(i) : bulletPrefix),
        )
        nodes.push(renderBlockTokens(item.tokens, '\n', listDepth + 1))
        if (i < token.items.length - 1) {
          nodes.push(itemSeparator)
        }
      })
      return nodes
    }
    case 'checkbox':
      return token.checked ? '☑ ' : '☐ '
    case 'space':
      return ''
  }
  throw new Error(`Unexpected token of type "${token.type}".`)
}

const HTML_OPEN_TAG_RE = /^<([a-z][a-z\d]*)(\s[^>]*)?>/i
const HTML_ATTR_RE = /([a-z][a-z\d-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/gi

function parseHtmlOpenTag(s: string): {
  tag: string
  attrs: Record<string, string | undefined>
  rest: string
} | null {
  const m = s.match(HTML_OPEN_TAG_RE)
  if (!m) {
    return null
  }
  const tag = m[1]!.toLowerCase()
  const attrs: Record<string, string | undefined> = {}
  for (const match of (m[2] ?? '').matchAll(HTML_ATTR_RE)) {
    attrs[match[1]!] = match[2] ?? match[3] ?? match[4]
  }
  return { tag, attrs, rest: s.slice(m[0].length) }
}

function renderHtmlTag(
  tag: string,
  attrs: Record<string, string | undefined>,
  tokens: Array<MarkedToken>,
): TgxNode {
  switch (tag) {
    case 'u':
      return createElement('u', {}, renderInlineTokens(tokens))
    case 'spoiler':
      return createElement('spoiler', {}, renderBlockTokens(tokens))
    case 'blockquote':
      return createElement('blockquote', { expandable: 'expandable' in attrs }, renderBlockTokens(tokens))
    case 'time':
      return createElement(
        'time',
        {
          unix: Number.parseInt(attrs.unix ?? ''),
          format: attrs.format as IntrinsicElements['time']['format'],
        },
        renderInlineTokens(tokens),
      )
  }
  throw new Error(`Unsupported HTML tag <${tag}>.`)
}
