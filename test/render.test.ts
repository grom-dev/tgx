import type { TgxElement } from '../src/types.ts'
import { describe, expect, it } from 'vitest'
import { renderHtml } from '../src/render.ts'

function plain(value: string | number | boolean | null | undefined): TgxElement {
  return { type: 'plain', value }
}

function fragment(...subelements: TgxElement[]): TgxElement {
  return { type: 'fragment', subelements }
}

function text(entity: TgxElement & { type: 'text' } extends { entity: infer E } ? E : never, ...subelements: TgxElement[]): TgxElement {
  return { type: 'text', entity, subelements } as TgxElement
}

describe('renderHtml', () => {
  it.each([
    ['null', plain(null), ''],
    ['undefined', plain(undefined), ''],
    ['true', plain(true), ''],
    ['false', plain(false), ''],
    ['a string', plain('hello'), 'hello'],
    ['a number', plain(42), '42'],
    ['zero', plain(0), '0'],
    ['a float', plain(3.14), '3.14'],
  ] as const)('should render plain element (%s)', (_label, input, expected) => {
    expect(renderHtml(input as TgxElement)).toBe(expected)
  })

  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['<b>&', '&lt;b&gt;&amp;'],
    ['no special chars', 'no special chars'],
  ])('should sanitize plain text %j → %j', (input, expected) => {
    expect(renderHtml(plain(input))).toBe(expected)
  })

  it.each([
    ['bold', { type: 'bold' as const }, '<b>x</b>'],
    ['italic', { type: 'italic' as const }, '<i>x</i>'],
    ['underline', { type: 'underline' as const }, '<u>x</u>'],
    ['strikethrough', { type: 'strikethrough' as const }, '<s>x</s>'],
    ['spoiler', { type: 'spoiler' as const }, '<tg-spoiler>x</tg-spoiler>'],
    ['code', { type: 'code' as const }, '<code>x</code>'],
  ])('should wrap text entity "%s" in correct HTML tag', (_label, entity, expected) => {
    expect(renderHtml(text(entity, plain('x')))).toBe(expected)
  })

  it.each([
    ['link with url', { type: 'link' as const, url: 'https://example.com' }, '<a href="https://example.com">x</a>'],
    ['link with empty url', { type: 'link' as const, url: '' }, '<a href="">x</a>'],
  ])('should render %s', (_label, entity, expected) => {
    expect(renderHtml(text(entity, plain('x')))).toBe(expected)
  })

  it.each([
    ['with id and alt', '12345', '❤️', '<tg-emoji emoji-id="12345">❤️</tg-emoji>'],
  ])('should render custom-emoji %s', (_label, id, alt, expected) => {
    expect(renderHtml(text({ type: 'custom-emoji', id, alt }))).toBe(expected)
  })

  it.each([
    ['without language', undefined, '<pre>code</pre>'],
    ['with language', 'python', '<pre><code class="language-python">code</code></pre>'],
  ])('should render codeblock %s', (_label, language, expected) => {
    expect(renderHtml(text({ type: 'codeblock', language }, plain('code')))).toBe(expected)
  })

  it.each([
    ['non-expandable', false, '<blockquote>q</blockquote>'],
    ['expandable', true, '<blockquote expandable>q</blockquote>'],
  ])('should render blockquote (%s)', (_label, expandable, expected) => {
    expect(renderHtml(text({ type: 'blockquote', expandable }, plain('q')))).toBe(expected)
  })

  it.each([
    ['empty fragment', fragment(), ''],
    ['fragment with one child', fragment(plain('a')), 'a'],
    ['fragment with multiple children', fragment(plain('a'), plain('b')), 'ab'],
  ])('should render %s', (_label, input, expected) => {
    expect(renderHtml(input)).toBe(expected)
  })

  it.each([
    ['single-element array', [plain('a')], 'a'],
    ['multi-element array', [plain('a'), plain('b')], 'ab'],
    ['mixed array', [plain('hi '), text({ type: 'bold' }, plain('world'))], 'hi <b>world</b>'],
  ])('should accept %s as input', (_label, input, expected) => {
    expect(renderHtml(input as TgxElement[])).toBe(expected)
  })

  it.each([
    [
      'nested formatting',
      text({ type: 'bold' }, text({ type: 'italic' }, plain('nested'))),
      '<b><i>nested</i></b>',
    ],
    [
      'fragment inside text entity',
      text({ type: 'bold' }, fragment(plain('a'), plain('b'))),
      '<b>ab</b>',
    ],
    [
      'sanitization inside tags',
      text({ type: 'bold' }, plain('<script>')),
      '<b>&lt;script&gt;</b>',
    ],
  ])('should handle %s', (_label, input, expected) => {
    expect(renderHtml(input)).toBe(expected)
  })

  it('should throw on unknown element type', () => {
    const bad = { type: 'unknown' } as unknown as TgxElement
    expect(() => renderHtml(bad)).toThrow()
  })
})
