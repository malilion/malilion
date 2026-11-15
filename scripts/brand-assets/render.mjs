// Generates the MaliLion bento README tiles in assets/brand/bento/.
// Every tile comes in light + dark (swapped with <picture> in the README) and
// in English + 繁體中文. No dependencies:
//   node scripts/brand-assets/render.mjs
//
// Layout: every row is 1200 viewBox units wide, so all tiles share one scale
// when the README sets their widths as percentages of the row.
//   hero          1200 × 380
//   ticker        1200 × 60   (animated slogan band)
//   malilion-ui    720 × 420  |  project-island 480 × 420
//   contextlion    400 × 320  |  ninefold-court 400 × 320  |  cow-pasture 400 × 320
//   now-building   720 × 260  |  threads        480 × 260
// Each SVG keeps an 8-unit transparent margin, which becomes the gutter
// between tiles that sit side by side.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const brand = join(root, 'assets', 'brand')
const out = join(brand, 'bento')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const FONT = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
const MONO = "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace"
const GOLD = '#F0AD2F'
const COPPER = '#CD7631'
const TEAL = '#14CFB2'

// Neutral tiles follow the theme; the feature tiles (Malilion UI, Island,
// Threads) keep their own colors in both themes.
const THEMES = {
  light: { tile: '#F2F3F5', ink: '#0E0E10', muted: '#62666E', line: '#E1E3E7', hero: '#0E0E10', heroInk: '#FFFFFF', heroMuted: '#A6A8AD', chip: '#26262B', ticker: '#B6AFF1', tickerInk: '#15131F' },
  dark: { tile: '#171A1F', ink: '#F1EDE6', muted: '#9C968D', line: '#2A2E35', hero: '#1E1A15', heroInk: '#F6F1E9', heroMuted: '#A89D8F', chip: '#2E2821', ticker: '#2A2650', tickerInk: '#CFCAFF' },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const logo = `data:image/png;base64,${readFileSync(join(brand, 'logo-160.png')).toString('base64')}`

const paw = (x, y, s, fill, opacity = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${opacity}">
    <ellipse cx="0" cy="8" rx="9" ry="7.5"/><ellipse cx="-10" cy="-4" rx="3.6" ry="4.6"/><ellipse cx="-3.6" cy="-10" rx="3.6" ry="4.8"/><ellipse cx="3.6" cy="-10" rx="3.6" ry="4.8"/><ellipse cx="10" cy="-4" rx="3.6" ry="4.6"/></g>`

const text = (x, y, s, { size = 16, weight = 400, fill, font = FONT, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`

const label = (x, y, s, fill) => text(x, y, esc(s), { size: 13, weight: 600, fill, font: MONO, ls: 1.6 })

// Pills sized from a rough per-character width; CJK glyphs count double.
const textWidth = (s, size) => [...s].reduce((w, ch) => w + (/[　-鿿＀-￯]/.test(ch) ? size : size * 0.58), 0)
function pills(x, y, items) {
  let cx = x
  return items
    .map(({ t, bg, fg }) => {
      const w = Math.round(textWidth(t, 14) + 32)
      const g = `<rect x="${cx}" y="${y}" width="${w}" height="34" rx="17" fill="${bg}"/>${text(cx + w / 2, y + 22, esc(t), { size: 14, weight: 600, fill: fg, anchor: 'middle' })}`
      cx += w + 10
      return g
    })
    .join('')
}

function svg(W, H, aria, body, { style = '', defs = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<title>${esc(aria)}</title>
<defs><clipPath id="tile"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24"/></clipPath>${defs}</defs>
${style ? `<style>${style}</style>` : ''}
${body}
</svg>
`
}

// ---------- Copy ----------
const COPY = {
  en: {
    heroLabel: 'MALILION · TAIWAN · AI × CODE × GAME',
    heroA: 'I turn small ideas',
    heroB: 'into ',
    heroC: 'real projects.',
    heroSub: 'Software engineer by day. Component libraries, dev tools and 3D worlds by night.',
    heroPills: ['malilion.com ↗', 'Threads @malilion.dev', '161 Vue & React components'],
    heroAria: 'MaliLion: I turn small ideas into real projects',
    ticker: ['BUILD IN PUBLIC', 'CREATIVE CODING', 'OPEN SOURCE', 'AI × CODE × GAME', 'LOCAL-FIRST TOOLS', '3D WORLDS'],
    uiLabel: 'FLAGSHIP · NPM @malilion/ui',
    uiHead: '161 components later.',
    uiSub: ['Lion × tech × metal UI for Vue 3 and React.', 'TypeScript · 2 themes · 0 runtime deps'],
    uiUnit: 'components',
    islandLabel: 'WEB 3D · THREE.JS',
    islandName: 'Project Island',
    islandSub: ['I built an island shaped like a lion.', 'Every side project is a tile.'],
    row3: {
      contextlion: { label: 'BROWSER EXTENSION', head: ['The web,', 'but AI-ready.'], name: 'ContextLion', meta: 'Pages → Markdown · Local-first' },
      'ninefold-court': { label: 'VISUAL NOVEL · SERIES', head: ['A visual novel,', 'built in public.'], name: '九重燼', meta: 'Vue 3 · PixiJS · Ink.js' },
      'cow-pasture': { label: '3D DASHBOARD', head: ['Cows graze on', 'my green stocks.'], name: 'Cow Pasture', meta: 'The whole Taiwan market in 3D' },
    },
    nowLabel: 'NOW BUILDING',
    now: ['AI learning experiences', 'Small, focused dev tools', 'Narrative games & web 3D', 'The MaliLion ecosystem'],
    nowNote: 'Build → Learn → Share → Build again.',
    ctaLabel: 'SAY HI',
    ctaHead: ['Follow the', 'build notes.'],
    ctaSub: '@malilion.dev on Threads →',
  },
  zh: {
    heroLabel: '碼力獅 MALILION · 台灣 · AI × 程式 × 遊戲',
    heroA: '把小點子，',
    heroB: '做成',
    heroC: '真的作品。',
    heroSub: '白天是軟體工程師，晚上做元件庫、開發工具和 3D 世界。',
    heroPills: ['malilion.com ↗', 'Threads @malilion.dev', '161 個 Vue / React 元件'],
    heroAria: '碼力獅 MaliLion：把小點子做成真的作品',
    ticker: ['公開開發', '創意程式', '開源', 'AI × 程式 × 遊戲', 'LOCAL-FIRST 工具', '3D 世界'],
    uiLabel: '主力作品 · NPM @malilion/ui',
    uiHead: '做了 161 個元件之後',
    uiSub: ['獅子 × 科技 × 金屬風，Vue 3 與 React 通用。', 'TypeScript · 雙主題 · 零執行期相依'],
    uiUnit: '個元件',
    islandLabel: 'WEB 3D · THREE.JS',
    islandName: '碼力獅專案島',
    islandSub: ['我蓋了一座獅子形狀的島，', '每個 side project 都是一塊地。'],
    row3: {
      contextlion: { label: '瀏覽器擴充功能', head: ['讓整個網路', '變得 AI-ready'], name: 'ContextLion', meta: '網頁 → Markdown · Local-first' },
      'ninefold-court': { label: '視覺小說 · 鐵人賽', head: ['一款公開開發的', '視覺小說'], name: '九重燼', meta: 'Vue 3 · PixiJS · Ink.js' },
      'cow-pasture': { label: '3D 儀表板', head: ['我的股票綠到', '可以放牛了'], name: 'Cow Pasture', meta: '全台股 3D 牧場（紅漲綠跌）' },
    },
    nowLabel: '最近在做',
    now: ['AI 互動學習體驗', '小而專注的開發工具', '敘事遊戲與 Web 3D', '碼力獅品牌生態系'],
    nowNote: 'Build → Learn → Share → Build again.',
    ctaLabel: '來打聲招呼',
    ctaHead: ['追蹤我的', '開發筆記'],
    ctaSub: 'Threads @malilion.dev →',
  },
}

// ---------- Tiles ----------
function hero(c, t) {
  const W = 1200, H = 380
  const trail = [0, 1, 2, 3, 4]
    .map((i) => `<g class="p" style="animation-delay:${i * 0.4}s">${paw(700 + i * 46, 150 - (i % 2) * 22 - i * 16, 0.9, GOLD)}</g>`)
    .join('')
  const body = `
<rect x="8" y="8" width="${W - 280}" height="${H - 16}" rx="24" fill="${t.hero}"/>
<rect x="${W - 256}" y="8" width="248" height="${H - 16}" rx="24" fill="${GOLD}"/>
${trail}
${label(56, 74, c.heroLabel, GOLD)}
${text(52, 152, esc(c.heroA), { size: 60, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(52, 222, `${esc(c.heroB)}<tspan fill="${GOLD}">${esc(c.heroC)}</tspan>`, { size: 60, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(54, 266, esc(c.heroSub), { size: 19, fill: t.heroMuted })}
${pills(54, 296, [
  { t: c.heroPills[0], bg: GOLD, fg: '#111' },
  { t: c.heroPills[1], bg: t.chip, fg: t.heroInk },
  { t: c.heroPills[2], bg: t.chip, fg: t.heroInk },
])}
<circle cx="${W - 132}" cy="176" r="94" fill="#111" opacity="0.12"/>
<clipPath id="lc"><circle cx="${W - 132}" cy="170" r="88"/></clipPath>
<image href="${logo}" x="${W - 220}" y="82" width="176" height="176" clip-path="url(#lc)"/>
${text(W - 132, 320, 'EST. 2023', { size: 13, weight: 700, fill: '#3A2A06', font: MONO, anchor: 'middle', ls: 2 })}`
  return svg(W, H, c.heroAria, body, {
    style: `.p{opacity:0;animation:step 4s ease-in-out infinite}@keyframes step{0%,5%{opacity:0}15%,60%{opacity:.5}80%,100%{opacity:0}}@media (prefers-reduced-motion:reduce){.p{animation:none;opacity:.35}}`,
  })
}

function malilionUi(c) {
  const W = 720, H = 420
  const comps = [
    ['Button', 0, 0], ['Switch', 1, 0],
    ['Input', 0, 1], ['Badge', 1, 1],
    ['Tabs', 0, 2], ['Modal', 1, 2],
  ]
    .map(([n, col, row]) => {
      const x = 430 + col * 128, y = 66 + row * 74
      return `<rect x="${x}" y="${y}" width="116" height="60" rx="14" fill="${GOLD}" fill-opacity="0.12" stroke="${GOLD}" stroke-opacity="0.45"/>${text(x + 16, y + 36, n, { size: 15, weight: 600, fill: '#F3DDB6' })}`
    })
    .join('')
  const body = `
<defs><linearGradient id="ui" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1611"/><stop offset="1" stop-color="#3D2A14"/></linearGradient></defs>
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="url(#ui)"/>
  ${paw(650, 370, 2.4, GOLD, 0.1)}
</g>
${label(44, 64, c.uiLabel, '#D9B27A')}
${text(42, 114, 'Malilion UI', { size: 42, weight: 800, fill: '#FFFFFF', ls: -1 })}
${text(44, 150, esc(c.uiHead), { size: 20, weight: 600, fill: GOLD })}
${text(44, 184, esc(c.uiSub[0]), { size: 15, fill: '#CDBDA9' })}
${text(44, 208, esc(c.uiSub[1]), { size: 15, fill: '#CDBDA9' })}
${text(38, 352, '161', { size: 136, weight: 800, fill: GOLD, ls: -6 })}
${text(258, 352, esc(c.uiUnit), { size: 18, weight: 600, fill: '#CDBDA9' })}
${comps}`
  return svg(W, H, `Malilion UI — ${c.uiHead}`, body)
}

function island(c) {
  const W = 480, H = 420
  const cells = [[0, 0], [-1, 1], [1, 1], [0, 2], [-2, 0], [2, 0], [-1, -1], [1, -1], [0, -2], [-2, 2], [2, 2], [-3, 1], [3, 1]]
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
    .map(([q, r], i) => {
      const x = q * 22, y = r * 13 + (i % 3) * -2
      const top = ['#FFE3A3', GOLD, '#7FE3D3'][i % 3]
      return `<g transform="translate(${x} ${y})"><path d="M0 -12 L22 0 L0 12 L-22 0 Z" fill="${top}"/><path d="M-22 0 L0 12 V22 L-22 10 Z" fill="#06404E" opacity="0.55"/><path d="M22 0 L0 12 V22 L22 10 Z" fill="#06404E" opacity="0.3"/></g>`
    })
    .join('')
  const body = `
<defs><radialGradient id="sea" cx="0.5" cy="0.38" r="0.75"><stop offset="0" stop-color="#3FE0C6"/><stop offset="0.55" stop-color="#0E9C9A"/><stop offset="1" stop-color="#0A5A72"/></radialGradient></defs>
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="url(#sea)"/>
  <ellipse cx="240" cy="200" rx="150" ry="34" fill="#FFFFFF" opacity="0.12"/>
  <g transform="translate(240 150) scale(1.7)">${cells}${paw(0, -46, 1, '#FFFFFF')}</g>
</g>
${label(40, 64, c.islandLabel, '#D6FBF4')}
${text(38, 316, esc(c.islandName), { size: 34, weight: 800, fill: '#FFFFFF', ls: -0.8 })}
${text(40, 350, esc(c.islandSub[0]), { size: 15, fill: '#E3FCF7' })}
${text(40, 374, esc(c.islandSub[1]), { size: 15, fill: '#E3FCF7' })}`
  return svg(W, H, `${c.islandName} — ${c.islandSub.join(' ')}`, body)
}

const smallArt = {
  contextlion: (t) => `<g transform="translate(330 84)" fill="none" stroke-width="3">
    <rect x="-30" y="-38" width="60" height="78" rx="8" stroke="${t.ink}" opacity="0.85"/>
    <text x="-19" y="-12" font-family="${MONO}" font-size="17" font-weight="700" fill="${TEAL}" stroke="none">#</text>
    <path d="M-4 -17 H20 M-19 2 H20 M-19 16 H10 M-19 30 H16" stroke="${GOLD}" stroke-linecap="round"/></g>`,
  'ninefold-court': () => `<g transform="translate(330 86) scale(0.8)">
    <path d="M0 -58 C24 -24 40 -6 30 22 C22 46 -22 46 -30 22 C-40 -6 -18 -18 -10 -40 C-4 -24 4 -20 0 -58 Z" fill="${COPPER}"/>
    <path d="M0 -14 C14 4 18 14 12 28 C6 40 -8 40 -12 28 C-16 16 -6 6 0 -14 Z" fill="${GOLD}"/>
    <circle cx="-38" cy="-40" r="3" fill="${GOLD}"/><circle cx="40" cy="-30" r="2.5" fill="${GOLD}"/></g>`,
  'cow-pasture': (t) => `<g transform="translate(330 84) scale(0.72)">
    <path d="M-48 -34 l20 26 -14 4 z M14 -34 l-20 26 14 4 z" fill="${COPPER}"/>
    <rect x="-40" y="-20" width="48" height="58" rx="22" fill="${t === THEMES.dark ? '#F1EDE6' : '#FFFFFF'}" stroke="${t.ink}" stroke-opacity="0.2"/>
    <ellipse cx="-16" cy="26" rx="20" ry="13" fill="${COPPER}"/>
    <circle cx="-22" cy="26" r="2.5" fill="#1A1410"/><circle cx="-10" cy="26" r="2.5" fill="#1A1410"/>
    <circle cx="-26" cy="0" r="3.5" fill="#1A1410"/><circle cx="-6" cy="0" r="3.5" fill="#1A1410"/>
    <path d="M30 -40 L48 -20 L60 -30 L76 -6" fill="none" stroke="#2BA84A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`,
}

function rowTile(slug, p, t) {
  const W = 400, H = 320
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${t.tile}"/></g>
${label(36, 58, p.label, t.muted)}
${smallArt[slug](t)}
${text(34, 178, esc(p.head[0]), { size: 29, weight: 800, fill: t.ink, ls: -0.6 })}
${text(34, 214, esc(p.head[1]), { size: 29, weight: 800, fill: t.ink, ls: -0.6 })}
<rect x="36" y="238" width="328" height="1" fill="${t.line}"/>
${text(36, 270, esc(p.name), { size: 16, weight: 700, fill: t.ink })}
${text(36, 292, esc(p.meta), { size: 13.5, fill: t.muted })}`
  return svg(W, H, `${p.name} — ${p.head.join(' ')}`, body)
}

function nowBuilding(c, t) {
  const W = 720, H = 260
  const items = c.now
    .map((s, i) => {
      const x = 44 + (i % 2) * 320, y = 118 + Math.floor(i / 2) * 46
      return `<circle cx="${x + 6}" cy="${y - 6}" r="6" fill="${TEAL}"/>${text(x + 24, y, esc(s), { size: 18, weight: 600, fill: t.ink })}`
    })
    .join('')
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${t.tile}"/></g>
<circle cx="49" cy="55" r="5" fill="${TEAL}"><animate attributeName="opacity" values="1;.25;1" dur="2s" repeatCount="indefinite"/></circle>
${label(64, 60, c.nowLabel, t.muted)}
${items}
${text(44, 226, esc(c.nowNote), { size: 14, fill: t.muted, font: MONO })}`
  return svg(W, H, `${c.nowLabel}: ${c.now.join(', ')}`, body)
}

function threads(c) {
  const W = 480, H = 260
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${GOLD}"/>
  ${paw(400, 196, 3.2, '#111', 0.1)}
</g>
${label(40, 60, c.ctaLabel, '#5A3F08')}
${text(38, 120, esc(c.ctaHead[0]), { size: 36, weight: 800, fill: '#111', ls: -0.8 })}
${text(38, 162, esc(c.ctaHead[1]), { size: 36, weight: 800, fill: '#111', ls: -0.8 })}
<rect x="40" y="188" width="${Math.round(textWidth(c.ctaSub, 16) + 36)}" height="40" rx="20" fill="#111"/>
${text(58, 214, esc(c.ctaSub), { size: 16, weight: 700, fill: '#FFFFFF' })}`
  return svg(W, H, `${c.ctaHead.join(' ')} ${c.ctaSub}`, body)
}

// Slogan ticker between the hero and the tiles. One copy of the slogans is
// forced to a fixed length with textLength, so two copies side by side loop
// seamlessly when the group slides left by exactly that length.
function ticker(c, t) {
  const W = 1200, H = 60
  const line = c.ticker.map((s) => `${s}  ✳  `).join('')
  const L = Math.round(textWidth(line, 15) + 40)
  const copy = (x) => `<text x="${x}" y="36" font-family="${MONO}" font-size="15" font-weight="600" letter-spacing="1.5" fill="${t.tickerInk}" textLength="${L}" lengthAdjust="spacing" xml:space="preserve">${esc(line)}</text>`
  const body = `
<defs><clipPath id="band"><rect x="8" y="6" width="${W - 16}" height="${H - 12}" rx="24"/></clipPath></defs>
<rect x="8" y="6" width="${W - 16}" height="${H - 12}" rx="24" fill="${t.ticker}"/>
<g clip-path="url(#band)"><g class="run">${copy(24)}${copy(24 + L)}${copy(24 + 2 * L)}</g></g>`
  return svg(W, H, c.ticker.join(' · '), body, {
    style: `.run{animation:run ${Math.round(L / 40)}s linear infinite}@keyframes run{to{transform:translateX(-${L}px)}}@media (prefers-reduced-motion:reduce){.run{animation:none}}`,
  })
}

// ---------- Write ----------
let n = 0
for (const [lang, c] of Object.entries(COPY)) {
  for (const [theme, t] of Object.entries(THEMES)) {
    const files = {
      hero: hero(c, t),
      ticker: ticker(c, t),
      'malilion-ui': malilionUi(c),
      'project-island': island(c),
      'now-building': nowBuilding(c, t),
      threads: threads(c),
    }
    for (const [slug, p] of Object.entries(c.row3)) files[slug] = rowTile(slug, p, t)
    for (const [name, data] of Object.entries(files)) {
      writeFileSync(join(out, `${name}-${lang}-${theme}.svg`), data)
      n++
    }
  }
}
console.log(`${n} bento tiles written to`, out)
