import type { TextEntity, TgxElement, TgxElementText } from './types.ts'

export interface MessageEntity {
  type:
    | 'mention'
    | 'hashtag'
    | 'cashtag'
    | 'bot_command'
    | 'url'
    | 'email'
    | 'phone_number'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'spoiler'
    | 'code'
    | 'pre'
    | 'blockquote'
    | 'expandable_blockquote'
    | 'text_link'
    | 'text_mention'
    | 'custom_emoji'
    | (string & {})
  offset: number
  length: number
  url?: string
  language?: string
  custom_emoji_id?: string
  [key: string]: unknown
}

interface ParsedEntity {
  start: number
  end: number
  entity: TextEntity
}

interface OpenEntity {
  end: number
  node: TgxElementText
}

/**
 * Converts Telegram message `text` + `entities` into a TGX tree.
 *
 * Offsets/lengths follow Telegram's UTF-16 indexing model.
 * Invalid and crossing entities are ignored.
 */
export function parseMessageEntities(
  text: string,
  entities: readonly MessageEntity[] = [],
): TgxElement {
  const parsedEntities = collectValidEntities(text, entities)
  const root: TgxElement[] = []
  const openStack: OpenEntity[] = []
  const boundaries = buildBoundaries(parsedEntities, text.length)

  let cursor = 0
  for (const boundary of boundaries) {
    const chunk = text.slice(cursor, boundary)
    if (chunk && !isSuppressedChunk(openStack)) {
      const target = openStack.length > 0 ? openStack.at(-1)!.node.subelements : root
      target.push({ type: 'plain', value: chunk })
    }

    while (openStack.length > 0 && openStack.at(-1)!.end === boundary)
      openStack.pop()

    for (const item of parsedEntities) {
      if (item.start !== boundary)
        continue

      const node: TgxElementText = { type: 'text', entity: item.entity, subelements: [] }
      const target = openStack.length > 0 ? openStack.at(-1)!.node.subelements : root
      target.push(node)
      openStack.push({ end: item.end, node })
    }

    cursor = boundary
  }

  return { type: 'fragment', subelements: root }
}

function isSuppressedChunk(openStack: readonly OpenEntity[]): boolean {
  return openStack.at(-1)?.node.entity.type === 'custom-emoji'
}

function buildBoundaries(entities: readonly ParsedEntity[], textLength: number): number[] {
  const boundaries = new Set<number>([textLength])
  for (const entity of entities) {
    boundaries.add(entity.start)
    boundaries.add(entity.end)
  }
  return [...boundaries].sort((a, b) => a - b)
}

function collectValidEntities(
  text: string,
  entities: readonly MessageEntity[],
): ParsedEntity[] {
  const sorted = [...entities]
    .sort((a, b) => {
      if (a.offset !== b.offset)
        return a.offset - b.offset
      return b.length - a.length
    })

  const valid: ParsedEntity[] = []
  const stack: number[] = []

  for (const entity of sorted) {
    const start = entity.offset
    const end = entity.offset + entity.length

    if (!isValidRange(start, end, text.length))
      continue

    const mapped = mapEntity(text, entity, start, end)
    if (!mapped)
      continue

    while (stack.length > 0 && start >= stack.at(-1)!)
      stack.pop()

    if (stack.length > 0 && end > stack.at(-1)!)
      continue

    valid.push({ start, end, entity: mapped })
    stack.push(end)
  }

  return valid
}

function isValidRange(start: number, end: number, textLength: number): boolean {
  if (!Number.isInteger(start) || !Number.isInteger(end))
    return false
  if (start < 0 || end < 0 || end <= start)
    return false
  return end <= textLength
}

function mapEntity(
  text: string,
  entity: MessageEntity,
  start: number,
  end: number,
): TextEntity | null {
  switch (entity.type) {
    case 'bold':
      return { type: 'bold' }
    case 'italic':
      return { type: 'italic' }
    case 'underline':
      return { type: 'underline' }
    case 'strikethrough':
      return { type: 'strikethrough' }
    case 'spoiler':
      return { type: 'spoiler' }
    case 'code':
      return { type: 'code' }
    case 'pre':
      return { type: 'codeblock', language: entity.language }
    case 'text_link':
      return entity.url ? { type: 'link', url: entity.url } : null
    case 'custom_emoji':
      return entity.custom_emoji_id
        ? { type: 'custom-emoji', id: entity.custom_emoji_id, alt: text.slice(start, end) }
        : null
    case 'blockquote':
      return { type: 'blockquote', expandable: false }
    case 'expandable_blockquote':
      return { type: 'blockquote', expandable: true }
    default:
      return null
  }
}
