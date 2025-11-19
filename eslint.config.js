import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    semi: false,
    quotes: 'single',
    jsx: true,
  },
  formatters: true,
  typescript: true,
  type: 'lib',
  jsx: true,
  markdown: false, // disable linting of code snippets in Markdown
  rules: {
    'ts/no-empty-object-type': 'off',
    'ts/no-namespace': 'off',
  },
})
