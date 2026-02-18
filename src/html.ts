import type { TgxElement, TgxElementPlain, TgxElementText } from './types.ts'

/**
 * Converts {@link TgxElement} to an HTML string formatted for Telegram's
 * HTML parse mode.
 */
export function html(tgx: TgxElement | TgxElement[]): string {
  return (Array.isArray(tgx) ? tgx : [tgx])
    .map((el) => {
      switch (el.type) {
        case 'plain': return htmlTgxPlainElement(el)
        case 'fragment': return html(el.subelements)
        case 'text': return htmlTgxTextElement(el)
      }
      throw new Error(`Unknown element: ${el satisfies never}.`)
    })
    .join('')
}

function htmlTgxPlainElement({ value }: TgxElementPlain): string {
  if (value == null || typeof value === 'boolean')
    return ''
  return sanitize(String(value))
}

function htmlTgxTextElement(el: TgxElementText): string {
  switch (el.entity.type) {
    case 'bold': return `<b>${html(el.subelements)}</b>`
    case 'italic': return `<i>${html(el.subelements)}</i>`
    case 'underline': return `<u>${html(el.subelements)}</u>`
    case 'strikethrough': return `<s>${html(el.subelements)}</s>`
    case 'spoiler': return `<tg-spoiler>${html(el.subelements)}</tg-spoiler>`

    // TODO: Shouldn't we urlencode this?
    case 'link': return `<a href="${el.entity.url}">${html(el.subelements)}</a>`

    case 'custom-emoji': return `<tg-emoji emoji-id="${el.entity.id}">${el.entity.alt}</tg-emoji>`
    case 'code': return `<code>${html(el.subelements)}</code>`

    case 'codeblock': return (
      el.entity.language
        ? `<pre><code class="language-${el.entity.language}">${html(el.subelements)}</code></pre>`
        : `<pre>${html(el.subelements)}</pre>`
    )

    case 'blockquote': return (
      el.entity.expandable
        ? `<blockquote expandable>${html(el.subelements)}</blockquote>`
        : `<blockquote>${html(el.subelements)}</blockquote>`
    )
  }
}

function sanitize(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;') // must be first
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
