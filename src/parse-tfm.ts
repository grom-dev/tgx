import type { MarkedToken, Token } from 'marked'
import type { IntrinsicElements, TgxElement, TgxNode } from './types.ts'
import { lexer } from 'marked'
import { createElement, Fragment } from './jsx.ts'

/**
 * Parses [Telegram-flavored Markdown](https://github.com/grom-dev/tfm) to
 * {@link TgxElement}.
 */
export function parseTfm(tfm: string): TgxElement {
  const tokens = lexer(tfm, {
    async: false,
    // GFM is required for strikethrough, task lists, etc.
    gfm: true,
    pedantic: false,
    silent: false,
  })
  return Fragment({ children: renderTokens(tokens) })
}

const BLOCK_TOKEN_TYPES = new Set(['heading', 'paragraph', 'list', 'code', 'blockquote', 'hr'])

function renderTokens(tokens: Array<Token>): Array<TgxNode> {
  const result: Array<TgxNode> = []
  let seenBlock = false
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (token.type === 'html') {
      const open = parseHtmlOpenTag(token.text)
      if (!open) {
        continue
      }
      const closeTag = `</${open.tag}>`
      let j
      for (j = i + 1; j < tokens.length; j++) {
        const t = tokens[j]!
        if (t.type === 'html' && t.text === closeTag) {
          break
        }
      }
      if (j < tokens.length) {
        const innerTokens = tokens.slice(i + 1, j)
        result.push(renderHtml(open.tag, open.attrs, innerTokens as Array<MarkedToken>))
        i = j
      }
      continue
    }
    if (BLOCK_TOKEN_TYPES.has(token.type)) {
      if (seenBlock) {
        result.push('\n\n')
      } else {
        seenBlock = true
      }
    }
    result.push(renderToken(token as MarkedToken))
  }
  return result
}

function renderToken(token: MarkedToken): TgxNode {
  switch (token.type) {
    case 'heading':
    case 'strong':
      return createElement('b', {}, renderTokens(token.tokens))
    case 'em':
      return createElement('i', {}, renderTokens(token.tokens))
    case 'del':
      return createElement('s', {}, renderTokens(token.tokens))
    case 'code':
      return createElement('codeblock', { lang: token.lang }, token.text)
    case 'codespan':
      return createElement('code', {}, token.text)
    case 'link':
      return createElement('a', { href: token.href }, renderTokens(token.tokens))
    case 'text':
    case 'paragraph':
    case 'list_item':
      return token.tokens ? renderTokens(token.tokens) : token.text
    case 'br':
      return '\n'
    case 'hr':
      return '—————————'
    case 'escape':
      return token.text
    case 'blockquote':
      return createElement('blockquote', {}, renderTokens(token.tokens))
    case 'image':
      return createElement('emoji', { alt: token.text, id: token.href }, null)
    case 'list': {
      const nodes: Array<TgxNode> = []
      // TODO: handle loose lists (token.loose)
      token.items.forEach((item, i) => {
        nodes.push(
          item.task
            ? '' // task items are handled by the checkbox token
            : (token.ordered ? `${i + 1}. ` : '• '),
        )
        nodes.push(renderTokens(item.tokens))
        if (i < token.items.length - 1) {
          nodes.push('\n')
        }
        return nodes
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

const HTML_OPEN_TAG_RE = /^<([a-z][a-z\d]*)(\s[^>]*)?>$/i
const HTML_ATTR_RE = /([a-z][a-z\d-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/gi

function parseHtmlOpenTag(s: string): {
  tag: string
  attrs: Record<string, string | undefined>
} | null {
  const m = s.trim().match(HTML_OPEN_TAG_RE)
  if (!m) {
    return null
  }
  const tag = m[1]!.toLowerCase()
  const attrsStr = m[2] ?? ''
  const attrs: Record<string, string | undefined> = {}
  for (const match of attrsStr.matchAll(HTML_ATTR_RE)) {
    attrs[match[1]!] = match[2] ?? match[3] ?? match[4]
  }
  return { tag, attrs }
}

function renderHtml(
  tag: string,
  attrs: Record<string, string | undefined>,
  tokens: Array<MarkedToken>,
): TgxNode {
  switch (tag) {
    case 'u':
      return createElement('u', {}, renderTokens(tokens))
    case 'spoiler':
      return createElement('spoiler', {}, renderTokens(tokens))
    case 'blockquote':
      return createElement('blockquote', { expandable: 'expandable' in attrs }, renderTokens(tokens))
    case 'time':
      return createElement(
        'time',
        {
          unix: Number.parseInt(attrs.unix ?? ''),
          format: attrs.format as IntrinsicElements['time']['format'],
        },
        renderTokens(tokens),
      )
  }
  throw new Error(`Unsupported HTML tag <${tag}>.`)
}
