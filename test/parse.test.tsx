import type { MessageEntity, TgxElement } from '../src/index.ts'
import { describe, expect, it } from 'vitest'
import { parseEntities } from '../src/index.ts'

describe('parseEntities', () => {
  const TEST_CASES: Array<{
    name: string
    text: string
    entities?: Array<MessageEntity>
    expected: TgxElement
  }> = [
    {
      name: 'plain text w/o entities',
      text: 'hello',
      entities: [],
      expected: <>{'hello'}</>,
    },
    {
      name: 'nested entities with stable structure',
      text: 'hello world',
      entities: [
        { type: 'bold', offset: 0, length: 11 },
        { type: 'italic', offset: 6, length: 5 },
      ],
      expected: <><b>{'hello '}<i>{'world'}</i></b></>,
    },
    {
      name: 'adjacent entities',
      text: 'abcd',
      entities: [
        { type: 'bold', offset: 0, length: 2 },
        { type: 'italic', offset: 2, length: 2 },
      ],
      expected: <><b>{'ab'}</b><i>{'cd'}</i></>,
    },
    {
      name: 'link, codeblock and custom emoji',
      text: 'ab🙂de',
      entities: [
        { type: 'text_link', offset: 0, length: 2, url: 'https://example.com' },
        { type: 'custom_emoji', offset: 2, length: 2, custom_emoji_id: '42' },
        { type: 'pre', offset: 4, length: 1, language: 'ts' },
      ],
      expected: (
        <>
          <a href="https://example.com">{'ab'}</a>
          <emoji alt="🙂" id="42" />
          <codeblock lang="ts">{'d'}</codeblock>
          {'e'}
        </>
      ),
    },
    {
      name: 'ignoring invalid and crossing entities',
      text: 'abcdef',
      entities: [
        { type: 'bold', offset: -1, length: 1 },
        { type: 'italic', offset: 0, length: 0 },
        { type: 'underline', offset: 0, length: 4 },
        { type: 'strikethrough', offset: 2, length: 4 }, // crossing with underline, should be skipped
        { type: 'code', offset: 4, length: 2 },
        { type: 'mention', offset: 0, length: 2 }, // unsupported, ignored
      ],
      expected: (
        <>
          <u>{'abcd'}</u>
          <code>{'ef'}</code>
        </>
      ),
    },
    {
      name: 'UTF-16 offsets for ZWJ emoji sequences',
      text: `x${'👨‍👩‍👧‍👦'}y`,
      entities: [
        { type: 'custom_emoji', offset: 1, length: 11, custom_emoji_id: 'family-1' },
        { type: 'code', offset: 12, length: 1 },
      ],
      expected: <>{'x'}<emoji alt="👨‍👩‍👧‍👦" id="family-1" /><code>{'y'}</code></>,
    },
    {
      name: 'surrogate pairs',
      text: 'A🙂e\u0301Ж',
      entities: [
        { offset: 1, length: 2, type: 'bold' },
        { offset: 3, length: 2, type: 'italic' },
        { offset: 5, length: 1, type: 'underline' },
      ],
      expected: <>{'A'}<b>{'🙂'}</b><i>{'e\u0301'}</i><u>{'Ж'}</u></>,
    },
    {
      name: 'complex example',
      text: '😮‍💨ПРИМЕР🚫\n\n🇷🇺 - 俄罗斯\n🇺🇸 – Америка\n🇨🇳 — China\n\nмоноширинный ↔️ text\n\n\nconsole.log("👋 Hi there!")\n\n\nCopy this code → الرمز الترويجي ← for nothing.\n\nExpandable blockquote with bold, italic, spoiler, strikethrough, underline, and bold italic spoiler strikethrough underline text!\n\nTomorrow at 12:34.',
      entities: [
        { offset: 0, length: 5, type: 'custom_emoji', custom_emoji_id: '5192886773948107844' },
        { offset: 5, length: 6, type: 'bold' },
        { offset: 11, length: 2, type: 'custom_emoji', custom_emoji_id: '5776064103483184336' },
        { offset: 15, length: 4, type: 'text_link', url: 'https://en.wikipedia.org/wiki/Russia' },
        { offset: 26, length: 4, type: 'text_link', url: 'https://en.wikipedia.org/wiki/United_States' },
        { offset: 41, length: 4, type: 'text_link', url: 'https://en.wikipedia.org/wiki/China' },
        { offset: 55, length: 20, type: 'code' },
        { offset: 77, length: 29, type: 'pre', language: 'js' },
        { offset: 125, length: 14, type: 'code' },
        { offset: 156, length: 129, type: 'expandable_blockquote' },
        { offset: 183, length: 4, type: 'bold' },
        { offset: 189, length: 6, type: 'italic' },
        { offset: 197, length: 7, type: 'spoiler' },
        { offset: 206, length: 13, type: 'strikethrough' },
        { offset: 221, length: 9, type: 'underline' },
        { offset: 236, length: 5, type: 'bold' },
        { offset: 241, length: 7, type: 'bold' },
        { offset: 241, length: 7, type: 'italic' },
        { offset: 248, length: 8, type: 'bold' },
        { offset: 248, length: 8, type: 'italic' },
        { offset: 248, length: 8, type: 'spoiler' },
        { offset: 256, length: 14, type: 'bold' },
        { offset: 256, length: 14, type: 'italic' },
        { offset: 256, length: 14, type: 'strikethrough' },
        { offset: 256, length: 14, type: 'spoiler' },
        { offset: 270, length: 14, type: 'bold' },
        { offset: 270, length: 14, type: 'italic' },
        { offset: 270, length: 14, type: 'underline' },
        { offset: 270, length: 14, type: 'strikethrough' },
        { offset: 270, length: 14, type: 'spoiler' },
        { offset: 287, length: 17, type: 'date_time', unix_time: 1774510496, date_time_format: 'dt' },
      ],
      expected: (
        <>
          <emoji alt="😮‍💨" id="5192886773948107844" />
          <b>ПРИМЕР</b>
          <emoji alt="🚫" id="5776064103483184336" />
          {'\n\n'}
          <a href="https://en.wikipedia.org/wiki/Russia">🇷🇺</a>
          {' - 俄罗斯\n'}
          <a href="https://en.wikipedia.org/wiki/United_States">🇺🇸</a>
          {' – Америка\n'}
          <a href="https://en.wikipedia.org/wiki/China">🇨🇳</a>
          {' — China\n\n'}
          <code>моноширинный ↔️ text</code>
          {'\n\n'}
          <codeblock lang="js">{'\nconsole.log("👋 Hi there!")\n'}</codeblock>
          {'\n\nCopy this code → '}
          <code>{'الرمز الترويجي'}</code>
          {' ← for nothing.\n\n'}
          <blockquote expandable={true}>
            {'Expandable blockquote with '}
            <b>bold</b>
            {', '}
            <i>italic</i>
            {', '}
            <spoiler>spoiler</spoiler>
            {', '}
            <s>strikethrough</s>
            {', '}
            <u>underline</u>
            {', and '}
            <b>bold <i>italic <spoiler>spoiler <s>strikethrough <u>underline text</u></s></spoiler></i></b>
            {'!'}
          </blockquote>
          {'\n\n'}
          <time unix={1774510496} format="dt">Tomorrow at 12:34</time>
          {'.'}
        </>
      ),
    },
  ]

  it.each(TEST_CASES)('should parse $name', ({ text, entities, expected }) => {
    expect(parseEntities(text, entities)).toEqual(expected)
  })
})
