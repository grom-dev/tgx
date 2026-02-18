![tgx](tgx.png)

[![npm](https://img.shields.io/npm/v/%40grom.js%2Ftgx?style=flat&logo=npm&logoColor=%23BB443E&logoSize=auto&label=Latest&labelColor=%23fff&color=%23BB443E)](https://www.npmjs.com/package/@grom.js/tgx)
[![jsr](https://img.shields.io/jsr/v/%40grom/tgx?style=flat&logo=jsr&logoColor=%231B3646&logoSize=auto&label=Latest&labelColor=%23F3E051&color=%231B3646)](https://jsr.io/@grom/tgx)

[JSX](https://facebook.github.io/jsx/) runtime for composing Telegram messages.

## Installation

```sh
# Using npm
npm install @grom.js/tgx

# Using JSR
deno add jsr:@grom/tgx
```

Then in your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@grom.js/tgx" // "@grom/tgx" for JSR
    // ...
  }
}
```

## Examples

Usage with [grammY](https://grammy.dev):

```jsx
import { Bot } from 'grammy'
import { renderHtml } from '@grom.js/tgx'

const Greeting = (props) => (
  <>Hello, <b>{props.name}</b>!</>
)

const bot = new Bot(/* TOKEN */)

bot.command('start', async (ctx) => {
  await ctx.reply(
    renderHtml(<Greeting name={ctx.from.first_name} />),
    { parse_mode: 'HTML' }
  )
})

bot.start()
```

Usage with [effect-tg](https://github.com/grom-dev/effect-tg):

```jsx
import { Content, Dialog, Send, Text } from 'effect-tg'

const Greeting = (props) => (
  <>Hello, <b>{props.name}</b>!</>
)

const greet = (id, name) => Send.sendMessage({
  dialog: Dialog.user(id),
  content: Content.text(Text.tgx(<Greeting name={name} />))
})
```

## License

[MIT](./LICENSE)
