// Renders the profile README's GitHub cards with Malilion UI and writes standalone SVGs
// (dark / light × en / zh-TW): stats, streak, languages, monthly bars and the paw heatmap.
//
// Usage: GITHUB_TOKEN=... GITHUB_USER=malilion node render.mjs [outDir]

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { en, zhTW } from '@malilion/ui'
import { fetchProfile } from './lib/github.mjs'
import { composeHeatmap, renderHeatmap } from './cards/heatmap.mjs'
import { renderStatCards } from './cards/stats.mjs'

const token = process.env.GITHUB_TOKEN
const user = process.env.GITHUB_USER
const outDir = process.argv[2] ?? 'dist'
if (!token || !user) throw new Error('GITHUB_TOKEN and GITHUB_USER are required')

const profile = await fetchProfile(token, user)
mkdirSync(outDir, { recursive: true })

const write = (name, svg) => {
  writeFileSync(join(outDir, name), svg)
  console.log(`wrote ${name}`)
}

for (const [lang, suffix, locale] of [['en', '', en], ['zh', '-zh', zhTW]]) {
  const heatmap = await renderHeatmap(profile.yearDays, locale)
  for (const theme of ['dark', 'light']) {
    write(`paw-heatmap-${theme}${suffix}.svg`, composeHeatmap(heatmap, locale, theme))
    const cards = await renderStatCards(profile, locale, lang, theme)
    for (const [name, svg] of Object.entries(cards)) write(`${name}-${theme}${suffix}.svg`, svg)
  }
}
