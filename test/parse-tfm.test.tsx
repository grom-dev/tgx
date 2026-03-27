import type { TgxElement } from '../src/index.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseTfm, renderHtml } from '../src/index.ts'

describe('parseTfm', async () => {
  const BASIC_CASES: Array<{
    name: string
    tfm: string
    expected: TgxElement
  }> = [
    {
      name: 'plain text',
      tfm: 'Hello, freedom!',
      expected: <>Hello, freedom!</>,
    },
    {
      name: 'bold',
      tfm: 'this is **bold** text',
      expected: <>this is <b>bold</b> text</>,
    },
    {
      name: 'italic',
      tfm: 'this is _italic_ text',
      expected: <>this is <i>italic</i> text</>,
    },
    {
      name: 'strikethrough',
      tfm: 'this is ~~strikethrough~~ text',
      expected: <>this is <s>strikethrough</s> text</>,
    },
  ]

  it.each(BASIC_CASES)('should parse $name', ({ tfm, expected }) => {
    const result = parseTfm(tfm)
    expect(result).toStrictEqual(expected)
  })

  const HTML_CASES_DIR = path.resolve(__dirname, 'parse-tfm-cases')
  const HTML_CASE_NAMES = await fs
    .readdir(HTML_CASES_DIR)
    .then((files) =>
      files
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.slice(0, -3))
        .sort(),
    )
  const HTML_CASES = await Promise.all(
    HTML_CASE_NAMES.map(async (name) => ({
      name,
      tfm: await fs.readFile(path.join(HTML_CASES_DIR, `${name}.md`), 'utf8'),
      txt: await fs.readFile(path.join(HTML_CASES_DIR, `${name}.txt`), 'utf8'),
    })),
  )

  it.each(HTML_CASES)('should parse and render HTML correctly for $name', ({ tfm, txt }) => {
    const tgx = parseTfm(tfm.trim())
    const result = renderHtml(tgx)
    expect(result.trim()).toBe(txt.trim())
  })
})
