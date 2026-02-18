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
     * @see https://github.com/TelegramMessenger/libprisma#supported-languages
     */
    lang?:
      | (string & {})
      | 'markup'
      | 'html'
      | 'xml'
      | 'svg'
      | 'mathml'
      | 'ssml'
      | 'atom'
      | 'rss'
      | 'css'
      | 'clike'
      | 'regex'
      | 'javascript'
      | 'js'
      | 'abap'
      | 'abnf'
      | 'actionscript'
      | 'ada'
      | 'agda'
      | 'al'
      | 'antlr4'
      | 'g4'
      | 'apacheconf'
      | 'sql'
      | 'apex'
      | 'apl'
      | 'applescript'
      | 'aql'
      | 'c'
      | 'cpp'
      | 'arduino'
      | 'ino'
      | 'arff'
      | 'armasm'
      | 'arm-asm'
      | 'bash'
      | 'sh'
      | 'shell'
      | 'yaml'
      | 'yml'
      | 'markdown'
      | 'md'
      | 'arturo'
      | 'art'
      | 'asciidoc'
      | 'adoc'
      | 'csharp'
      | 'cs'
      | 'dotnet'
      | 'aspnet'
      | 'asm6502'
      | 'asmatmel'
      | 'autohotkey'
      | 'autoit'
      | 'avisynth'
      | 'avs'
      | 'avro-idl'
      | 'avdl'
      | 'awk'
      | 'gawk'
      | 'basic'
      | 'batch'
      | 'bbcode'
      | 'shortcode'
      | 'bbj'
      | 'bicep'
      | 'birb'
      | 'bison'
      | 'bnf'
      | 'rbnf'
      | 'bqn'
      | 'brainfuck'
      | 'brightscript'
      | 'bro'
      | 'cfscript'
      | 'cfc'
      | 'chaiscript'
      | 'cil'
      | 'cilkc'
      | 'cilk-c'
      | 'cilkcpp'
      | 'cilk-cpp'
      | 'cilk'
      | 'clojure'
      | 'cmake'
      | 'cobol'
      | 'coffeescript'
      | 'coffee'
      | 'concurnas'
      | 'conc'
      | 'csp'
      | 'cooklang'
      | 'ruby'
      | 'rb'
      | 'crystal'
      | 'csv'
      | 'cue'
      | 'cypher'
      | 'd'
      | 'dart'
      | 'dataweave'
      | 'dax'
      | 'dhall'
      | 'diff'
      | 'markup-templating'
      | 'django'
      | 'jinja2'
      | 'dns-zone-file'
      | 'dns-zone'
      | 'docker'
      | 'dockerfile'
      | 'dot'
      | 'gv'
      | 'ebnf'
      | 'editorconfig'
      | 'eiffel'
      | 'ejs'
      | 'eta'
      | 'elixir'
      | 'elm'
      | 'lua'
      | 'etlua'
      | 'erb'
      | 'erlang'
      | 'excel-formula'
      | 'xlsx'
      | 'xls'
      | 'fsharp'
      | 'factor'
      | 'false'
      | 'fift'
      | 'firestore-security-rules'
      | 'flow'
      | 'fortran'
      | 'ftl'
      | 'func'
      | 'gml'
      | 'gamemakerlanguage'
      | 'gap'
      | 'gcode'
      | 'gdscript'
      | 'gedcom'
      | 'gettext'
      | 'po'
      | 'git'
      | 'glsl'
      | 'gn'
      | 'gni'
      | 'linker-script'
      | 'ld'
      | 'go'
      | 'go-module'
      | 'go-mod'
      | 'gradle'
      | 'graphql'
      | 'groovy'
      | 'less'
      | 'scss'
      | 'textile'
      | 'haml'
      | 'handlebars'
      | 'hbs'
      | 'mustache'
      | 'haskell'
      | 'hs'
      | 'haxe'
      | 'hcl'
      | 'hlsl'
      | 'hoon'
      | 'hpkp'
      | 'hsts'
      | 'json'
      | 'webmanifest'
      | 'uri'
      | 'url'
      | 'http'
      | 'ichigojam'
      | 'icon'
      | 'icu-message-format'
      | 'idris'
      | 'idr'
      | 'ignore'
      | 'gitignore'
      | 'hgignore'
      | 'npmignore'
      | 'inform7'
      | 'ini'
      | 'io'
      | 'j'
      | 'java'
      | 'scala'
      | 'php'
      | 'javadoclike'
      | 'javadoc'
      | 'javastacktrace'
      | 'jolie'
      | 'jq'
      | 'typescript'
      | 'ts'
      | 'jsdoc'
      | 'n4js'
      | 'n4jsd'
      | 'json5'
      | 'jsonp'
      | 'jsstacktrace'
      | 'julia'
      | 'keepalived'
      | 'keyman'
      | 'kotlin'
      | 'kt'
      | 'kts'
      | 'kusto'
      | 'latex'
      | 'tex'
      | 'context'
      | 'latte'
      | 'scheme'
      | 'lilypond'
      | 'ly'
      | 'liquid'
      | 'lisp'
      | 'emacs'
      | 'elisp'
      | 'emacs-lisp'
      | 'livescript'
      | 'llvm'
      | 'log'
      | 'lolcode'
      | 'magma'
      | 'makefile'
      | 'mata'
      | 'matlab'
      | 'maxscript'
      | 'mel'
      | 'mermaid'
      | 'metafont'
      | 'mizar'
      | 'mongodb'
      | 'monkey'
      | 'moonscript'
      | 'moon'
      | 'n1ql'
      | 'nand2tetris-hdl'
      | 'naniscript'
      | 'nani'
      | 'nasm'
      | 'neon'
      | 'nevod'
      | 'nginx'
      | 'nim'
      | 'nix'
      | 'nsis'
      | 'objectivec'
      | 'objc'
      | 'ocaml'
      | 'odin'
      | 'opencl'
      | 'openqasm'
      | 'qasm'
      | 'oz'
      | 'parigp'
      | 'parser'
      | 'pascal'
      | 'objectpascal'
      | 'pascaligo'
      | 'psl'
      | 'pcaxis'
      | 'px'
      | 'peoplecode'
      | 'pcode'
      | 'perl'
      | 'phpdoc'
      | 'plant-uml'
      | 'plantuml'
      | 'plsql'
      | 'powerquery'
      | 'pq'
      | 'mscript'
      | 'powershell'
      | 'processing'
      | 'prolog'
      | 'promql'
      | 'properties'
      | 'protobuf'
      | 'stylus'
      | 'twig'
      | 'pug'
      | 'puppet'
      | 'purebasic'
      | 'pbfasm'
      | 'python'
      | 'py'
      | 'qsharp'
      | 'qs'
      | 'q'
      | 'qml'
      | 'qore'
      | 'r'
      | 'racket'
      | 'rkt'
      | 'cshtml'
      | 'razor'
      | 'jsx'
      | 'tsx'
      | 'reason'
      | 'rego'
      | 'renpy'
      | 'rpy'
      | 'rescript'
      | 'res'
      | 'rest'
      | 'rip'
      | 'roboconf'
      | 'robotframework'
      | 'robot'
      | 'rust'
      | 'sas'
      | 'sass'
      | 'shell-session'
      | 'sh-session'
      | 'shellsession'
      | 'smali'
      | 'smalltalk'
      | 'smarty'
      | 'sml'
      | 'smlnj'
      | 'solidity'
      | 'sol'
      | 'solution-file'
      | 'sln'
      | 'soy'
      | 'splunk-spl'
      | 'sqf'
      | 'squirrel'
      | 'stan'
      | 'stata'
      | 'iecst'
      | 'supercollider'
      | 'sclang'
      | 'swift'
      | 'systemd'
      | 'tact'
      | 't4-templating'
      | 't4-cs'
      | 't4'
      | 'vbnet'
      | 't4-vb'
      | 'tap'
      | 'tcl'
      | 'tt2'
      | 'toml'
      | 'ttcn'
      | 'ttcn3'
      | 'ttcn-3'
      | 'turtle'
      | 'trickle'
      | 'typescript-jsdoc'
      | 'typoscript'
      | 'tsconfig'
      | 'unrealscript'
      | 'uscript'
      | 'uc'
      | 'uri'
      | 'v'
      | 'vala'
      | 'vba'
      | 'vbscript'
      | 'velocity'
      | 'verilog'
      | 'vhdl'
      | 'vim'
      | 'visual-basic'
      | 'vb'
      | 'warpscript'
      | 'wasm'
      | 'web-idl'
      | 'webidl'
      | 'wgsl'
      | 'wiki'
      | 'wolfram'
      | 'mathematica'
      | 'nb'
      | 'wl'
      | 'xeora'
      | 'xeoracube'
      | 'xml-doc'
      | 'xojo'
      | 'xquery'
      | 'yaml'
      | 'yml'
      | 'yang'
      | 'zig'
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
