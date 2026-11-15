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
//   stack-*        400 × 64   (label beside a skillicons.dev strip)
//   cat-*          400 × 280  (heads each column of the project index)
//   experience    1200 × 400  |  certifications 1200 × 330
//   *-m           phone versions, swapped in under 600px (see MOBILE below)
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

// Island outline: a squashed blob, so the top reads as seen from above at an angle.
function blob(cx, cy, rx, ry, k = 1) {
  const pts = []
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2
    const r = 1 + 0.07 * Math.sin(3 * a + 0.6) + 0.045 * Math.cos(5 * a) + 0.03 * Math.sin(7 * a + 1.3)
    pts.push(`${(cx + Math.cos(a) * rx * r * k).toFixed(1)} ${(cy + Math.sin(a) * ry * r * k).toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}

// Island illustration in its 480 × 420 frame; the phone tile scales it down.
const ISLAND = (() => {
  const cx = 240, cy = 168, rx = 150, ry = 58
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="12" ry="4" fill="#2C6E3F" opacity="0.35"/>
    <rect x="-2.5" y="-14" width="5" height="16" rx="2" fill="#7A4A2A"/>
    <circle cx="0" cy="-22" r="13" fill="#2F8F5B"/><circle cx="-7" cy="-17" r="9" fill="#3FA86A"/><circle cx="6" cy="-27" r="7" fill="#58BE7B"/></g>`
  const pine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="9" ry="3" fill="#2C6E3F" opacity="0.35"/>
    <rect x="-2" y="-8" width="4" height="10" fill="#7A4A2A"/>
    <path d="M0 -40 L13 -14 H-13 Z" fill="#256F4A"/><path d="M0 -30 L15 -6 H-15 Z" fill="#2F8F5B"/></g>`
  // Project plots: small tilled tiles on the grass, one per kind of project.
  const plot = (x, y, fill) => `<path d="M${x} ${y - 9} L${x + 18} ${y} L${x} ${y + 9} L${x - 18} ${y} Z" fill="${fill}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.5"/>`
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#FFFFFF"><ellipse cx="0" cy="0" rx="26" ry="10"/><circle cx="-8" cy="-6" r="10"/><circle cx="8" cy="-9" r="13"/></g>`
  const wave = (x, y) => `<path d="M${x} ${y} q6 -5 12 0 t12 0" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`
  return {
    defs: `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FE7F0"/><stop offset="0.42" stop-color="#4FD1C5"/><stop offset="1" stop-color="#0B6A80"/></linearGradient>
  <linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07442"/><stop offset="1" stop-color="#6B3F22"/></linearGradient>
  <clipPath id="mc"><circle cx="${cx + 52}" cy="${cy - 8}" r="17"/></clipPath>
</defs>`,
    art: `
  ${cloud(392, 58, 1)}${cloud(330, 92, 0.6)}${cloud(120, 104, 0.7)}
  <ellipse cx="${cx}" cy="${cy + 52}" rx="${rx + 34}" ry="${ry - 8}" fill="#FFFFFF" opacity="0.18"/>
  ${wave(64, 250)}${wave(400, 236)}${wave(96, 286)}${wave(372, 278)}
  <path d="${blob(cx, cy + 40, rx * 0.96, ry)}" fill="url(#cliff)"/>
  <path d="${blob(cx, cy + 20, rx * 0.99, ry)}" fill="#A86E3E"/>
  <path d="${blob(cx, cy + 4, rx, ry, 1.03)}" fill="#F6D99A"/>
  <path d="${blob(cx, cy, rx, ry, 0.95)}" fill="#6CC36A"/>
  <path d="${blob(cx - 18, cy - 6, rx * 0.62, ry * 0.6)}" fill="#86D27A"/>
  ${plot(cx - 62, cy + 6, GOLD)}${plot(cx - 26, cy + 22, '#7FE3D3')}${plot(cx - 26, cy - 10, COPPER)}${plot(cx + 10, cy + 6, '#B6AFF1')}
  ${pine(cx - 112, cy + 4, 0.9)}${tree(cx - 92, cy - 18, 0.85)}${pine(cx + 118, cy + 10, 0.8)}${tree(cx + 96, cy + 30, 0.95)}${tree(cx + 112, cy - 16, 0.7)}${tree(cx - 70, cy + 34, 0.7)}
  <rect x="${cx + 51}" y="${cy - 62}" width="2.5" height="40" fill="#5A3A22"/>
  <path d="M${cx + 53.5} ${cy - 62} h22 l-6 7 l6 7 h-22 Z" fill="${GOLD}"/>
  <circle cx="${cx + 52}" cy="${cy - 8}" r="20" fill="#FFFFFF"/>
  <image href="${logo}" x="${cx + 33}" y="${cy - 27}" width="38" height="38" clip-path="url(#mc)"/>
`,
  }
})()

