// GitHub activity as bento tiles that match the README's brand tiles
// (scripts/brand-assets/render.mjs): plain SVG, no fonts or components to embed.
//
// Desktop rows are 1200 viewBox units wide:
//   year      720 × 300  |  streak   480 × 300
//   languages 480 × 300  |  numbers  720 × 300
// Phone versions (*-m) are drawn for the width each tile gets on a ~360px
// screen (60% → 360 units, 40% → 240) and swapped in with
// <source media="(max-width: 600px)">.

const FONT = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
const MONO = "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace"
const GOLD = '#F0AD2F'
const COPPER = '#CD7631'
const TEAL = '#14CFB2'
const LAVENDER = '#B6AFF1'
const SKY = '#7FA6E8'

const THEMES = {
  light: { tile: '#F2F3F5', ink: '#0E0E10', muted: '#62666E', line: '#E1E3E7', bar: '#C9CCD2' },
  dark: { tile: '#171A1F', ink: '#F1EDE6', muted: '#9C968D', line: '#2A2E35', bar: '#3A3F47' },
}

const strings = {
  en: {
    year: 'PAST YEAR',
    contributions: 'contributions',
    allTime: (n, y) => `All time ${n} · since ${y}`,
    streak: 'CURRENT STREAK',
    streakShort: 'STREAK',
    days: (n) => (n === 1 ? 'day' : 'days'),
    longest: (n) => `Longest: ${n} ${n === 1 ? 'day' : 'days'}`,
    languages: (n) => `TOP LANGUAGES · ${n}`,
    languagesShort: 'LANGUAGES',
    other: 'Other',
    numbers: 'BY THE NUMBERS',
    numbersShort: 'NUMBERS',
    stats: ['Commits', 'Pull requests', 'Issues', 'Stars earned', 'Public repos', 'Followers'],
    numberLocale: 'en-US',
  },
  zh: {
    year: '近一年',
    contributions: '次貢獻',
    allTime: (n, y) => `累計 ${n} · ${y} 年加入`,
    streak: '目前連續貢獻',
    streakShort: '連續貢獻',
    days: () => '天',
    longest: (n) => `最長 ${n} 天`,
    languages: (n) => `常用語言 · ${n} 種`,
    languagesShort: '常用語言',
    other: '其他',
    numbers: '數字一覽',
    numbersShort: '數字一覽',
    stats: ['Commits', 'Pull Requests', 'Issues', '獲得星星', '公開專案', '追蹤者'],
    numberLocale: 'zh-TW',
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// Digits run narrower than letters; commas narrower still.
const numWidth = (s, size, ls = 0) => [...String(s)].reduce((w, ch) => w + (/[,.]/.test(ch) ? size * 0.28 : size * 0.6) + ls, 0)
const textWidth = (s, size) => [...String(s)].reduce((w, ch) => w + (/[　-鿿＀-￯]/.test(ch) ? size : size * 0.58), 0)

const text = (x, y, s, { size = 16, weight = 400, fill, font = FONT, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`
const label = (x, y, s, fill, size = 13) => text(x, y, s, { size, weight: 600, fill, font: MONO, ls: size / 8 })

function svg(W, H, aria, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<title>${esc(aria)}</title>
<defs><clipPath id="tile"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24"/></clipPath></defs>
${body}
</svg>
`
}

const tileBg = (W, H, fill) => `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${fill}"/>`

function months(days, numberLocale) {
  const byMonth = new Map()
  for (const d of days) byMonth.set(d.date.slice(0, 7), (byMonth.get(d.date.slice(0, 7)) ?? 0) + d.count)
  const fmt = new Intl.DateTimeFormat(numberLocale, { month: 'short', timeZone: 'UTC' })
  return [...byMonth].slice(-12).map(([key, value]) => ({ label: fmt.format(new Date(`${key}-01T00:00:00Z`)), value }))
}

function bars(data, x0, x1, top, bottom, t, { labels = true, labelSize = 11 } = {}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const step = (x1 - x0) / data.length
  const w = Math.max(4, step * 0.58)
  const peak = data.findIndex((d) => d.value === max)
  return data
    .map((d, i) => {
      const h = Math.max(3, ((bottom - top) * d.value) / max)
      const x = x0 + i * step + (step - w) / 2
      const bar = `<rect x="${x.toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4, w / 2)}" fill="${i === peak ? GOLD : t.bar}"/>`
      const lbl = labels ? text(x + w / 2, bottom + labelSize + 8, d.label, { size: labelSize, fill: t.muted, anchor: 'middle' }) : ''
      return bar + lbl
    })
    .join('')
}

function languageSegments(profile, s) {
  const { top, rest } = profile.languages
  const colors = [GOLD, TEAL, LAVENDER, COPPER, SKY]
  const list = top.map((l, i) => ({ ...l, color: colors[i] }))
  if (rest) list.push({ label: s.other, value: rest, color: '#8A8F98' })
  const total = list.reduce((sum, l) => sum + l.value, 0) || 1
  return list.map((l) => ({ ...l, pct: (l.value / total) * 100 }))
}

function stackedBar(segs, x, y, w, h) {
  let cx = x
  const parts = segs
    .map((sg) => {
      const sw = (w * sg.pct) / 100
      const r = `<rect x="${cx.toFixed(1)}" y="${y}" width="${Math.max(0, sw - 2).toFixed(1)}" height="${h}" fill="${sg.color}"/>`
      cx += sw
      return r
    })
    .join('')
  return `<clipPath id="lb"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/></clipPath><g clip-path="url(#lb)">${parts}</g>`
}

const pctText = (p) => `${p < 10 ? p.toFixed(1) : Math.round(p)}%`

export function renderBentoCards(profile, lang, theme) {
  const s = strings[lang]
  const t = THEMES[theme]
  const n = (v) => Number(v).toLocaleString(s.numberLocale)
  const year = new Date(profile.since).getUTCFullYear()
  const monthly = months(profile.yearDays, s.numberLocale)
  const { current, longest } = profile.streak
  const segs = languageSegments(profile, s)
  const stats = [profile.year.commits, profile.year.pullRequests, profile.year.issues, profile.stars, profile.repos, profile.followers]
  const yearAria = `${s.year}: ${n(profile.year.contributions)} ${s.contributions}. ${s.allTime(n(profile.allTime), year)}`
  const streakAria = `${s.streak}: ${n(current)} ${s.days(current)}. ${s.longest(n(longest))}`
  const langAria = `${s.languages(profile.languages.count)}: ${segs.map((l) => `${l.label} ${pctText(l.pct)}`).join(', ')}`
  const numAria = s.stats.map((l, i) => `${l} ${n(stats[i])}`).join(', ')

  // ---------- desktop ----------
  const yearBig = n(profile.year.contributions)
  const yearTile = svg(720, 300, yearAria, `
${tileBg(720, 300, t.tile)}
${label(40, 56, s.year, t.muted)}
${text(36, 140, yearBig, { size: 84, weight: 800, fill: t.ink, ls: -3 })}
${text(36 + numWidth(yearBig, 84, -3) + 14, 140, s.contributions, { size: 20, weight: 600, fill: t.muted })}
${text(40, 176, s.allTime(n(profile.allTime), year), { size: 14, fill: t.muted, font: MONO })}
${bars(monthly, 40, 680, 196, 254, t)}`)

  const streakTile = svg(480, 300, streakAria, `
<g clip-path="url(#tile)">${tileBg(480, 300, GOLD)}</g>
${label(40, 56, s.streak, '#5A3F08')}
${text(36, 156, n(current), { size: 96, weight: 800, fill: '#111', ls: -3 })}
${text(36 + numWidth(n(current), 96, -3) + 14, 156, s.days(current), { size: 24, weight: 700, fill: '#3A2A06' })}
<rect x="40" y="198" width="400" height="12" rx="6" fill="#111" opacity="0.15"/>
<rect x="40" y="198" width="${Math.max(12, (400 * current) / Math.max(1, longest)).toFixed(1)}" height="12" rx="6" fill="#111"/>
${text(40, 248, s.longest(n(longest)), { size: 18, weight: 600, fill: '#3A2A06' })}`)

  const legend = segs
    .map((sg, i) => {
      const x = 40 + (i % 2) * 210, y = 158 + Math.floor(i / 2) * 38
      return `<circle cx="${x + 6}" cy="${y - 5}" r="6" fill="${sg.color}"/>${text(x + 20, y, sg.label, { size: 16, weight: 600, fill: t.ink })}${text(x + 190, y, pctText(sg.pct), { size: 14, fill: t.muted, font: MONO, anchor: 'end' })}`
    })
    .join('')
  const langTile = svg(480, 300, langAria, `
${tileBg(480, 300, t.tile)}
${label(40, 56, s.languages(profile.languages.count), t.muted)}
${stackedBar(segs, 40, 88, 400, 22)}
${legend}`)

  const cells = s.stats
    .map((l, i) => {
      const x = 40 + (i % 3) * 220, y = 136 + Math.floor(i / 3) * 104
      return `${text(x, y, n(stats[i]), { size: 44, weight: 800, fill: i === 3 ? GOLD : t.ink, ls: -1.2 })}${text(x + 2, y + 30, l, { size: 15, fill: t.muted })}`
    })
    .join('')
  const numTile = svg(720, 300, numAria, `
${tileBg(720, 300, t.tile)}
${label(40, 56, s.numbers, t.muted)}
${cells}`)

  // ---------- phone ----------
  const yearM = svg(360, 300, yearAria, `
${tileBg(360, 300, t.tile)}
${label(30, 54, s.year, t.muted, 18)}
${text(26, 134, yearBig, { size: 72, weight: 800, fill: t.ink, ls: -2.5 })}
${text(30, 168, s.contributions, { size: 21, weight: 600, fill: t.muted })}
${bars(monthly, 30, 330, 196, 262, t, { labels: false })}`)

  const streakM = svg(240, 300, streakAria, `
<g clip-path="url(#tile)">${tileBg(240, 300, GOLD)}</g>
${label(28, 54, s.streakShort, '#5A3F08', 18)}
${text(24, 150, n(current), { size: 80, weight: 800, fill: '#111', ls: -2.5 })}
${text(28, 186, s.days(current), { size: 24, weight: 700, fill: '#3A2A06' })}
${text(28, 252, s.longest(n(longest)), { size: 19, weight: 600, fill: '#3A2A06' })}`)

  const langM = svg(240, 300, langAria, `
${tileBg(240, 300, t.tile)}
${label(28, 54, s.languagesShort, t.muted, 18)}
${stackedBar(segs, 28, 76, 184, 18)}
${segs
  .slice(0, 4)
  .map((sg, i) => `<circle cx="34" cy="${136 + i * 40 - 7}" r="7" fill="${sg.color}"/>${text(50, 136 + i * 40, sg.label, { size: 20, weight: 600, fill: t.ink })}`)
  .join('')}`)

  const numM = svg(360, 300, numAria, `
${tileBg(360, 300, t.tile)}
${label(30, 54, s.numbersShort, t.muted, 18)}
${s.stats
  .slice(0, 4)
  .map((l, i) => {
    const x = 30 + (i % 2) * 165, y = 128 + Math.floor(i / 2) * 104
    return `${text(x, y, n(stats[i]), { size: 42, weight: 800, fill: t.ink, ls: -1.2 })}${text(x + 2, y + 30, l, { size: 19, fill: t.muted })}`
  })
  .join('')}`)

  return {
    'activity-year': yearTile,
    'activity-streak': streakTile,
    'activity-languages': langTile,
    'activity-numbers': numTile,
    'activity-year-m': yearM,
    'activity-streak-m': streakM,
    'activity-languages-m': langM,
    'activity-numbers-m': numM,
  }
}
