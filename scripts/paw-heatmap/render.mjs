// Renders the GitHub contribution calendar with Malilion UI's <MlHeatmap cell="paw">
// and writes self-contained SVGs (dark / light × en / zh-TW) for the profile README.
//
// Usage: GITHUB_TOKEN=... GITHUB_USER=malilion node render.mjs [outDir]

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { MlConfigProvider, MlHeatmap, en, zhTW } from '@malilion/ui'

const token = process.env.GITHUB_TOKEN
const user = process.env.GITHUB_USER
const outDir = process.argv[2] ?? 'dist'
if (!token || !user) throw new Error('GITHUB_TOKEN and GITHUB_USER are required')

// ---- Contribution data ----------------------------------------------------

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { login: user } }),
})
const json = await res.json()
if (!res.ok || json.errors) throw new Error(`GitHub API error: ${JSON.stringify(json.errors ?? json)}`)

const days = json.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays)
const data = days.map((d) => ({ date: d.date, count: d.contributionCount }))
// Pin the grid to GitHub's last calendar day so the runner's UTC clock can't shift it.
const [y, m, d] = days.at(-1).date.split('-').map(Number)
const end = new Date(y, m - 1, d)

// ---- Styles from the published package ------------------------------------

const require = createRequire(import.meta.url)
const css = readFileSync(require.resolve('@malilion/ui/style.css'), 'utf8')

const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }))
const tokens = (selector) =>
  rules
    .filter((r) => r.selector === selector)
    .flatMap((r) => r.body.split(';'))
    .filter((decl) => decl.startsWith('--ml-'))
    .join(';')

const globalTokens = tokens(':root')
const themeTokens = { dark: tokens(':root,[data-ml-theme=dark]'), light: tokens('[data-ml-theme=light]') }
const heatmapCss = rules
  .filter((r) => r.selector.startsWith('.ml-heatmap'))
  .map((r) => `${r.selector}{${r.body}}`)
  .join('\n')

if (!themeTokens.dark || !themeTokens.light || !heatmapCss) throw new Error('Could not find Malilion UI theme or heatmap styles')

// ---- Render ---------------------------------------------------------------

const PAW_SIZE = 11
const FOOT_GAP = 22
// Room for the last month label, which starts at the final column.
const PAD_RIGHT = 28

async function renderHeatmap(locale) {
  const app = createSSRApp({
    render: () => h(MlConfigProvider, { locale }, () => h(MlHeatmap, { data, end, cell: 'paw', tone: 'gold', weeks: 53 })),
  })
  const html = await renderToString(app)
  const svg = html.match(/<svg[\s\S]*<\/svg>/)?.[0]
  if (!svg) throw new Error('MlHeatmap did not render an <svg>')
  const width = Number(svg.match(/width="(\d+)"/)[1])
  const height = Number(svg.match(/height="(\d+)"/)[1])
  const pawPath = svg.match(/<path d="([^"]+)"/)[1]
  const total = data.reduce((sum, c) => sum + c.count, 0)
  return { svg, width, height, pawPath, total }
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function compose({ svg, width, height, pawPath, total }, locale, theme) {
  const footY = height + FOOT_GAP
  const t = locale.heatmap

  // Legend, laid out right to left: "More", five paws, "Less".
  const moreX = width
  const pawsRight = moreX - t.more.length * 7 - 6
  const paws = [4, 3, 2, 1, 0].map((level, i) => {
    const x = pawsRight - (i + 1) * (PAW_SIZE + 3)
    return `<path d="${pawPath}" transform="translate(${x} ${footY - PAW_SIZE + 1}) scale(${PAW_SIZE / 24})" class="ml-heatmap__cell ml-heatmap__cell--l${level}"/>`
  })
  const lessX = pawsRight - 5 * (PAW_SIZE + 3) - 6

  const fullWidth = width + PAD_RIGHT
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fullWidth}" height="${footY + 6}" viewBox="0 0 ${fullWidth} ${footY + 6}" role="img" aria-label="${escape(t.summary(total))}">
<style>
:root{${globalTokens};${themeTokens.dark}${theme === 'light' ? `;${themeTokens.light}` : ''}}
${heatmapCss}
.foot{fill:var(--ml-text-dim);font-family:var(--ml-font-mono);font-size:11px}
/* Static image: skip the on-load fade-in, which some image renderers freeze on frame 0. */
.ml-heatmap__cell{animation:none}
/* Otherwise the nested svg clips the last month label. */
.ml-heatmap svg{overflow:visible}
</style>
<g class="ml-heatmap ml-heatmap--gold ml-heatmap--paw">
${svg}
<text class="foot" x="0" y="${footY}">${escape(t.summary(total))}</text>
<text class="foot" x="${lessX}" y="${footY}" text-anchor="end">${escape(t.less)}</text>
${paws.join('\n')}
<text class="foot" x="${moreX}" y="${footY}" text-anchor="end">${escape(t.more)}</text>
</g>
</svg>
`
}

mkdirSync(outDir, { recursive: true })
for (const [suffix, locale] of [['', en], ['-zh', zhTW]]) {
  const rendered = await renderHeatmap(locale)
  for (const theme of ['dark', 'light']) {
    const file = join(outDir, `paw-heatmap-${theme}${suffix}.svg`)
    writeFileSync(file, compose(rendered, locale, theme))
    console.log(`wrote ${file} (${rendered.total} contributions)`)
  }
}