function island(c) {
  const W = 480, H = 420
  const body = `
${ISLAND.defs}
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${ISLAND.art}
</g>
${label(40, 64, c.islandLabel, '#0B4A58')}
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
function ticker(c, t, { W = 1200, H = 60, fs = 15 } = {}) {
  const line = c.ticker.map((s) => `${s}  ✳  `).join('')
  const L = Math.round(textWidth(line, fs) + fs * 2.6)
  const copy = (x) => `<text x="${x}" y="${Math.round(H / 2 + fs * 0.4)}" font-family="${MONO}" font-size="${fs}" font-weight="600" letter-spacing="1.5" fill="${t.tickerInk}" textLength="${L}" lengthAdjust="spacing" xml:space="preserve">${esc(line)}</text>`
  const body = `
<defs><clipPath id="band"><rect x="8" y="6" width="${W - 16}" height="${H - 12}" rx="24"/></clipPath></defs>
<rect x="8" y="6" width="${W - 16}" height="${H - 12}" rx="24" fill="${t.ticker}"/>
<g clip-path="url(#band)"><g class="run">${copy(24)}${copy(24 + L)}${copy(24 + 2 * L)}</g></g>`
  return svg(W, H, c.ticker.join(' · '), body, {
    style: `.run{animation:run ${Math.round(L / (fs * 2.7))}s linear infinite}@keyframes run{to{transform:translateX(-${L}px)}}@media (prefers-reduced-motion:reduce){.run{animation:none}}`,
  })
}

// Category cards that head each column of the "Everything else" index.
const CATS = {
  en: [
    { slug: 'ai-tools', label: 'AI & DEV TOOLS', head: 'Tools that stay local.', sub: 'DevTools · Codex skills' },
    { slug: 'worlds', label: 'INTERACTIVE WORLDS', head: 'Worlds to walk into.', sub: 'Three.js · Blender · NPR' },
    { slug: 'creative', label: 'DESIGN & CREATIVE CODE', head: 'Code that draws.', sub: 'React UI · lyric MV · FX' },
  ],
  zh: [
    { slug: 'ai-tools', label: 'AI 與開發工具', head: '留在本機的工具', sub: 'DevTools · Codex skills' },
    { slug: 'worlds', label: '互動世界', head: '走得進去的世界', sub: 'Three.js · Blender · NPR' },
    { slug: 'creative', label: '設計與創意程式', head: '會畫畫的程式', sub: 'React UI · 歌詞 MV · FX' },
  ],
}

const catArt = {
  // Terminal window with a sparkle: local dev tools and AI skills.
  'ai-tools': `<rect width="400" height="150" fill="#B6AFF1"/>
    <g transform="translate(200 78)">
      <rect x="-96" y="-52" width="192" height="108" rx="12" fill="#15131F"/>
      <circle cx="-80" cy="-38" r="4" fill="#FF6B6B"/><circle cx="-66" cy="-38" r="4" fill="${GOLD}"/><circle cx="-52" cy="-38" r="4" fill="${TEAL}"/>
      <text x="-80" y="-6" font-family="${MONO}" font-size="15" font-weight="700" fill="${TEAL}">❯</text>
      <rect x="-60" y="-16" width="86" height="10" rx="5" fill="#CFCAFF"/>
      <rect x="-80" y="6" width="120" height="8" rx="4" fill="#5A5490"/>
      <rect x="-80" y="22" width="92" height="8" rx="4" fill="#5A5490"/>
      <rect x="-80" y="38" width="12" height="8" rx="2" fill="${GOLD}"/>
      <path d="M86 -66 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z" fill="${GOLD}"/>
      <path d="M-112 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#FFFFFF"/>
    </g>`,
  // Night sky, moon and layered hills: the 3D worlds.
  worlds: `<defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A5C"/><stop offset="1" stop-color="#3C6FA8"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#night)"/>
    <circle cx="300" cy="50" r="24" fill="#FFE3A3"/><circle cx="312" cy="42" r="21" fill="#26396F"/>
    <circle cx="80" cy="34" r="2" fill="#FFFFFF"/><circle cx="140" cy="58" r="1.6" fill="#FFFFFF"/><circle cx="220" cy="26" r="2" fill="#FFFFFF"/><circle cx="360" cy="96" r="1.6" fill="#FFFFFF"/>
    <path d="M0 150 L0 110 L70 64 L120 96 L190 42 L260 104 L310 80 L400 120 L400 150 Z" fill="#2A4E7E"/>
    <path d="M190 42 L176 60 L190 56 L204 62 Z" fill="#FFFFFF"/>
    <path d="M0 150 L0 126 Q100 96 200 122 T400 116 L400 150 Z" fill="${TEAL}" opacity="0.85"/>
    <path d="M330 150 v-26 M330 120 l-10 14 h20 Z" stroke="#0E5A50" stroke-width="3" fill="#0E5A50"/>`,
  // Pixel blocks, a waveform and a brush stroke: UI kits, music videos, FX.
  creative: `<rect width="400" height="150" fill="${GOLD}"/>
    <g transform="translate(70 40)">
      <rect x="0" y="0" width="22" height="22" fill="#15131F"/><rect x="24" y="0" width="22" height="22" fill="${COPPER}"/>
      <rect x="0" y="24" width="22" height="22" fill="#FFFFFF"/><rect x="24" y="24" width="22" height="22" fill="#15131F"/>
      <rect x="48" y="24" width="22" height="22" fill="${TEAL}"/><rect x="24" y="48" width="22" height="22" fill="#FFFFFF"/>
    </g>
    <g fill="#15131F">${[14, 30, 52, 38, 64, 44, 26, 56, 34, 18, 42, 24].map((h, i) => `<rect x="${178 + i * 11}" y="${78 - h / 2}" width="6" height="${h}" rx="3"/>`).join('')}</g>
    <path d="M60 124 C140 96 220 140 340 108" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <circle cx="344" cy="106" r="9" fill="${COPPER}"/>`,
}

function categoryCard(p, t) {
  const W = 400, H = 280
  const body = `
<defs><clipPath id="card"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24"/></clipPath></defs>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <g transform="translate(0 8)">${catArt[p.slug]}</g>
</g>
${label(32, 192, p.label, t.muted)}
${text(30, 228, esc(p.head), { size: 25, weight: 800, fill: t.ink, ls: -0.5 })}
${text(32, 254, esc(p.sub), { size: 13, fill: t.muted, font: MONO })}`
  return svg(W, H, `${p.label}: ${p.head}`, body)
}

// ---------- Experience timeline + certifications ----------
const EXP = {
  en: {
    label: 'EXPERIENCE · 2023 → NOW',
    now: 'NOW',
    role: 'Software Engineer',
    stops: [
      { years: '2023', org: 'Startup company', tech: ['Laravel · MySQL · REST APIs', 'Docker · enterprise systems'] },
      { years: '2024 — 2026', org: 'Industrial computer company', tech: ['ASP.NET Core · Vue.js', 'MSSQL / Oracle · internal platforms'] },
      { years: '2026 — now', org: 'Technology company', tech: ['Vue.js · .NET Core APIs', 'Architecture · team practices'] },
    ],
    quote: ['I turn real operational problems into maintainable systems,', 'then carry what I learn into side projects and open source.'],
    certLabel: 'CERTIFICATIONS',
    aria: 'Experience: 2023 startup, 2024–2026 industrial computer company, 2026–now technology company',
  },
  zh: {
    label: '工作經歷 · 2023 → 現在',
    now: '現在',
    role: '軟體工程師',
    stops: [
      { years: '2023', org: '新創公司', tech: ['Laravel · MySQL · REST API', 'Docker · 企業內部系統'] },
      { years: '2024～2026', org: '工業電腦公司', tech: ['ASP.NET Core · Vue.js', 'MSSQL / Oracle · 內部平台'] },
      { years: '2026～現在', org: '科技業', tech: ['Vue.js · .NET Core API', '系統架構 · 團隊開發規範'] },
    ],
    quote: ['把真實營運問題轉成可維護的系統，', '再把學到的東西帶進 Side Project 與開源作品。'],
    certLabel: '證照',
    aria: '工作經歷：2023 新創公司、2024～2026 工業電腦公司、2026～現在 科技業',
  },
}

function experience(e, t) {
  const W = 1200, H = 400
  const xs = [56, 436, 816]
  const stops = e.stops
    .map((s, i) => {
      const x = xs[i], cur = i === e.stops.length - 1
      const node = cur
        ? `<circle cx="${x + 10}" cy="112" r="16" fill="${GOLD}" opacity="0.25"><animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="${x + 10}" cy="112" r="10" fill="${GOLD}"/>`
        : `<circle cx="${x + 10}" cy="112" r="9" fill="${t.tile}" stroke="${t.ink}" stroke-width="3"/>`
      const nowPill = cur ? `<rect x="${x + 34}" y="100" width="${Math.round(textWidth(e.now, 12) + 22)}" height="24" rx="12" fill="${GOLD}"/>${text(x + 45, 117, esc(e.now), { size: 12, weight: 700, fill: '#111', font: MONO, ls: 1 })}` : ''
      return `${node}${nowPill}
${text(x, 176, esc(s.years), { size: 30, weight: 800, fill: cur ? GOLD : t.ink, ls: -0.6 })}
${text(x, 208, esc(e.role), { size: 18, weight: 700, fill: t.ink })}
${text(x, 232, esc(s.org), { size: 16, fill: t.muted })}
${text(x, 268, esc(s.tech[0]), { size: 13, fill: t.muted, font: MONO })}
${text(x, 290, esc(s.tech[1]), { size: 13, fill: t.muted, font: MONO })}`
    })
    .join('')
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.tile}"/>
${label(56, 62, e.label, t.muted)}
<line x1="66" y1="112" x2="${xs[2] + 10}" y2="112" stroke="${t.line}" stroke-width="4" stroke-linecap="round"/>
<line x1="${xs[1] + 10}" y1="112" x2="${xs[2] + 10}" y2="112" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
${stops}
<rect x="56" y="318" width="4" height="48" rx="2" fill="${GOLD}"/>
${text(76, 337, esc(e.quote[0]), { size: 17, fill: t.ink })}
${text(76, 361, esc(e.quote[1]), { size: 17, fill: t.ink })}`
  return svg(W, H, e.aria, body, { style: '@media (prefers-reduced-motion:reduce){animate{display:none}}' })
}

