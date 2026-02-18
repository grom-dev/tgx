import type { TgxElement, TgxElementPlain, TgxElementText } from './types.ts'

/**
 * Converts {@link TgxElement} to a string formatted for Telegram's
 * [HTML parse mode](https://core.telegram.org/bots/api#html-style).
 */
export function renderHtml(tgx: TgxElement | TgxElement[]): string {
  return (Array.isArray(tgx) ? tgx : [tgx])
    .map((el) => {
      switch (el.type) {
        case 'text': return renderTextElement(el)
        case 'plain': return renderPlainElement(el)
        case 'fragment': return renderHtml(el.subelements)
      }
      throw new Error(`Unknown element: ${el satisfies never}.`)
    })
    .join('')
}

function renderTextElement(el: TgxElementText): string {
  switch (el.entity.type) {
    case 'bold': return `<b>${renderHtml(el.subelements)}</b>`
    case 'italic': return `<i>${renderHtml(el.subelements)}</i>`
    case 'underline': return `<u>${renderHtml(el.subelements)}</u>`
    case 'strikethrough': return `<s>${renderHtml(el.subelements)}</s>`
    case 'spoiler': return `<tg-spoiler>${renderHtml(el.subelements)}</tg-spoiler>`

    // TODO: Shouldn't we urlencode this?
    case 'link': return `<a href="${el.entity.url}">${renderHtml(el.subelements)}</a>`

    case 'custom-emoji': return `<tg-emoji emoji-id="${el.entity.id}">${el.entity.alt}</tg-emoji>`
    case 'code': return `<code>${renderHtml(el.subelements)}</code>`

    case 'codeblock': return (
      el.entity.language
        ? `<pre><code class="language-${el.entity.language}">${renderHtml(el.subelements)}</code></pre>`
        : `<pre>${renderHtml(el.subelements)}</pre>`
    )

    case 'blockquote': return (
      el.entity.expandable
        ? `<blockquote expandable>${renderHtml(el.subelements)}</blockquote>`
        : `<blockquote>${renderHtml(el.subelements)}</blockquote>`
    )
  }
}

function renderPlainElement({ value }: TgxElementPlain): string {
  if (value == null || typeof value === 'boolean')
    return ''
  return sanitize(String(value))
}

function sanitize(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;') // must be first
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
