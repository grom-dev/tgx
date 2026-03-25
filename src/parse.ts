import type { TextEntity, TgxElement, TgxElementText } from './types.ts'

/**
 * @see https://core.telegram.org/bots/api#messageentity
 */
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
    | 'date_time'
  offset: number
  length: number
  url?: string
  language?: string
  custom_emoji_id?: string
  unix_time?: number
  date_time_format?: string
}

/**
 * Converts formatted Telegram text with message entities to a {@link TgxElement}.
 */
export function parseEntities(
  text: string,
  entities: ReadonlyArray<MessageEntity> = [],
): TgxElement {
  const parsedEntities = mergeAdjacentEntities(collectValidEntities(text, entities))
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

    while (openStack.length > 0 && openStack.at(-1)!.end === boundary) {
      openStack.pop()
    }

    for (const item of parsedEntities) {
      if (item.start !== boundary) {
        continue
      }

      const node: TgxElementText = { type: 'text', entity: item.entity, subelements: [] }
      const target = openStack.length > 0 ? openStack.at(-1)!.node.subelements : root
      target.push(node)
      openStack.push({ end: item.end, node })
    }

    cursor = boundary
  }

  return { type: 'fragment', subelements: root }
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
 * Merges adjacent entities of the same type that exist at the same nesting
 * level. Two entities A and B (A.end === B.start) can be merged when no other
 * entity C creates a nesting boundary exactly between them:
 *   - Condition 1: no C with C.start ≤ A.start and C.end === A.end
 *     (C ends exactly at the boundary — merged M would escape C)
 *   - Condition 2: no C with C.start === B.start and C.end > B.end
 *     (C starts at the boundary and extends further — merged M would cross C)
 *
 * The process is repeated until no more merges are possible.
 */
function mergeAdjacentEntities(entities: ParsedEntity[]): ParsedEntity[] {
  let result = entities.slice()
  let pair = findMergePair(result)
  while (pair !== null) {
    const [i, j] = pair
    const A = result[i]!
    const B = result[j]!
    const merged: ParsedEntity = { start: A.start, end: B.end, entity: A.entity }
    result = result.filter((_, k) => k !== i && k !== j)
    result.push(merged)
    result.sort((a, b) => (a.start !== b.start ? a.start - b.start : b.end - a.end))
    pair = findMergePair(result)
  }
  return result
}

function findMergePair(entities: ParsedEntity[]): [number, number] | null {
  for (let i = 0; i < entities.length; i++) {
    for (let j = 0; j < entities.length; j++) {
      if (i === j) {
        continue
      }
      const A = entities[i]!
      const B = entities[j]!
      if (A.end !== B.start || !entitiesDeepEqual(A.entity, B.entity)) {
        continue
      }
      if (canMergeAdjacentEntities(A, B, entities)) {
        return [i, j]
      }
    }
  }
  return null
}

function canMergeAdjacentEntities(
  A: ParsedEntity,
  B: ParsedEntity,
  all: ParsedEntity[],
): boolean {
  for (const C of all) {
    if (C === A || C === B) {
      continue
    }
    if (C.start <= A.start && C.end === A.end) {
      return false
    }
    if (C.start === B.start && C.end > B.end) {
      return false
    }
  }
  return true
}

function entitiesDeepEqual(a: TextEntity, b: TextEntity): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function isSuppressedChunk(openStack: Array<OpenEntity>): boolean {
  return openStack.at(-1)?.node.entity.type === 'custom-emoji'
}

function buildBoundaries(entities: Array<ParsedEntity>, textLength: number): number[] {
  const boundaries = new Set<number>([textLength])
  for (const entity of entities) {
    boundaries.add(entity.start)
    boundaries.add(entity.end)
  }
  return Array.from(boundaries).sort((a, b) => a - b)
}

function collectValidEntities(
  text: string,
  entities: readonly MessageEntity[],
): ParsedEntity[] {
  const sorted = entities.toSorted((a, b) => {
    if (a.offset !== b.offset) {
      return a.offset - b.offset
    }
    return b.length - a.length
  })

  const valid: ParsedEntity[] = []
  const stack: number[] = []

  for (const entity of sorted) {
    const start = entity.offset
    const end = entity.offset + entity.length

    if (!isValidRange(start, end, text.length)) {
      continue
    }

    const mapped = mapEntity(text.slice(start, end), entity)
    if (!mapped) {
      continue
    }

    while (stack.length > 0 && start >= stack.at(-1)!) {
      stack.pop()
    }

    if (stack.length > 0 && end > stack.at(-1)!) {
      continue
    }

    valid.push({ start, end, entity: mapped })
    stack.push(end)
  }

  return valid
}

function isValidRange(start: number, end: number, textLength: number): boolean {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
    return false
  }
  if (start < 0 || end < 0 || end <= start) {
    return false
  }
  return end <= textLength
}

function mapEntity(
  content: string,
  entity: MessageEntity,
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
      return entity.url
        ? { type: 'link', url: entity.url }
        : null
    case 'custom_emoji':
      return entity.custom_emoji_id
        ? { type: 'custom-emoji', id: entity.custom_emoji_id, alt: content }
        : null
    case 'blockquote':
      return { type: 'blockquote', expandable: false }
    case 'expandable_blockquote':
      return { type: 'blockquote', expandable: true }
    case 'date_time':
      return entity.unix_time != null
        ? { type: 'date-time', unix: entity.unix_time, format: entity.date_time_format }
        : null
  }
  return null
}