const CERTS = [
  { file: 'aws-cloud-practitioner', group: 0, name: ['AWS Certified', 'Cloud Practitioner'] },
  { file: 'aws-ai-practitioner', group: 0, name: ['AWS Certified', 'AI Practitioner'] },
  { file: 'mta-database', group: 1, name: ['MTA', 'Database'] },
  { file: 'mta-networking', group: 1, name: ['MTA', 'Networking'] },
  { file: 'mta-software-development', group: 1, name: ['MTA Software', 'Development'] },
]
const certImg = Object.fromEntries(
  CERTS.map((c) => [c.file, `data:image/webp;base64,${readFileSync(join(root, 'assets', 'certifications', `${c.file}.webp`)).toString('base64')}`]),
)

function certifications(e, t) {
  const W = 1200, H = 330
  const xs = [150, 360, 660, 870, 1080]
  const badges = CERTS.map((c, i) => {
    const x = xs[i]
    return `<circle cx="${x}" cy="168" r="66" fill="${t.heroInk}" opacity="0.06"/>
<image href="${certImg[c.file]}" x="${x - 58}" y="110" width="116" height="116"/>
${text(x, 260, esc(c.name[0]), { size: 14, weight: 600, fill: t.heroMuted, anchor: 'middle' })}
${text(x, 281, esc(c.name[1]), { size: 15, weight: 700, fill: t.heroInk, anchor: 'middle' })}`
  }).join('')
  const group = (x1, x2, s) => `<line x1="${x1}" y1="90" x2="${x2}" y2="90" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>
${text((x1 + x2) / 2, 84, s, { size: 13, weight: 700, fill: GOLD, font: MONO, anchor: 'middle', ls: 2 })}`
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.hero}"/>
${label(56, 56, e.certLabel, t.heroMuted)}
${group(84, 426, 'AWS')}
${group(594, 1146, 'MICROSOFT MTA')}
${badges}`
  return svg(W, H, `${e.certLabel}: AWS Cloud Practitioner, AWS AI Practitioner, MTA Database, MTA Networking, MTA Software Development`, body)
}


// ---------- Phone tiles ----------
// Swapped in by <source media="(max-width: 600px)"> while each <img> keeps its
// desktop width, so every phone tile is drawn for the width it gets on a
// ~360px screen: 100% → 600 units, 60% → 360, 40% → 240, 33% → 200. At those
// scales 20 units is about 12px, the smallest text used here.
const MOBILE = {
  en: {
    heroA: 'I turn small', heroB: 'ideas into', heroC: 'real projects.',
    heroSub: ['Software engineer by day.', 'UI kits, dev tools & 3D worlds by night.'],
    uiHead: '161 components later.',
    island: ['Project', 'Island'],
    kinds: { contextlion: 'Extension', 'ninefold-court': 'Visual novel', 'cow-pasture': '3D dashboard' },
    cta: ['Follow', 'the build', 'notes.'],
    quote: ['I turn real operational problems into', 'maintainable systems, then carry what I', 'learn into side projects and open source.'],
  },
  zh: {
    heroA: '把小點子，', heroB: '做成', heroC: '真的作品。',
    heroSub: ['白天是軟體工程師，', '晚上做元件庫、開發工具和 3D 世界。'],
    uiHead: '做了 161 個元件之後',
    island: ['碼力獅', '專案島'],
    kinds: { contextlion: '擴充功能', 'ninefold-court': '視覺小說', 'cow-pasture': '3D 儀表板' },
    cta: ['追蹤我的', '開發筆記'],
    quote: ['把真實營運問題轉成可維護的系統，', '再把學到的東西帶進', 'Side Project 與開源作品。'],
  },
}

function pillRow(x, y, items, fs) {
  let cx = x
  const h = Math.round(fs * 2.3)
  return items
    .map(({ t, bg, fg }) => {
      const w = Math.round(textWidth(t, fs) + fs * 2)
      const g = `<rect x="${cx}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/>${text(cx + w / 2, y + h / 2 + fs * 0.36, esc(t), { size: fs, weight: 600, fill: fg, anchor: 'middle' })}`
      cx += w + 12
      return g
    })
    .join('')
}

