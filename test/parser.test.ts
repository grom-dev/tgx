import type { TelegramMessageEntity } from '../src/parser.ts'
import { describe, expect, it } from 'vitest'
import { parseMessageEntities } from '../src/parser.ts'

describe('parseMessageEntities', () => {
  it('returns plain fragment when entities are missing', () => {
    expect(parseMessageEntities('hello')).toEqual({
      type: 'fragment',
      subelements: [{ type: 'plain', value: 'hello' }],
    })
  })

  it('parses nested entities with stable structure', () => {
    const text = 'hello world'
    const entities: TelegramMessageEntity[] = [
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
    const entities: TelegramMessageEntity[] = [
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
    const entities: TelegramMessageEntity[] = [
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
    const entities: TelegramMessageEntity[] = [
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
})
