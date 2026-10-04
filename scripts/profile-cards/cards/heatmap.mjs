// The contribution calendar as <MlHeatmap cell="paw">, plus a walking paw-print trail.
// Pure SVG (no foreignObject), so the component's own <svg> is reused directly.

import { h } from 'vue'
import { MlHeatmap } from '@malilion/ui'
import { componentCss, themeTokens, usedClasses } from '../lib/styles.mjs'
import { escapeXml, ssr } from '../lib/svg.mjs'

const PAW_SIZE = 11
const FOOT_GAP = 22
// Room for the last month label, which starts at the final column.
const PAD_RIGHT = 28

// Walking animation: a trail of paw prints steps across the active days in date order.
const CELL = 12
const STEP_S = 0.14 // seconds between steps
const PAUSE_S = 2.5 // rest before the walk starts over
const PRINT_S = 1.4 // how long each print stays visible

export async function renderHeatmap(days, locale) {
  // Pin the grid to GitHub's last calendar day so the runner's UTC clock can't shift it.
  const [y, m, d] = days.at(-1).date.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const html = await ssr(locale, () => h(MlHeatmap, { data: days, end, cell: 'paw', tone: 'gold', weeks: 53 }))
  const svg = html.match(/<svg[\s\S]*<\/svg>/)?.[0]
  if (!svg) throw new Error('MlHeatmap did not render an <svg>')
  const width = Number(svg.match(/width="(\d+)"/)[1])
  const height = Number(svg.match(/height="(\d+)"/)[1])
  const pawPath = svg.match(/<path d="([^"]+)"/)[1]
  const total = days.reduce((sum, c) => sum + c.count, 0)
  // Cells render in date order, so the active ones in sequence are the walk's route.
  const steps = [...svg.matchAll(/transform="translate\(([\d.]+) ([\d.]+)\)[^"]*" class="[^"]*ml-heatmap__cell--l([1-4])/g)].map(
    ([, x, y, level]) => ({ x: Number(x), y: Number(y), level: Number(level) }),
  )
  return { html, svg, width, height, pawPath, total, steps }
}

// Each print sits on its cell, toes pointing right (forward in time), alternating
// left / right like real footprints. The base heatmap stays fully drawn underneath,
// so a renderer that freezes on frame 0 (when every print is invisible) still shows it.
function walk(steps, pawPath) {
  if (!steps.length) return { css: '', prints: '' }
  const cycle = steps.length * STEP_S + PAUSE_S
  const pct = (s) => ((s / cycle) * 100).toFixed(2)
  const css = `.walk{opacity:0;transform-origin:0 0;animation:paw-walk ${cycle.toFixed(2)}s linear infinite}
@keyframes paw-walk{0%{opacity:0;transform:scale(.3)}${pct(0.08)}%{opacity:1;transform:scale(1.45)}${pct(0.22)}%{opacity:1;transform:scale(1.1)}${pct(PRINT_S)}%{opacity:0;transform:scale(1)}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.walk{animation:none}}`
  const prints = steps
    .map(({ x, y }, i) => {
      const side = i % 2 ? 1 : -1
      const cx = x + CELL / 2
      const cy = y + CELL / 2 + side * 1.5
      return `<g transform="translate(${cx} ${cy}) rotate(${90 + side * 14})"><g class="walk" style="animation-delay:${(i * STEP_S).toFixed(2)}s"><path d="${pawPath}" transform="scale(${CELL / 24}) translate(-12 -12)"/></g></g>`
    })
    .join('\n')
  return { css, prints }
}

export function composeHeatmap({ html, svg, width, height, pawPath, total, steps }, locale, theme) {
  const { css: walkCss, prints } = walk(steps, pawPath)
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fullWidth}" height="${footY + 6}" viewBox="0 0 ${fullWidth} ${footY + 6}" role="img" aria-label="${escapeXml(t.summary(total))}">
<style>
:root{${themeTokens(theme)}}
${componentCss(usedClasses(html))}
.foot{fill:var(--ml-text-dim);font-family:var(--ml-font-mono);font-size:11px}
/* Static image: skip the on-load fade-in, which some image renderers freeze on frame 0. */
.ml-heatmap__cell{animation:none}
/* Otherwise the nested svg clips the last month label. */
.ml-heatmap svg{overflow:visible}
.walk path{fill:var(${theme === 'light' ? '--ml-gold-500' : '--ml-gold-100'});filter:drop-shadow(0 0 2.5px var(--ml-gold-400))}
${walkCss}
</style>
<g class="ml-heatmap ml-heatmap--gold ml-heatmap--paw">
${svg}
<g aria-hidden="true">
${prints}
</g>
<text class="foot" x="0" y="${footY}">${escapeXml(t.summary(total))}</text>
<text class="foot" x="${lessX}" y="${footY}" text-anchor="end">${escapeXml(t.less)}</text>
${paws.join('\n')}
<text class="foot" x="${moreX}" y="${footY}" text-anchor="end">${escapeXml(t.more)}</text>
</g>
</svg>
`
}