function heroM(c, m, t) {
  const W = 600, H = 600
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28" fill="${t.hero}"/>
<circle cx="490" cy="118" r="76" fill="${GOLD}"/>
<clipPath id="lc"><circle cx="490" cy="118" r="66"/></clipPath>
<image href="${logo}" x="424" y="52" width="132" height="132" clip-path="url(#lc)"/>
${text(44, 70, 'MALILION', { size: 20, weight: 700, fill: GOLD, font: MONO, ls: 3 })}
${text(44, 100, 'AI × CODE × GAME', { size: 18, weight: 600, fill: t.heroMuted, font: MONO, ls: 2 })}
${text(40, 262, esc(m.heroA), { size: 56, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(40, 326, esc(m.heroB), { size: 56, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(40, 390, esc(m.heroC), { size: 56, weight: 800, fill: GOLD, ls: -1.5 })}
${text(42, 440, esc(m.heroSub[0]), { size: 23, fill: t.heroMuted })}
${text(42, 472, esc(m.heroSub[1]), { size: 23, fill: t.heroMuted })}
${pillRow(42, 506, [{ t: 'malilion.com ↗', bg: GOLD, fg: '#111' }, { t: 'Threads @malilion.dev', bg: t.chip, fg: t.heroInk }], 20)}`
  return svg(W, H, c.heroAria, body)
}

function uiM(c, m) {
  const W = 360, H = 420
  const body = `
<defs><linearGradient id="ui" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1611"/><stop offset="1" stop-color="#3D2A14"/></linearGradient></defs>
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="url(#ui)"/>${paw(300, 360, 2.6, GOLD, 0.1)}</g>
${text(32, 62, 'NPM @malilion/ui', { size: 18, weight: 600, fill: '#D9B27A', font: MONO })}
${text(30, 116, 'Malilion UI', { size: 40, weight: 800, fill: '#FFFFFF', ls: -1 })}
${text(32, 152, esc(m.uiHead), { size: 22, weight: 600, fill: GOLD })}
${text(24, 318, '161', { size: 150, weight: 800, fill: GOLD, ls: -7 })}
${text(32, 370, esc(c.uiUnit), { size: 24, weight: 600, fill: '#CDBDA9' })}`
  return svg(W, H, `Malilion UI — ${c.uiHead}`, body)
}

function islandM(c, m) {
  const W = 240, H = 420, k = 0.62
  const body = `
${ISLAND.defs}
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g transform="translate(${120 - 240 * k} ${168 - 168 * k}) scale(${k})">${ISLAND.art}</g>
</g>
${text(28, 56, 'WEB 3D', { size: 18, weight: 700, fill: '#0B4A58', font: MONO, ls: 2 })}
${text(26, 330, esc(m.island[0]), { size: 34, weight: 800, fill: '#FFFFFF', ls: -0.8 })}
${text(26, 372, esc(m.island[1]), { size: 34, weight: 800, fill: '#FFFFFF', ls: -0.8 })}`
  return svg(W, H, `${c.islandName} — ${c.islandSub.join(' ')}`, body)
}

function rowM(slug, p, m, t) {
  const W = 200, H = 240
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${t.tile}"/></g>
<g transform="translate(-230 6)">${smallArt[slug](t)}</g>
${text(24, 176, esc(p.name), { size: 25, weight: 800, fill: t.ink, ls: -0.5 })}
${text(24, 208, esc(m.kinds[slug]), { size: 20, fill: t.muted })}`
  return svg(W, H, `${p.name} — ${p.head.join(' ')}`, body)
}

function nowM(c, t) {
  const W = 360, H = 340
  const items = c.now
    .map((s, i) => `<circle cx="38" cy="${118 + i * 52 - 7}" r="7" fill="${TEAL}"/>${text(56, 118 + i * 52, esc(s), { size: 21, weight: 600, fill: t.ink })}`)
    .join('')
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${t.tile}"/></g>
${text(30, 60, esc(c.nowLabel), { size: 18, weight: 700, fill: t.muted, font: MONO, ls: 2 })}
${items}`
  return svg(W, H, `${c.nowLabel}: ${c.now.join(', ')}`, body)
}

function threadsM(c, m) {
  const W = 240, H = 340
  const lines = m.cta.map((s, i) => text(26, 112 + i * 44, esc(s), { size: 36, weight: 800, fill: '#111', ls: -0.8 })).join('')
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${GOLD}"/>${paw(190, 230, 3, '#111', 0.1)}</g>
${text(28, 60, 'THREADS', { size: 18, weight: 700, fill: '#5A3F08', font: MONO, ls: 2 })}
${lines}
<rect x="24" y="262" width="192" height="46" rx="23" fill="#111"/>
${text(120, 292, '@malilion.dev', { size: 20, weight: 700, fill: '#FFFFFF', anchor: 'middle' })}`
  return svg(W, H, `${c.ctaHead.join(' ')} ${c.ctaSub}`, body)
}

function experienceM(e, m, t) {
  const W = 600, H = 910
  const stops = e.stops
    .map((s, i) => {
      const y = 132 + i * 214, cur = i === e.stops.length - 1
      const node = cur
        ? `<circle cx="56" cy="${y}" r="18" fill="${GOLD}" opacity="0.25"/><circle cx="56" cy="${y}" r="12" fill="${GOLD}"/>`
        : `<circle cx="56" cy="${y}" r="11" fill="${t.tile}" stroke="${t.ink}" stroke-width="4"/>`
      const yw = Math.round(textWidth(s.years, 36) + 104)
      const pill = cur ? `<rect x="${yw}" y="${y - 18}" width="${Math.round(textWidth(e.now, 18) + 30)}" height="34" rx="17" fill="${GOLD}"/>${text(yw + 15, y + 5, esc(e.now), { size: 18, weight: 700, fill: '#111', font: MONO })}` : ''
      return `${node}${pill}
${text(92, y + 12, esc(s.years), { size: 36, weight: 800, fill: cur ? GOLD : t.ink, ls: -0.8 })}
${text(92, y + 52, esc(e.role), { size: 23, weight: 700, fill: t.ink })}
${text(92, y + 82, esc(s.org), { size: 21, fill: t.muted })}
${text(92, y + 118, esc(s.tech[0]), { size: 19, fill: t.muted, font: MONO })}
${text(92, y + 146, esc(s.tech[1]), { size: 19, fill: t.muted, font: MONO })}`
    })
    .join('')
  const q = m.quote.map((s, i) => text(66, 806 + i * 34, esc(s), { size: 23, fill: t.ink })).join('')
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28" fill="${t.tile}"/>
${text(40, 70, esc(e.label), { size: 18, weight: 700, fill: t.muted, font: MONO, ls: 2 })}
<line x1="56" y1="132" x2="56" y2="560" stroke="${t.line}" stroke-width="5" stroke-linecap="round"/>
<line x1="56" y1="346" x2="56" y2="560" stroke="${GOLD}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
${stops}
<rect x="40" y="782" width="5" height="${m.quote.length * 34 + 4}" rx="2.5" fill="${GOLD}"/>
${q}`
  return svg(W, H, e.aria, body)
}

function certificationsM(e, t) {
  const W = 600, H = 660
  const badge = (c, x, y) => `<circle cx="${x}" cy="${y + 64}" r="72" fill="${t.heroInk}" opacity="0.06"/>
<image href="${certImg[c.file]}" x="${x - 62}" y="${y + 2}" width="124" height="124"/>
${text(x, y + 166, esc(c.name[0]), { size: 20, weight: 600, fill: t.heroMuted, anchor: 'middle' })}
${text(x, y + 194, esc(c.name[1]), { size: 21, weight: 700, fill: t.heroInk, anchor: 'middle' })}`
  const group = (y, s) => `${text(300, y, s, { size: 18, weight: 700, fill: GOLD, font: MONO, anchor: 'middle', ls: 3 })}<line x1="60" y1="${y + 12}" x2="540" y2="${y + 12}" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>`
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="28" fill="${t.hero}"/>
${text(40, 62, esc(e.certLabel), { size: 18, weight: 700, fill: t.heroMuted, font: MONO, ls: 2 })}
${group(110, 'AWS')}
${badge(CERTS[0], 180, 138)}${badge(CERTS[1], 420, 138)}
${group(386, 'MICROSOFT MTA')}
${badge(CERTS[2], 110, 414)}${badge(CERTS[3], 300, 414)}${badge(CERTS[4], 490, 414)}`
  return svg(W, H, `${e.certLabel}: AWS Cloud Practitioner, AWS AI Practitioner, MTA Database, MTA Networking, MTA Software Development`, body)
}

// Stack row labels. Each sits inline beside a skillicons.dev strip of the
// same rendered height (the README sets height="56" on both).
const STACK = {
  en: [
    { slug: 'core', name: 'Languages & core', sub: '.NET · C# · PHP · TypeScript' },
    { slug: 'frontend', name: 'Frameworks & frontend', sub: 'Vue · React · Next.js · Laravel' },
    { slug: 'cloud', name: 'Cloud & data', sub: 'AWS · Docker · Cloudflare · Postgres' },
    { slug: 'tools', name: 'Tools & interactive', sub: 'Three.js · Godot · Git · pnpm' },
  ],
  zh: [
    { slug: 'core', name: '語言與核心', sub: '.NET · C# · PHP · TypeScript' },
    { slug: 'frontend', name: '框架與前端', sub: 'Vue · React · Next.js · Laravel' },
    { slug: 'cloud', name: '雲端與資料', sub: 'AWS · Docker · Cloudflare · Postgres' },
    { slug: 'tools', name: '工具與互動開發', sub: 'Three.js · Godot · Git · pnpm' },
  ],
}
const STACK_DOT = { core: GOLD, frontend: TEAL, cloud: '#B6AFF1', tools: COPPER }

function stackLabel(s, t) {
  const W = 400, H = 64
  const body = `
<rect x="2" y="4" width="${W - 16}" height="${H - 8}" rx="18" fill="${t.tile}"/>
<circle cx="28" cy="${H / 2}" r="7" fill="${STACK_DOT[s.slug]}"/>
${text(48, 29, esc(s.name), { size: 18, weight: 800, fill: t.ink })}
${text(48, 49, esc(s.sub), { size: 12.5, fill: t.muted, font: MONO })}`
  return svg(W, H, `${s.name}: ${s.sub}`, body)
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
    for (const st of STACK[lang]) files[`stack-${st.slug}`] = stackLabel(st, t)
    for (const cat of CATS[lang]) files[`cat-${cat.slug}`] = categoryCard(cat, t)
    files.experience = experience(EXP[lang], t)
    files.certifications = certifications(EXP[lang], t)
    const m = MOBILE[lang]
    Object.assign(files, {
      'hero-m': heroM(c, m, t),
      'ticker-m': ticker(c, t, { W: 600, H: 64, fs: 22 }),
      'malilion-ui-m': uiM(c, m),
      'project-island-m': islandM(c, m),
      'now-building-m': nowM(c, t),
      'threads-m': threadsM(c, m),
      'experience-m': experienceM(EXP[lang], m, t),
      'certifications-m': certificationsM(EXP[lang], t),
    })
    for (const [slug, p] of Object.entries(c.row3)) files[`${slug}-m`] = rowM(slug, p, m, t)
    for (const [name, data] of Object.entries(files)) {
      writeFileSync(join(out, `${name}-${lang}-${theme}.svg`), data)
      n++
    }
  }
}
console.log(`${n} bento tiles written to`, out)
