import type { MessageEntity } from '../src/parser.ts'
import { describe, expect, it } from 'vitest'
import { parseMessageEntities } from '../src/parser.ts'

function cu(value: string): number {
  return value.length
}

describe('parseMessageEntities', () => {
  it('returns plain fragment when entities are missing', () => {
    expect(parseMessageEntities('hello')).toEqual({
      type: 'fragment',
      subelements: [{ type: 'plain', value: 'hello' }],
    })
  })

  it('parses nested entities with stable structure', () => {
    const text = 'hello world'
    const entities: MessageEntity[] = [
      { type: 'bold', offset: 0, length: 11 },
      { type: 'italic', offset: 6, length: 5 },
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [{
        type: 'text',
        entity: { type: 'bold' },
        subelements: [
          { type: 'plain', value: 'hello ' },
          {
            type: 'text',
            entity: { type: 'italic' },
            subelements: [{ type: 'plain', value: 'world' }],
          },
        ],
      }],
    })
  })

  it('parses adjacent entities correctly', () => {
    const text = 'abcd'
    const entities: MessageEntity[] = [
      { type: 'bold', offset: 0, length: 2 },
      { type: 'italic', offset: 2, length: 2 },
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [
        {
          type: 'text',
          entity: { type: 'bold' },
          subelements: [{ type: 'plain', value: 'ab' }],
        },
        {
          type: 'text',
          entity: { type: 'italic' },
          subelements: [{ type: 'plain', value: 'cd' }],
        },
      ],
    })
  })

  it('maps link, codeblock and custom emoji entities', () => {
    const text = 'ab🙂de'
    const entities: MessageEntity[] = [
      { type: 'text_link', offset: 0, length: 2, url: 'https://example.com' },
      { type: 'custom_emoji', offset: 2, length: 2, custom_emoji_id: '42' },
      { type: 'pre', offset: 4, length: 1, language: 'ts' },
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [
        {
          type: 'text',
          entity: { type: 'link', url: 'https://example.com' },
          subelements: [{ type: 'plain', value: 'ab' }],
        },
        {
          type: 'text',
          entity: { type: 'custom-emoji', id: '42', alt: '🙂' },
          subelements: [],
        },
        {
          type: 'text',
          entity: { type: 'codeblock', language: 'ts' },
          subelements: [{ type: 'plain', value: 'd' }],
        },
        { type: 'plain', value: 'e' },
      ],
    })
  })

  it('ignores invalid and crossing entities', () => {
    const text = 'abcdef'
    const entities: MessageEntity[] = [
      { type: 'bold', offset: -1, length: 1 },
      { type: 'italic', offset: 0, length: 0 },
      { type: 'underline', offset: 0, length: 4 },
      { type: 'strikethrough', offset: 2, length: 4 }, // crossing with underline, should be skipped
      { type: 'code', offset: 4, length: 2 },
      { type: 'mention', offset: 0, length: 2 }, // unsupported, ignored
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [
        {
          type: 'text',
          entity: { type: 'underline' },
          subelements: [{ type: 'plain', value: 'abcd' }],
        },
        {
          type: 'text',
          entity: { type: 'code' },
          subelements: [{ type: 'plain', value: 'ef' }],
        },
      ],
    })
  })

  it('handles UTF-16 offsets for surrogate pairs and combining marks', () => {
    const text = 'A🙂e\u0301Ж'
    const emojiOffset = cu('A')
    const emojiLength = cu('🙂')
    const combiningOffset = cu('A🙂')
    const combiningLength = cu('e\u0301')
    const cyrillicOffset = cu('A🙂e\u0301')
    const cyrillicLength = cu('Ж')

    expect(emojiOffset).toBe(1)
    expect(emojiLength).toBe(2)
    expect(combiningOffset).toBe(3)
    expect(combiningLength).toBe(2)
    expect(cyrillicOffset).toBe(5)
    expect(cyrillicLength).toBe(1)

    const entities: MessageEntity[] = [
      { type: 'bold', offset: emojiOffset, length: emojiLength }, // 🙂
      { type: 'italic', offset: combiningOffset, length: combiningLength }, // e + combining acute
      { type: 'underline', offset: cyrillicOffset, length: cyrillicLength }, // Ж
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [
        { type: 'plain', value: 'A' },
        {
          type: 'text',
          entity: { type: 'bold' },
          subelements: [{ type: 'plain', value: '🙂' }],
        },
        {
          type: 'text',
          entity: { type: 'italic' },
          subelements: [{ type: 'plain', value: 'e\u0301' }],
        },
        {
          type: 'text',
          entity: { type: 'underline' },
          subelements: [{ type: 'plain', value: 'Ж' }],
        },
      ],
    })
  })

  it('handles UTF-16 offsets for ZWJ emoji sequences', () => {
    const family = '👨‍👩‍👧‍👦'
    const text = `x${family}y`
    const familyOffset = cu('x')
    const familyLength = cu(family)
    const tailOffset = cu(`x${family}`)

    expect(familyOffset).toBe(1)
    expect(familyLength).toBe(11)
    expect(tailOffset).toBe(12)

    const entities: MessageEntity[] = [
      { type: 'custom_emoji', offset: familyOffset, length: familyLength, custom_emoji_id: 'family-1' },
      { type: 'code', offset: tailOffset, length: cu('y') },
    ]

    expect(parseMessageEntities(text, entities)).toEqual({
      type: 'fragment',
      subelements: [
        { type: 'plain', value: 'x' },
        {
          type: 'text',
          entity: { type: 'custom-emoji', id: 'family-1', alt: family },
          subelements: [],
        },
        {
          type: 'text',
          entity: { type: 'code' },
          subelements: [{ type: 'plain', value: 'y' }],
        },
      ],
    })
  })
})
