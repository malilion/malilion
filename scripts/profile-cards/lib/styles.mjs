// Pulls theme tokens, component rules and the display font out of the published
// @malilion/ui package, so the cards look exactly like the library.

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const css = readFileSync(require.resolve('@malilion/ui/style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** Splits minified CSS into top-level blocks: `{ prelude, body }`, where body may hold nested blocks. */
function blocks(text) {
  const out = []
  let depth = 0
  let start = 0
  let open = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth++ === 0) open = i
    } else if (text[i] === '}' && --depth === 0) {
      out.push({ prelude: text.slice(start, open).trim(), body: text.slice(open + 1, i) })
      start = i + 1
    }
  }
  return out
}

const all = blocks(css)

const tokensOf = (prelude) =>
  all
    .filter((b) => b.prelude === prelude)
    .flatMap((b) => b.body.split(';'))
    .filter((decl) => decl.startsWith('--ml-'))
    .join(';')

const globalTokens = tokensOf(':root')
const darkTokens = tokensOf(':root,[data-ml-theme=dark]')
const lightTokens = tokensOf('[data-ml-theme=light]')
if (!globalTokens || !darkTokens || !lightTokens) throw new Error('Could not find Malilion UI theme tokens')

/** Custom properties for a theme; light overrides the dark defaults. */
export const themeTokens = (theme) => [globalTokens, darkTokens, theme === 'light' ? lightTokens : ''].filter(Boolean).join(';')

/** Every rule whose `.ml-*` classes are all in `used`, keeping @media / @container wrappers. */
export function componentCss(used) {
  const keepSelector = (selector) => {
    const classes = selector.match(/\.ml-[\w-]+/g)
    return classes !== null && classes.every((c) => used.has(c.slice(1)))
  }
  const walk = (list) =>
    list
      .flatMap(({ prelude, body }) => {
        if (prelude.startsWith('@media') || prelude.startsWith('@container')) {
          const inner = walk(blocks(body))
          return inner ? [`${prelude}{${inner}}`] : []
        }
        if (prelude.startsWith('@')) return [] // keyframes, font-face, property, starting-style
        const selectors = prelude.split(',').filter(keepSelector)
        return selectors.length ? [`${selectors.join(',')}{${body}}`] : []
      })
      .join('\n')
  return walk(all)
}

/** Class names used in rendered markup. */
export const usedClasses = (html) => new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)))

// Images can't fetch web fonts, so the display face (numbers, titles) is inlined. ~13 KB.
const displayFont = readFileSync(require.resolve('@malilion/ui/fonts/chakra-petch-latin-600-normal.woff2')).toString('base64')
export const fontFace = `@font-face{font-family:"Malilion Display";font-weight:500 700;src:url(data:font/woff2;base64,${displayFont}) format("woff2")}`
