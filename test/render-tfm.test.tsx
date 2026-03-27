import type { TgxElement } from '../src/index.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderTfm } from '../src/index.ts'

describe('renderTfm', async () => {
  const CASES_DIR = path.resolve(__dirname, 'render-tfm-cases')
  const CASE_NAMES = await fs
    .readdir(CASES_DIR)
    .then((files) =>
      files
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.slice(0, -3))
        .sort(),
    )
  const CASES = await Promise.all(
    CASE_NAMES.map(async (name) => ({
      name,
      tgx: ((await import(`./render-tfm-cases/${name}.tsx`)) as { default: TgxElement }).default,
      md: await fs.readFile(path.join(CASES_DIR, `${name}.md`), 'utf8'),
    })),
  )

  it.each(CASES)('should render $name', ({ tgx, md }) => {
    const result = renderTfm(tgx)
    expect(result.trim()).toBe(md.trim())
  })
})
