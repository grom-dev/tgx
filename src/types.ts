import type { PrismLanguage, StringWithSuggestions } from './_utils/types.ts'

export interface NativeElements {
  /**
   * Bold text.
   */
  b: PropsWithChildren

  /**
   * Italic text.
   */
  i: PropsWithChildren

  /**
   * Underlined text.
   */
  u: PropsWithChildren

  /**
   * Strikethrough text.
   */
  s: PropsWithChildren

  /**
   * Spoiler.
   */
  spoiler: PropsWithChildren

  /**
   * Inline URL or Telegram (deep) link.
   *
   * Read more about Telegram deep links:
   * https://core.telegram.org/api/links
   */
  a: PropsWithChildren<{
    /**
     * Link to open.
     *
     * @example "https://google.com"
     * @example "tg://resolve?domain=BotFather"
     */
    href: string
  }>

  /**
   * Custom Telegram emoji.
   */
  emoji: {
    /**
     * Unique identifier of the custom emoji.
     */
    id: string

    /**
     * Alternative emoji that will be shown instead of the custom emoji in
     * places where a custom emoji cannot be displayed.
     */
    alt: string
  }

  /**
   * Inline fixed-width code.
   */
  code: PropsWithChildren

  /**
   * Fixed-width code block with the optional programming language.
   */
  codeblock: PropsWithChildren<{
    /**
     * Programming or markup language of the block.
     *
     * Telegram uses libprisma for code highlighting,
     * so the following languages are supported:
     * https://github.com/TelegramMessenger/libprisma#supported-languages
     */
    lang?: StringWithSuggestions<PrismLanguage>
  }>

  /**
   * Block quotation. Can be expandable or not.
   */
  blockquote: PropsWithChildren<{
    expandable?: boolean
  }>
}

export type TgxNode
  = | TgxNode[]
    | TgxElement
    | string
    | number
    | boolean
    | null
    | undefined

export type PropsWithChildren<P = {}> = {
  children?: TgxNode
} & P

export type FunctionComponent = (props: any) => TgxElement

export type TgxElement
  = | TgxPlainValueElement
    | TgxFragmentElement
    | TgxTextElement

export interface TgxPlainValueElement {
  type: 'plain'
  value: string | number | boolean | null | undefined
}

export interface TgxFragmentElement {
  type: 'fragment'
  subelements: TgxElement[]
}

export interface TgxTextElement {
  type: 'text'
  entity: TextEntity
  subelements: TgxElement[]
}

export type TextEntity
  = | { type: 'bold' }
    | { type: 'italic' }
    | { type: 'underline' }
    | { type: 'strikethrough' }
    | { type: 'spoiler' }
    | { type: 'link', url: string }
    | { type: 'custom-emoji', id: string, alt: string }
    | { type: 'code' }
    | { type: 'codeblock', language?: string }
    | { type: 'blockquote', expandable: boolean }
