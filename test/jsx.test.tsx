import { describe, expect, it } from 'vitest'

describe('jsx', () => {
  it('should transform fragments', () => {
    // deno-lint-ignore jsx-no-useless-fragment
    expect(<></>).toEqual({
      type: 'fragment',
      subelements: [],
    })

    expect(<>Hi</>).toEqual({
      type: 'fragment',
      subelements: [{ type: 'plain', value: 'Hi' }],
    })
  })

  it('should transform plain elements', () => {
    expect(
      <>
        Some text 😄
        {12345}
        {0.123}
        {null}
        {undefined}
        {true}
        {false}
      </>,
    ).toEqual({
      type: 'fragment',
      subelements: [
        { type: 'plain', value: 'Some text 😄' },
        { type: 'plain', value: 12345 },
        { type: 'plain', value: 0.123 },
        { type: 'plain', value: null },
        { type: 'plain', value: undefined },
        { type: 'plain', value: true },
        { type: 'plain', value: false },
      ],
    })
  })

  it('should transform <b>', () => {
    expect(<b></b>).toEqual({
      type: 'text',
      entity: { type: 'bold' },
      subelements: [],
    })

    expect(<b>Bold text</b>).toEqual({
      type: 'text',
      entity: { type: 'bold' },
      subelements: [{ type: 'plain', value: 'Bold text' }],
    })
  })

  it('should transform <i>', () => {
    expect(<i></i>).toEqual({
      type: 'text',
      entity: { type: 'italic' },
      subelements: [],
    })

    expect(<i>Italic text</i>).toEqual({
      type: 'text',
      entity: { type: 'italic' },
      subelements: [{ type: 'plain', value: 'Italic text' }],
    })
  })

  it('should transform <u>', () => {
    expect(<u></u>).toEqual({
      type: 'text',
      entity: { type: 'underline' },
      subelements: [],
    })
    expect(<u>Underline text</u>).toEqual({
      type: 'text',
      entity: { type: 'underline' },
      subelements: [{ type: 'plain', value: 'Underline text' }],
    })
  })

  it('should transform <s>', () => {
    expect(<s></s>).toEqual({
      type: 'text',
      entity: { type: 'strikethrough' },
      subelements: [],
    })
    expect(<s>Strikethrough text</s>).toEqual({
      type: 'text',
      entity: { type: 'strikethrough' },
      subelements: [{ type: 'plain', value: 'Strikethrough text' }],
    })
  })

  it('should transform <spoiler>', () => {
    expect(<spoiler></spoiler>).toEqual({
      type: 'text',
      entity: { type: 'spoiler' },
      subelements: [],
    })
    expect(<spoiler>Spoiler text</spoiler>).toEqual({
      type: 'text',
      entity: { type: 'spoiler' },
      subelements: [{ type: 'plain', value: 'Spoiler text' }],
    })
  })

  it('should transform <code>', () => {
    expect(<code></code>).toEqual({
      type: 'text',
      entity: { type: 'code' },
      subelements: [],
    })
    expect(<code>Code text</code>).toEqual({
      type: 'text',
      entity: { type: 'code' },
      subelements: [{ type: 'plain', value: 'Code text' }],
    })
  })

  it('should transform <a>', () => {
    expect(<a href=""></a>).toEqual({
      type: 'text',
      entity: { type: 'link', url: '' },
      subelements: [],
    })

    expect(<a href="https://example.com">Link text</a>).toEqual({
      type: 'text',
      entity: { type: 'link', url: 'https://example.com' },
      subelements: [{ type: 'plain', value: 'Link text' }],
    })
  })

  it('should transform <emoji>', () => {
    expect(<emoji id="12345" alt="❤️" />).toEqual({
      type: 'text',
      entity: { type: 'custom-emoji', id: '12345', alt: '❤️' },
      subelements: [],
    })
  })

  it('should transform <codeblock>', () => {
    expect(<codeblock></codeblock>).toEqual({
      type: 'text',
      entity: {
        type: 'codeblock',
        language: undefined,
      },
      subelements: [],
    })

    expect(<codeblock>Code block</codeblock>).toEqual({
      type: 'text',
      entity: {
        type: 'codeblock',
        language: undefined,
      },
      subelements: [{ type: 'plain', value: 'Code block' }],
    })

    expect(<codeblock lang="python">print("Hello, world!")</codeblock>).toEqual({
      type: 'text',
      entity: {
        type: 'codeblock',
        language: 'python',
      },
      subelements: [{ type: 'plain', value: 'print("Hello, world!")' }],
    })
  })

  it('should transform <blockquote>', () => {
    expect(<blockquote></blockquote>).toEqual({
      type: 'text',
      entity: { type: 'blockquote', expandable: false },
      subelements: [],
    })
    expect(<blockquote>Quote</blockquote>).toEqual({
      type: 'text',
      entity: { type: 'blockquote', expandable: false },
      subelements: [{ type: 'plain', value: 'Quote' }],
    })
    expect(<blockquote expandable>expandable quote</blockquote>).toEqual({
      type: 'text',
      entity: { type: 'blockquote', expandable: true },
      subelements: [{ type: 'plain', value: 'expandable quote' }],
    })
  })

  it('should transform components', () => {
    const Repeat = (props: any) => (
      <>{Array.from({ length: props.n }).fill(props.children)}</>
    )

    expect(<Repeat n={3}>hi</Repeat>).toEqual({
      type: 'fragment',
      subelements: [
        { type: 'plain', value: 'hi' },
        { type: 'plain', value: 'hi' },
        { type: 'plain', value: 'hi' },
      ],
    })
  })
})
