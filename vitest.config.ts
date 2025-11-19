import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@grom.js/tgx/jsx-runtime': join(__dirname, 'src/jsx-runtime.ts'),
      '@grom.js/tgx/jsx-dev-runtime': join(__dirname, 'src/jsx-runtime.ts'),
    },
  },
  esbuild: {
    tsconfigRaw: readFileSync(join(__dirname, 'tsconfig.test.json'), 'utf-8'),
  },
  test: {
    root: __dirname,
    include: ['./test/**/*.test.(ts|tsx)'],
    coverage: {
      clean: true,
      enabled: false,
      reportOnFailure: false,
      provider: 'v8',
      reporter: ['text', 'html-spa'],
      include: ['./src/**/*.(ts|tsx)'],
    },
  },
})
