// GitHub activity as bento tiles that match the README's brand tiles
// (scripts/brand-assets/render.mjs): plain SVG, no fonts or components to embed.
//
// Desktop rows are 1200 viewBox units wide:
//   pulse      1200 × 320   (the year at a glance: total, streaks, best day, weekly chart)
//   languages   400 × 300  |  shipped 400 × 300  |  community 400 × 300
// Phone versions (*-m) are drawn for the width each tile gets on a ~360px
// screen (100% → 600 units, 33% → 200) and swapped in with
// <source media="(max-width: 600px)">.

const FONT = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
const MONO = "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace"
const GOLD = '#F0AD2F'
const COPPER = '#CD7631'
const TEAL = '#14CFB2'
const LAVENDER = '#B6AFF1'
const SKY = '#7FA6E8'

const THEMES = {
  light: { tile: '#F2F3F5', ink: '#0E0E10', muted: '#62666E', line: '#E1E3E7', hero: '#0E0E10', heroInk: '#FFFFFF', heroMuted: '#A6A8AD' },
  dark: { tile: '#171A1F', ink: '#F1EDE6', muted: '#9C968D', line: '#2A2E35', hero: '#1E1A15', heroInk: '#F6F1E9', heroMuted: '#A89D8F' },
}

const strings = {
  en: {
    year: 'PAST YEAR',
    contributions: 'contributions',
    allTime: (n, y) => `All time ${n} · since ${y}`,
    current: 'Current streak',
    longest: 'Longest streak',
    best: 'Best day',
    days: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
    weekly: 'Contributions per week',
    languages: 'LANGUAGES',
    other: 'Other',
    shipped: 'SHIPPED THIS YEAR',
    shippedShort: 'SHIPPED',
    commits: 'Commits',
    prs: 'Pull requests',
    issues: 'Issues',
    community: 'COMMUNITY',
    stars: 'Stars earned',
    repos: 'Public repos',
    followers: 'Followers',
    numberLocale: 'en-US',
    dateFmt: { month: 'short', day: 'numeric' },
  },
  zh: {
    year: '近一年',
    contributions: '次貢獻',
    allTime: (n, y) => `累計 ${n} · ${y} 年加入`,
    current: '目前連續',
    longest: '最長連續',
    best: '單日最多',
    days: (n) => `${n} 天`,
    weekly: '每週貢獻',
    languages: '常用語言',
    other: '其他',
    shipped: '今年產出',
    shippedShort: '今年產出',
    commits: 'Commits',
    prs: 'Pull Requests',
    issues: 'Issues',
    community: '社群',
    stars: '獲得星星',
    repos: '公開專案',
    followers: '追蹤者',
    numberLocale: 'zh-TW',
    dateFmt: { month: 'numeric', day: 'numeric' },
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const numWidth = (s, size, ls = 0) => [...String(s)].reduce((w, ch) => w + (/[,.]/.test(ch) ? size * 0.28 : size * 0.6) + ls, 0)

const text = (x, y, s, { size = 16, weight = 400, fill, font = FONT, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`
const label = (x, y, s, fill, size = 13) => text(x, y, s, { size, weight: 700, fill, font: MONO, ls: size / 7 })

function svg(W, H, aria, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<title>${esc(aria)}</title>
<defs><clipPath id="tile"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24"/></clipPath></defs>
${body}
</svg>
`
}
const tileBg = (W, H, fill) => `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${fill}"/>`

/** Sum the daily counts into weeks (Sunday-start, as GitHub's calendar). */
function weeks(days) {
  const out = []
  for (const d of days) {
    const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay()
    if (dow === 0 || out.length === 0) out.push(0)
    out[out.length - 1] += d.count
  }
  return out
}

/** Smooth area chart through the weekly totals, peak marked in gold. */
function areaChart(values, x0, x1, top, bottom, id) {
  const max = Math.max(1, ...values)
  const step = (x1 - x0) / Math.max(1, values.length - 1)
  const pts = values.map((v, i) => [x0 + i * step, bottom - ((bottom - top) * v) / max])
  const path = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    return `${d} C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
  }, '')
  const peak = values.indexOf(max)
  const [pxp, pyp] = pts[peak]
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.55"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></linearGradient></defs>
<path d="${path} L${x1} ${bottom} L${x0} ${bottom} Z" fill="url(#${id})"/>
<path d="${path}" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="${pxp.toFixed(1)}" cy="${pyp.toFixed(1)}" r="10" fill="${GOLD}" opacity="0.25"/><circle cx="${pxp.toFixed(1)}" cy="${pyp.toFixed(1)}" r="5" fill="${GOLD}"/>`
}

function languageSegments(profile, s) {
  const { top, rest } = profile.languages
  const colors = [GOLD, TEAL, LAVENDER, COPPER, SKY]
  const list = top.map((l, i) => ({ ...l, color: colors[i] }))
  if (rest) list.push({ label: s.other, value: rest, color: '#8A8F98' })
  const total = list.reduce((sum, l) => sum + l.value, 0) || 1
  return list.map((l) => ({ ...l, pct: (l.value / total) * 100 }))
}
const pctText = (p) => `${p < 10 ? p.toFixed(1) : Math.round(p)}%`

/** Donut made of stroked arcs; gaps between segments keep it readable. */
function donut(segs, cx, cy, r, w, t) {
  const C = 2 * Math.PI * r
  let offset = 0
  const arcs = segs
    .map((sg) => {
      const len = (C * sg.pct) / 100
      const a = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sg.color}" stroke-width="${w}" stroke-dasharray="${Math.max(0, len - 3).toFixed(2)} ${(C - Math.max(0, len - 3)).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`
      offset += len
      return a
    })
    .join('')
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.line}" stroke-width="${w}"/>${arcs}`
}

// Small line icons for the community tile.
const icons = {
  star: (c) => `<path d="M0 -11 L3.2 -3.4 L11 -3 L5 2.2 L6.9 10 L0 5.6 L-6.9 10 L-5 2.2 L-11 -3 L-3.2 -3.4 Z" fill="${c}"/>`,
  repo: (c) => `<rect x="-9" y="-10" width="18" height="20" rx="3" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M-9 4 H9 M-4 10 V14 L-1.5 12.5 L1 14 V10" stroke="${c}" stroke-width="2.5" fill="none"/>`,
  people: (c) => `<circle cx="-4" cy="-4" r="5" fill="${c}"/><path d="M-13 10 Q-13 2 -4 2 Q5 2 5 10 Z" fill="${c}"/><circle cx="7" cy="-6" r="4" fill="${c}" opacity="0.6"/><path d="M4 2 Q13 0 13 9 H7" fill="${c}" opacity="0.6"/>`,
}

export function renderBentoCards(profile, lang, theme) {
  const s = strings[lang]
  const t = THEMES[theme]
  const n = (v) => Number(v).toLocaleString(s.numberLocale)
  const since = new Date(profile.since).getUTCFullYear()
  const wk = weeks(profile.yearDays)
  const bestDay = profile.yearDays.reduce((b, d) => (d.count > b.count ? d : b), { count: 0, date: profile.yearDays[0]?.date ?? '1970-01-01' })
  const bestDate = new Intl.DateTimeFormat(s.numberLocale, { ...s.dateFmt, timeZone: 'UTC' }).format(new Date(`${bestDay.date}T00:00:00Z`))
  const { current, longest } = profile.streak
  const segs = languageSegments(profile, s)
  const total = n(profile.year.contributions)

  const pulseAria = `${s.year}: ${total} ${s.contributions}. ${s.current} ${s.days(current)}, ${s.longest} ${s.days(longest)}, ${s.best} ${n(bestDay.count)} (${bestDate}).`
  const langAria = `${s.languages}: ${segs.map((l) => `${l.label} ${pctText(l.pct)}`).join(', ')}`
  const shipAria = `${s.commits} ${n(profile.year.commits)}, ${s.prs} ${n(profile.year.pullRequests)}, ${s.issues} ${n(profile.year.issues)}`
  const commAria = `${s.stars} ${n(profile.stars)}, ${s.repos} ${n(profile.repos)}, ${s.followers} ${n(profile.followers)}`

  // ---------- desktop ----------
  const statBlock = (x, k, v, accent) => `${text(x, 82, k, { size: 14, fill: t.heroMuted })}${text(x, 122, v, { size: 32, weight: 800, fill: accent ? GOLD : t.heroInk, ls: -0.6 })}`
  const pulse = svg(1200, 320, pulseAria, `
${tileBg(1200, 320, t.hero)}
<g clip-path="url(#tile)">${areaChart(wk, 8, 1192, 190, 312, 'pa')}</g>
${label(48, 60, s.year, GOLD)}
${text(44, 142, total, { size: 88, weight: 800, fill: t.heroInk, ls: -3 })}
${text(44 + numWidth(total, 88, -3) + 16, 142, s.contributions, { size: 22, weight: 600, fill: t.heroMuted })}
${text(48, 176, s.allTime(n(profile.allTime), since), { size: 14, fill: t.heroMuted, font: MONO })}
<line x1="660" y1="58" x2="660" y2="136" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>
${statBlock(690, s.current, s.days(current), true)}
${statBlock(860, s.longest, s.days(longest))}
${statBlock(1030, s.best, n(bestDay.count))}
${text(1030, 146, bestDate, { size: 13, fill: t.heroMuted, font: MONO })}`)

  const legend = segs
    .slice(0, 5)
    .map((sg, i) => `<circle cx="226" cy="${92 + i * 34 - 5}" r="6" fill="${sg.color}"/>${text(240, 92 + i * 34, sg.label, { size: 15, weight: 600, fill: t.ink })}${text(366, 92 + i * 34, pctText(sg.pct), { size: 13, fill: t.muted, font: MONO, anchor: 'end' })}`)
    .join('')
  const languages = svg(400, 300, langAria, `
${tileBg(400, 300, t.tile)}
${label(36, 52, s.languages, t.muted)}
${donut(segs, 116, 170, 62, 22, t)}
${text(116, 178, String(profile.languages.count), { size: 30, weight: 800, fill: t.ink, anchor: 'middle' })}
${legend}`)

  const shipRows = [[s.commits, profile.year.commits, GOLD], [s.prs, profile.year.pullRequests, TEAL], [s.issues, profile.year.issues, LAVENDER]]
  const shipMax = Math.max(1, ...shipRows.map((r) => r[1]))
  const shipped = svg(400, 300, shipAria, `
${tileBg(400, 300, t.tile)}
${label(36, 52, s.shipped, t.muted)}
${shipRows
  .map(([k, v, c], i) => {
    const y = 108 + i * 64
    const w = Math.max(10, (328 * Math.log10(v + 1)) / Math.log10(shipMax + 1))
    return `${text(36, y, n(v), { size: 30, weight: 800, fill: t.ink, ls: -0.8 })}${text(364, y, k, { size: 14, fill: t.muted, anchor: 'end' })}<rect x="36" y="${y + 12}" width="328" height="8" rx="4" fill="${t.line}"/><rect x="36" y="${y + 12}" width="${w.toFixed(1)}" height="8" rx="4" fill="${c}"/>`
  })
  .join('')}`)

  const commRows = [['star', s.stars, profile.stars, GOLD], ['repo', s.repos, profile.repos, TEAL], ['people', s.followers, profile.followers, LAVENDER]]
  const community = svg(400, 300, commAria, `
${tileBg(400, 300, t.tile)}
${label(36, 52, s.community, t.muted)}
${commRows
  .map(([ic, k, v, c], i) => {
    const y = 104 + i * 64
    return `<circle cx="58" cy="${y - 10}" r="22" fill="${c}" opacity="0.18"/><g transform="translate(58 ${y - 10})">${icons[ic](c)}</g>${text(98, y, n(v), { size: 30, weight: 800, fill: t.ink, ls: -0.8 })}${text(364, y - 2, k, { size: 14, fill: t.muted, anchor: 'end' })}`
  })
  .join('')}`)

  // ---------- phone ----------
  const pulseM = svg(600, 440, pulseAria, `
${tileBg(600, 440, t.hero)}
<g clip-path="url(#tile)">${areaChart(wk, 8, 592, 320, 432, 'pm')}</g>
${label(40, 60, s.year, GOLD, 18)}
${text(36, 140, total, { size: 84, weight: 800, fill: t.heroInk, ls: -3 })}
${text(40, 180, s.contributions, { size: 24, weight: 600, fill: t.heroMuted })}
${[[s.current, s.days(current), true], [s.longest, s.days(longest)], [s.best, n(bestDay.count)]]
  .map(([k, v, a], i) => `${text(40 + i * 186, 232, k, { size: 19, fill: t.heroMuted })}${text(40 + i * 186, 270, v, { size: 30, weight: 800, fill: a ? GOLD : t.heroInk })}`)
  .join('')}`)

  const languagesM = svg(200, 240, langAria, `
${tileBg(200, 240, t.tile)}
${label(22, 44, s.languages, t.muted, 16)}
${donut(segs, 100, 130, 52, 20, t)}
${text(100, 140, String(profile.languages.count), { size: 30, weight: 800, fill: t.ink, anchor: 'middle' })}
${text(100, 216, segs[0]?.label ?? '', { size: 19, weight: 700, fill: t.ink, anchor: 'middle' })}`)

  const shippedM = svg(200, 240, shipAria, `
${tileBg(200, 240, t.tile)}
${label(22, 44, s.shippedShort, t.muted, 16)}
${text(22, 106, n(profile.year.commits), { size: 40, weight: 800, fill: t.ink, ls: -1 })}
${text(22, 134, s.commits, { size: 19, fill: t.muted })}
${text(22, 186, n(profile.year.pullRequests), { size: 30, weight: 800, fill: TEAL })}
${text(22, 212, 'PRs', { size: 19, fill: t.muted })}`)

  const communityM = svg(200, 240, commAria, `
${tileBg(200, 240, t.tile)}
${label(22, 44, s.community, t.muted, 16)}
${commRows
  .map(([ic, , v, c], i) => `<g transform="translate(40 ${92 + i * 52})">${icons[ic](c)}</g>${text(68, 102 + i * 52, n(v), { size: 30, weight: 800, fill: t.ink })}`)
  .join('')}`)

  return {
    'activity-pulse': pulse,
    'activity-languages': languages,
    'activity-shipped': shipped,
    'activity-community': community,
    'activity-pulse-m': pulseM,
    'activity-languages-m': languagesM,
    'activity-shipped-m': shippedM,
    'activity-community-m': communityM,
  }
}
