import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    semi: false,
    quotes: 'single',
    jsx: false,
  },
  formatters: true,
  typescript: true,
  type: 'lib',
  jsx: true,
  markdown: false, // disable linting of code snippets in Markdown
  rules: {
    'ts/no-empty-object-type': 'off',
    'ts/no-namespace': 'off',
    'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'style/arrow-parens': ['error', 'always'],
    'curly': ['error', 'all'],
  },
})
