import type { TgxElement, TgxElementPlain, TgxElementText } from './types.ts'

const SPECIAL_CHARS_RE = /[\\*~`$[\]<>{}|^]/g

/**
 * Converts {@link TgxElement} to a string formatted as
 * [Telegram-Flavored Markdown](https://github.com/grom-dev/tfm).
 */
export function renderTfm(tgx: TgxElement | TgxElement[]): string {
  return (Array.isArray(tgx) ? tgx : [tgx])
    .map((el) => {
      switch (el.type) {
        case 'text': return renderTextElement(el)
        case 'plain': return renderPlainElement(el)
        case 'fragment': return renderTfm(el.subelements)
      }
      throw new Error(`Unknown element: ${el satisfies never}.`)
    })
    .join('')
}

function renderTextElement(el: TgxElementText): string {
  switch (el.entity.type) {
    case 'bold': return `**${renderTfm(el.subelements)}**`
    case 'italic': return `_${renderTfm(el.subelements)}_`
    case 'underline': return `<u>${renderTfm(el.subelements)}</u>`
    case 'strikethrough': return `~~${renderTfm(el.subelements)}~~`
    case 'spoiler': return `<spoiler>${renderTfm(el.subelements)}</spoiler>`
    case 'link': return `[${renderTfm(el.subelements)}](${el.entity.url})`
    case 'custom-emoji': return `![${el.entity.alt}](${el.entity.id})`
    case 'date-time': return (
      el.entity.format
        ? `<time unix="${el.entity.unix}" format="${el.entity.format}">${renderTfm(el.subelements)}</time>`
        : `<time unix="${el.entity.unix}">${renderTfm(el.subelements)}</time>`
    )
    case 'code': return `\`${renderLiteral(el.subelements)}\``
    case 'codeblock': return (
      el.entity.language
        ? `\`\`\`${el.entity.language}\n${renderLiteral(el.subelements)}\n\`\`\``
        : `\`\`\`\n${renderLiteral(el.subelements)}\n\`\`\``
    )
    case 'blockquote': return (
      el.entity.expandable
        ? `<blockquote expandable>\n${renderTfm(el.subelements)}\n</blockquote>`
        : renderTfm(el.subelements).split('\n').map((line) => `> ${line}`).join('\n')
    )
  }
}

/**
 * Renders subelements as literal text (no TFM escaping), for use inside
 * code spans and code blocks where content is always literal.
 */
function renderLiteral(subelements: TgxElement[]): string {
  return subelements
    .map((el) => {
      switch (el.type) {
        case 'plain': {
          if (el.value == null || typeof el.value === 'boolean') {
            return ''
          }
          return String(el.value)
        }
        case 'fragment': return renderLiteral(el.subelements)
        case 'text': return renderLiteral(el.subelements)
      }
      throw new Error(`Unknown element: ${el satisfies never}.`)
    })
    .join('')
}

function renderPlainElement({ value }: TgxElementPlain): string {
  if (value == null || typeof value === 'boolean') {
    return ''
  }
  return escape(String(value))
}

function escape(text: string): string {
  return text.replace(SPECIAL_CHARS_RE, '\\$&')
}
