![tgx](tgx.png)

[![jsr](https://jsr.io/badges/@grom/tgx)](https://jsr.io/@grom/tgx)
[![npm](https://img.shields.io/npm/v/%40grom.js%2Ftgx?style=flat&logo=npm&logoColor=%23CB0200&labelColor=%23fff&color=%23333)](https://www.npmjs.com/package/@grom.js/tgx)

[JSX](https://facebook.github.io/jsx/) runtime for composing Telegram messages.

## Installation

```sh
# Using npm
npm install @grom.js/tgx

# Using jsr
deno add jsr:@grom/tgx
```

Then in your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@grom.js/tgx" // "@grom/tgx" for jsr
    // ...
  }
}
```

## Example

Usage with [grammY](https://grammy.dev):

```tsx
import { html } from '@grom.js/tgx'
import { Bot } from 'grammy'

function Greeting(props: { name: string }) {
  return <>Hello, <b>{props.name}</b>!</>
}

const bot = new Bot(/* TOKEN */)

bot.command('start', async (ctx) => {
  await ctx.reply(
    html(<Greeting name={ctx.from.first_name} />),
    { parse_mode: 'HTML' }
  )
})

bot.start()
```

## License

[MIT](./LICENSE)
