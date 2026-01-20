![tgx](tgx.png)

[![jsr](https://img.shields.io/jsr/v/%40grom/tgx?style=flat&logo=jsr&logoColor=%231B3646&logoSize=auto&label=%C2%A0&labelColor=%23F3E051&color=%231B3646)](https://jsr.io/@grom/tgx)
[![npm](https://img.shields.io/npm/v/%40grom.js%2Ftgx?style=flat&logo=npm&logoColor=%23BB443E&logoSize=auto&label=%C2%A0&labelColor=%23fff&color=%23BB443E)](https://www.npmjs.com/package/@grom.js/tgx)

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
