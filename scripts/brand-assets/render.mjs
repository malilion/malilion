// Generates the MaliLion bento README tiles in assets/brand/bento/.
// Every tile comes in light + dark (swapped with <picture> in the README) and
// in English + 繁體中文. No dependencies:
//   node scripts/brand-assets/render.mjs
//
// Layout: every row is 1200 viewBox units wide, so all tiles share one scale
// when the README sets their widths as percentages of the row.
//   hero          1200 × 380
//   ticker        1200 × 120  (two slanted animated tapes)
//   malilion-ui    720 × 420  |  project-island 480 × 420
//   contextlion    400 × 320  |  ninefold-court 400 × 320  |  cow-pasture 400 × 320
//   now-building   720 × 260  |  threads        480 × 260
//   stack-*        600 × 240  (2 × 2 grid, icons embedded from assets/brand/icons)
//   band-*        1200 × 128  |  proj-* 400 × 200 (project index: one banner per category, one card per project)
//   role-1..3      400 × 300 each  |  exp-quote 480 × 280  |  certs 720 × 280
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
const LAVENDER_C = '#B6AFF1'

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
// The mascot at the centre of an orbit, with AI, CODE and GAME cards
// circling it: the "AI × Code × Game" line drawn as a picture.
function orbitScene(cx, cy, k = 1) {
  const card = (x, y, bg, fg, labelText, icon, delay) => `<g transform="translate(${x} ${y})"><g class="f" style="animation-delay:${delay}s">
    <rect x="-54" y="-36" width="108" height="72" rx="18" fill="${bg}"/>
    <g transform="translate(0 -8)">${icon}</g>
    <text x="0" y="26" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="2" fill="${fg}">${labelText}</text></g></g>`
  const ai = `<g stroke="#211C4A" stroke-width="2.5" fill="none"><path d="M-16 6 L0 -10 L16 6 M-16 6 L16 6"/></g>
    <circle cx="-16" cy="6" r="5" fill="#211C4A"/><circle cx="0" cy="-10" r="5" fill="#211C4A"/><circle cx="16" cy="6" r="5" fill="#211C4A"/>
    <path d="M24 -18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFFFFF"/>`
  const code = `<text x="0" y="8" text-anchor="middle" font-family="${MONO}" font-size="24" font-weight="800" fill="#0B2E28">&lt;/&gt;</text>`
  const game = `<path d="M-22 -6 Q-22 -12 -15 -12 H15 Q22 -12 22 -6 L25 8 Q26 15 20 15 Q16 15 13 10 L10 6 H-10 L-13 10 Q-16 15 -20 15 Q-26 15 -25 8 Z" fill="#FFF3E6"/>
    <rect x="-16" y="-3" width="10" height="3.5" rx="1" fill="${COPPER}"/><rect x="-12.7" y="-6.3" width="3.5" height="10" rx="1" fill="${COPPER}"/>
    <circle cx="11" cy="-4" r="2.6" fill="${COPPER}"/><circle cx="15" cy="1" r="2.6" fill="${COPPER}"/>`
  return `<g transform="translate(${cx} ${cy}) scale(${k})">
  <circle r="150" fill="url(#halo)"/>
  <ellipse rx="176" ry="122" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="4 10" class="orbit"/>
  <circle r="104" fill="none" stroke="${GOLD}" stroke-opacity="0.2" stroke-width="2"/>
  <circle r="88" fill="${GOLD}"/>
  <clipPath id="lc"><circle r="78"/></clipPath>
  <image href="${logo}" x="-78" y="-78" width="156" height="156" clip-path="url(#lc)"/>
  <circle cx="-150" cy="-64" r="5" fill="${GOLD}"/><circle cx="140" cy="-74" r="5" fill="${GOLD}"/><circle cx="56" cy="118" r="5" fill="${GOLD}"/>
  ${card(-172, -70, '#B6AFF1', '#211C4A', 'AI', ai, 0)}
  ${card(150, -96, TEAL, '#0B2E28', 'CODE', code, 0.8)}
  ${card(64, 124, COPPER, '#FFF3E6', 'GAME', game, 1.6)}
</g>`
}

const heroDefs = `<defs>
  <radialGradient id="halo"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.28"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="${GOLD}" fill-opacity="0.18"/></pattern>
</defs>`
const heroStyle = `.f{animation:float 5s ease-in-out infinite}@keyframes float{50%{transform:translateY(-6px)}}.orbit{animation:spin 30s linear infinite}@keyframes spin{to{stroke-dashoffset:-280}}@media (prefers-reduced-motion:reduce){.f,.orbit{animation:none}}`

function hero(c, t) {
  const W = 1200, H = 380
  const body = `${heroDefs}
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.hero}"/>
  <rect x="700" width="500" height="${H}" fill="url(#dots)"/>
  ${orbitScene(966, 196)}
</g>
${label(56, 74, c.heroLabel, GOLD)}
${text(52, 152, esc(c.heroA), { size: 60, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(52, 222, `${esc(c.heroB)}<tspan fill="${GOLD}">${esc(c.heroC)}</tspan>`, { size: 60, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(54, 266, esc(c.heroSub), { size: 19, fill: t.heroMuted })}
${pills(54, 296, [
  { t: c.heroPills[0], bg: GOLD, fg: '#111' },
  { t: c.heroPills[1], bg: t.chip, fg: t.heroInk },
  { t: c.heroPills[2], bg: t.chip, fg: t.heroInk },
])}`
  return svg(W, H, c.heroAria, body, { style: heroStyle })
}

// A sheet of Malilion UI components on a riveted metal panel.
const rivet = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#E9C77E"/><circle cx="${x - 1.2}" cy="${y - 1.2}" r="1.6" fill="#FFF3D1"/>`

function uiSheet() {
  const P = { x: 404, y: 40, w: 286, h: 344 }
  const ink = '#F3DDB6', dim = '#9C8665', panel = '#241B12', line = '#4A3922'
  const x0 = P.x + 22
  return `
<defs><linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2C1C"/><stop offset="1" stop-color="#1E1610"/></linearGradient></defs>
<rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="20" fill="url(#metal)" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="2"/>
${rivet(P.x + 16, P.y + 16)}${rivet(P.x + P.w - 16, P.y + 16)}${rivet(P.x + 16, P.y + P.h - 16)}${rivet(P.x + P.w - 16, P.y + P.h - 16)}
<!-- tabs -->
${['Vue', 'React', 'Docs'].map((tab, i) => text(x0 + 6 + i * 74, P.y + 52, tab, { size: 14, weight: 700, fill: i === 0 ? GOLD : dim })).join('')}
<rect x="${x0}" y="${P.y + 62}" width="${P.w - 44}" height="2" fill="${line}"/>
<rect x="${x0}" y="${P.y + 61}" width="46" height="4" rx="2" fill="${GOLD}"/>
<!-- buttons -->
<rect x="${x0}" y="${P.y + 82}" width="112" height="38" rx="10" fill="${GOLD}"/>
${paw(x0 + 22, P.y + 101, 0.55, '#3A2A06')}
${text(x0 + 38, P.y + 106, 'Button', { size: 15, weight: 700, fill: '#1A1206' })}
<rect x="${x0 + 124}" y="${P.y + 82}" width="118" height="38" rx="10" fill="none" stroke="${GOLD}" stroke-width="2"/>
${text(x0 + 183, P.y + 106, 'Outline', { size: 15, weight: 700, fill: GOLD, anchor: 'middle' })}
<!-- input -->
<rect x="${x0}" y="${P.y + 136}" width="${P.w - 44}" height="40" rx="10" fill="${panel}" stroke="${line}" stroke-width="2"/>
<circle cx="${x0 + 20}" cy="${P.y + 155}" r="7" fill="none" stroke="${dim}" stroke-width="2.5"/><path d="M${x0 + 25} ${P.y + 160} l6 6" stroke="${dim}" stroke-width="2.5" stroke-linecap="round"/>
${text(x0 + 40, P.y + 161, 'Search 161 components', { size: 14, fill: dim })}
<!-- switch + checkbox -->
<rect x="${x0}" y="${P.y + 196}" width="52" height="28" rx="14" fill="${GOLD}"/><circle cx="${x0 + 38}" cy="${P.y + 210}" r="10" fill="#FFF8E8"/>
${text(x0 + 62, P.y + 215, 'Dark', { size: 14, weight: 600, fill: ink })}
<rect x="${x0 + 128}" y="${P.y + 197}" width="26" height="26" rx="7" fill="${TEAL}"/><path d="M${x0 + 134} ${P.y + 210} l5 5 9 -10" fill="none" stroke="#0B2E28" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
${text(x0 + 162, P.y + 215, 'Taiwan ID', { size: 14, weight: 600, fill: ink })}
<!-- slider -->
<rect x="${x0}" y="${P.y + 248}" width="${P.w - 44}" height="8" rx="4" fill="${line}"/>
<rect x="${x0}" y="${P.y + 248}" width="160" height="8" rx="4" fill="${GOLD}"/>
<circle cx="${x0 + 160}" cy="${P.y + 252}" r="11" fill="#FFF8E8" stroke="${GOLD}" stroke-width="3"/>
<!-- badges -->
${[['TypeScript', TEAL, '#0B2E28'], ['2 themes', '#B6AFF1', '#211C4A'], ['0 deps', COPPER, '#2A1406']].reduce((acc, [b, bg, fg]) => {
    const w = Math.round(textWidth(b, 12) + 22)
    acc.out += `<rect x="${acc.x}" y="${P.y + 280}" width="${w}" height="26" rx="13" fill="${bg}"/>${text(acc.x + w / 2, P.y + 297, b, { size: 12, weight: 700, fill: fg, anchor: 'middle' })}`
    acc.x += w + 8
    return acc
  }, { x: x0, out: '' }).out}`
}

function malilionUi(c) {
  const W = 720, H = 420
  const body = `
<defs><linearGradient id="ui" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1611"/><stop offset="1" stop-color="#3D2A14"/></linearGradient></defs>
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="url(#ui)"/>
  ${paw(340, 380, 2.4, GOLD, 0.08)}
</g>
${label(44, 64, c.uiLabel, '#D9B27A')}
${text(42, 114, 'Malilion UI', { size: 42, weight: 800, fill: '#FFFFFF', ls: -1 })}
${text(44, 150, esc(c.uiHead), { size: 20, weight: 600, fill: GOLD })}
${text(44, 184, esc(c.uiSub[0]), { size: 15, fill: '#CDBDA9' })}
${text(44, 208, esc(c.uiSub[1]), { size: 15, fill: '#CDBDA9' })}
${text(38, 344, '161', { size: 128, weight: 800, fill: GOLD, ls: -6 })}
${text(44, 376, esc(c.uiUnit), { size: 18, weight: 600, fill: '#CDBDA9' })}
${uiSheet()}`
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

// Illustration bands for the three project tiles, drawn in a 400 × 150 box.
const cowFigure = (fill) => `
    <path d="M-48 -34 l20 26 -14 4 z M14 -34 l-20 26 14 4 z" fill="${COPPER}"/>
    <rect x="-40" y="-20" width="48" height="58" rx="22" fill="${fill}" stroke="#1A1410" stroke-opacity="0.15"/>
    <ellipse cx="-16" cy="26" rx="20" ry="13" fill="#E9A07A"/>
    <circle cx="-22" cy="26" r="2.5" fill="#1A1410"/><circle cx="-10" cy="26" r="2.5" fill="#1A1410"/>
    <circle cx="-26" cy="0" r="3.5" fill="#1A1410"/><circle cx="-6" cy="0" r="3.5" fill="#1A1410"/>`

const projArt = {
  // A web page turning into a Markdown file.
  contextlion: () => `
    <defs><linearGradient id="pa-cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B2F6B"/><stop offset="1" stop-color="#3E3A8C"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#pa-cl)"/>
    <g transform="translate(36 26)">
      <rect width="132" height="98" rx="10" fill="#4A4FA0"/>
      <rect width="132" height="18" rx="9" fill="#5A60B8"/><rect y="9" width="132" height="9" fill="#5A60B8"/>
      <circle cx="12" cy="9" r="3" fill="#FF8A80"/><circle cx="22" cy="9" r="3" fill="${GOLD}"/><circle cx="32" cy="9" r="3" fill="${TEAL}"/>
      <rect x="12" y="28" width="46" height="34" rx="4" fill="#8B91E3"/>
      <path d="M16 58 l12 -14 9 9 7 -6 10 11 z" fill="#C9CCFF"/>
      <rect x="66" y="30" width="54" height="7" rx="3.5" fill="#C9CCFF"/><rect x="66" y="44" width="40" height="6" rx="3" fill="#8B91E3"/><rect x="66" y="56" width="48" height="6" rx="3" fill="#8B91E3"/>
      <rect x="12" y="72" width="108" height="6" rx="3" fill="#8B91E3"/><rect x="12" y="84" width="80" height="6" rx="3" fill="#8B91E3"/>
    </g>
    <path d="M180 75 h30" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/>
    <path d="M210 64 l14 11 -14 11" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M196 34 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#FFFFFF" opacity="0.85"/>
    <g transform="translate(238 18)">
      <rect width="128" height="114" rx="12" fill="#F5F3FF"/>
      <text x="14" y="34" font-family="${MONO}" font-size="22" font-weight="700" fill="${TEAL}">#</text>
      <rect x="34" y="20" width="66" height="10" rx="5" fill="${GOLD}"/>
      <rect x="14" y="48" width="100" height="6" rx="3" fill="#B9B5D8"/><rect x="14" y="60" width="82" height="6" rx="3" fill="#B9B5D8"/>
      <text x="14" y="86" font-family="${MONO}" font-size="14" font-weight="700" fill="${COPPER}">-</text><rect x="26" y="78" width="70" height="6" rx="3" fill="#B9B5D8"/>
      <text x="14" y="102" font-family="${MONO}" font-size="14" font-weight="700" fill="${COPPER}">-</text><rect x="26" y="94" width="56" height="6" rx="3" fill="#B9B5D8"/>
      ${paw(110, 98, 0.55, COPPER, 0.8)}
    </g>`,
  // A tiered palace at dusk, rising embers and a visual-novel dialogue box.
  'ninefold-court': () => `
    <defs><linearGradient id="pa-nc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A0F22"/><stop offset="1" stop-color="#8A3424"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#pa-nc)"/>
    <circle cx="300" cy="46" r="26" fill="${GOLD}" opacity="0.9"/><circle cx="300" cy="46" r="40" fill="${GOLD}" opacity="0.15"/>
    <g fill="#14060D">
      <rect x="150" y="96" width="100" height="40"/>
      <path d="M128 100 Q200 84 272 100 L262 92 Q200 78 138 92 Z"/>
      <rect x="166" y="70" width="68" height="24"/>
      <path d="M146 74 Q200 60 254 74 L246 66 Q200 54 154 66 Z"/>
      <rect x="182" y="48" width="36" height="20"/>
      <path d="M166 52 Q200 40 234 52 L228 44 Q200 34 172 44 Z"/>
      <rect x="198" y="26" width="4" height="12"/>
      <rect x="40" y="110" width="60" height="26"/><path d="M30 112 Q70 102 110 112 L104 106 Q70 98 36 106 Z"/>
      <rect x="300" y="108" width="64" height="28"/><path d="M290 110 Q332 100 374 110 L368 104 Q332 96 296 104 Z"/>
    </g>
    ${[[96, 60, 3], [120, 34, 2], [262, 98, 2.5], [338, 80, 3], [70, 88, 2], [236, 26, 2]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? COPPER : GOLD}"/>`).join('')}
    <rect x="36" y="112" width="328" height="30" rx="8" fill="#FFF7EC" opacity="0.94"/>
    <rect x="48" y="104" width="54" height="16" rx="5" fill="${COPPER}"/>
    <rect x="54" y="110" width="42" height="4" rx="2" fill="#FFF7EC"/>
    <rect x="50" y="126" width="180" height="5" rx="2.5" fill="#8A6A5A"/><rect x="50" y="134" width="120" height="4" rx="2" fill="#B89A88"/>
    <path d="M346 128 l6 6 6 -6 z" fill="${COPPER}"/>`,
  // Green hills that fall like a losing chart, with a cow grazing on the dip.
  'cow-pasture': () => `
    <defs><linearGradient id="pa-cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE8FF"/><stop offset="1" stop-color="#EAF8FF"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#pa-cp)"/>
    <g>${[[40, 30, 22, 1], [66, 40, 18, 1], [92, 44, 26, 1], [118, 62, 14, 0], [144, 58, 24, 1], [170, 74, 18, 1]].map(([x, y, h, down]) => `<rect x="${x - 1}" y="${y - 6}" width="2" height="${h + 12}" fill="${down ? '#2BA84A' : '#E5484D'}"/><rect x="${x - 6}" y="${y}" width="12" height="${h}" rx="2" fill="${down ? '#2BA84A' : '#E5484D'}"/>`).join('')}</g>
    <path d="M0 150 L0 70 L60 82 L110 76 L160 98 L210 92 L260 116 L310 110 L400 124 L400 150 Z" fill="#5BC46A"/>
    <path d="M0 70 L60 82 L110 76 L160 98 L210 92 L260 116 L310 110 L400 124" fill="none" stroke="#2E8B3E" stroke-width="3" stroke-linejoin="round"/>
    <path d="M0 150 L0 112 Q120 96 240 128 T400 136 L400 150 Z" fill="#3FA653"/>
    <g stroke="#8A5A3A" stroke-width="3" stroke-linecap="round"><path d="M28 132 v-18 M52 128 v-18 M76 126 v-18"/><path d="M24 118 h56" stroke-width="2"/></g>
    <g transform="translate(316 104) scale(0.62)">${cowFigure('#FFFFFF')}</g>
    <path d="M286 126 q4 -10 8 0 M296 128 q3 -8 6 0" fill="none" stroke="#2E8B3E" stroke-width="2"/>`,
}

function rowTile(slug, p, t) {
  const W = 400, H = 320
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <g transform="translate(0 8)">${projArt[slug]()}</g>
</g>
${label(32, 192, p.label, t.muted)}
${text(30, 226, esc(p.head[0]), { size: 25, weight: 800, fill: t.ink, ls: -0.5 })}
${text(30, 256, esc(p.head[1]), { size: 25, weight: 800, fill: t.ink, ls: -0.5 })}
<text x="32" y="290" font-family="${FONT}" font-size="14" font-weight="700" fill="${t.ink}">${esc(p.name)}<tspan font-weight="400" font-size="13" fill="${t.muted}">  ·  ${esc(p.meta)}</tspan></text>`
  return svg(W, H, `${p.name} — ${p.head.join(' ')}`, body)
}

// Isometric block for the "now building" construction scene.
const cube = (x, y, s, top, left, right) => `<g transform="translate(${x} ${y})">
    <path d="M0 ${-s / 2} L${s} 0 L0 ${s / 2} L${-s} 0 Z" fill="${top}"/>
    <path d="M${-s} 0 L0 ${s / 2} V${s * 1.1} L${-s} ${s * 0.6} Z" fill="${left}"/>
    <path d="M${s} 0 L0 ${s / 2} V${s * 1.1} L${s} ${s * 0.6} Z" fill="${right}"/></g>`

function nowBuilding(c, t) {
  const W = 720, H = 260
  const items = c.now
    .map((s, i) => `<circle cx="50" cy="${110 + i * 36 - 6}" r="6" fill="${TEAL}"/>${text(68, 110 + i * 36, esc(s), { size: 18, weight: 600, fill: t.ink })}`)
    .join('')
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <rect x="420" y="8" width="292" height="${H - 16}" fill="${t === THEMES.dark ? '#1F2430' : '#E6E8F0'}"/>
  <g transform="translate(0 0)">
    <rect x="652" y="40" width="8" height="186" fill="${COPPER}"/>
    <path d="M652 48 H500 M652 48 L620 30 L652 30 Z" stroke="${COPPER}" stroke-width="6" fill="${COPPER}" stroke-linejoin="round"/>
    <path d="M520 48 V96" stroke="${t.muted}" stroke-width="2"/>
    ${cube(520, 112, 22, '#FFD27A', GOLD, '#C98A18')}
    ${paw(520, 112, 0.5, '#7A4A0A', 0.8)}
    ${cube(500, 196, 26, '#9FF0E2', TEAL, '#0E9C88')}
    ${cube(552, 196, 26, '#D9D5FF', LAVENDER_C, '#8E86D6')}
    ${cube(526, 168, 26, '#F2B58C', COPPER, '#A85A22')}
    <rect x="440" y="226" width="252" height="8" rx="4" fill="${t.muted}" opacity="0.35"/>
  </g>
</g>
<circle cx="49" cy="55" r="5" fill="${TEAL}"><animate attributeName="opacity" values="1;.25;1" dur="2s" repeatCount="indefinite"/></circle>
${label(64, 60, c.nowLabel, t.muted)}
${items}`
  return svg(W, H, `${c.nowLabel}: ${c.now.join(', ')}`, body)
}

function threads(c) {
  const W = 480, H = 260
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${GOLD}"/>
  <g transform="translate(318 44)">
    <rect width="124" height="56" rx="20" fill="#FFFFFF"/>
    <path d="M24 54 l-6 16 20 -14 z" fill="#FFFFFF"/>
    <circle cx="40" cy="28" r="6" fill="#111"/><circle cx="62" cy="28" r="6" fill="#111"/><circle cx="84" cy="28" r="6" fill="#111"/>
  </g>
  <g transform="translate(296 116)">
    <rect width="112" height="60" rx="20" fill="#111"/>
    <path d="M90 58 l10 16 -24 -14 z" fill="#111"/>
    ${paw(56, 32, 1.1, GOLD)}
  </g>
</g>
${label(40, 60, c.ctaLabel, '#5A3F08')}
${text(38, 120, esc(c.ctaHead[0]), { size: 36, weight: 800, fill: '#111', ls: -0.8 })}
${text(38, 162, esc(c.ctaHead[1]), { size: 36, weight: 800, fill: '#111', ls: -0.8 })}
<rect x="40" y="194" width="${Math.round(textWidth(c.ctaSub, 16) + 36)}" height="40" rx="20" fill="#111"/>
${text(58, 220, esc(c.ctaSub), { size: 16, weight: 700, fill: '#FFFFFF' })}`
  return svg(W, H, `${c.ctaHead.join(' ')} ${c.ctaSub}`, body)
}

// Two slanted tapes between the hero and the tiles, scrolling in opposite
// directions: a gold one with the slogans and a dark one with the stack.
// Each line is forced to a fixed length with textLength, so two copies side
// by side loop seamlessly when the group slides by exactly that length.
const TECH = ['VUE 3', 'REACT', 'TYPESCRIPT', 'THREE.JS', '.NET', 'LARAVEL', 'BLENDER', 'GODOT', 'AWS']

function ticker(c, t, { W = 1200, H = 120, fs = 16 } = {}) {
  const tape = ({ y, h, angle, bg, fg, sep, items, dir, id }) => {
    const plain = items.map((s) => `${s}   ✦   `).join('')
    const L = Math.round(textWidth(plain, fs) * 1.08 + fs * 3)
    const line = items.map((s) => `${esc(s)}<tspan fill="${sep}">   ✦   </tspan>`).join('')
    const copy = (x) => `<text x="${x}" y="${Math.round(y + fs * 0.36)}" font-family="${FONT}" font-size="${fs}" font-weight="800" letter-spacing="${(fs / 8).toFixed(1)}" fill="${fg}" textLength="${L}" lengthAdjust="spacing" xml:space="preserve">${line}</text>`
    const dur = Math.round(L / (fs * 2.4))
    return {
      style: `.${id}{animation:${id} ${dur}s linear infinite}@keyframes ${id}{from{transform:translateX(${dir < 0 ? 0 : -L}px)}to{transform:translateX(${dir < 0 ? -L : 0}px)}}`,
      svg: `<g transform="rotate(${angle} ${W / 2} ${y})">
  <rect x="-40" y="${y - h / 2}" width="${W + 80}" height="${h}" fill="${bg}"/>
  <rect x="-40" y="${y - h / 2}" width="${W + 80}" height="2" fill="#FFFFFF" opacity="0.18"/>
  <g class="${id}">${copy(0)}${copy(L)}${copy(2 * L)}${copy(3 * L)}</g>
</g>`,
    }
  }
  const back = tape({ y: H - fs * 2.15, h: fs * 2.5, angle: -1.2, bg: '#15131F', fg: '#F1EDE6', sep: '#B6AFF1', items: TECH, dir: 1, id: 'tb' })
  const front = tape({ y: fs * 2.1, h: fs * 2.75, angle: -1.2, bg: GOLD, fg: '#15131F', sep: '#8A5A0A', items: c.ticker, dir: -1, id: 'tf' })
  const body = `
<defs><clipPath id="band"><rect x="8" y="0" width="${W - 16}" height="${H}" rx="20"/></clipPath></defs>
<g clip-path="url(#band)">
${back.svg}
${front.svg}
</g>`
  return svg(W, H, `${c.ticker.join(' · ')} — ${TECH.join(' · ')}`, body, {
    style: `${back.style}${front.style}@media (prefers-reduced-motion:reduce){.tb,.tf{animation:none}}`,
  })
}

// Category cards that head each column of the "Everything else" index.
const CATS = {
  en: [
    { slug: 'ai-tools', label: 'AI & DEV TOOLS', head: 'Tools that stay local.', sub: 'Desktop · extensions · skills' },
    { slug: 'games', label: 'GAMES', head: 'Games to play right now.', sub: 'Three.js · Rapier · Blender' },
    { slug: 'worlds', label: 'INTERACTIVE WORLDS', head: 'Worlds to walk into.', sub: 'Three.js · Blender · NPR' },
    { slug: 'creative', label: 'DESIGN & CREATIVE CODE', head: 'Code that draws.', sub: 'React UI · lyric MV · FX' },
  ],
  zh: [
    { slug: 'ai-tools', label: 'AI 與開發工具', head: '留在本機的工具', sub: '桌面 App · 擴充功能 · Skills' },
    { slug: 'games', label: '遊戲', head: '打開就能玩的遊戲', sub: 'Three.js · Rapier · Blender' },
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
  // A game controller over a snowy slope, with coins and a play sign.
  games: `<defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123B4A"/><stop offset="1" stop-color="#1F6E7A"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#gm)"/>
    <path d="M0 150 L0 104 L120 70 L250 112 L400 84 L400 150 Z" fill="#EAF6FA"/>
    <path d="M120 70 L104 80 L136 78 Z M400 84 L380 92 L400 96 Z" fill="#FFFFFF"/>
    <path d="M0 150 L0 128 Q160 108 400 134 L400 150 Z" fill="#CFE7EF"/>
    ${[[52, 44], [84, 30], [334, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${GOLD}"/><circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#B97A0F" stroke-width="2"/>`).join('')}
    <g transform="translate(200 70)">
      <path d="M-74 -26 Q-74 -40 -58 -40 H58 Q74 -40 74 -26 L84 22 Q88 44 68 44 Q56 44 48 30 L38 16 H-38 L-48 30 Q-56 44 -68 44 Q-88 44 -84 22 Z" fill="${GOLD}"/>
      <rect x="-50" y="-14" width="28" height="9" rx="3" fill="#3A2A06"/><rect x="-40" y="-24" width="9" height="28" rx="3" fill="#3A2A06"/>
      <circle cx="36" cy="-18" r="7" fill="${TEAL}"/><circle cx="52" cy="-4" r="7" fill="${COPPER}"/><circle cx="20" cy="-4" r="7" fill="#B6AFF1"/><circle cx="36" cy="10" r="7" fill="#FFFFFF"/>
      ${paw(0, 4, 0.55, '#3A2A06', 0.7)}
    </g>
    <g transform="translate(318 104)"><circle r="16" fill="#E5484D"/><path d="M-5 -8 L9 0 L-5 8 Z" fill="#FFFFFF"/></g>`,
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


// ---------- Experience timeline + certifications ----------
const EXP = {
  en: {
    label: 'EXPERIENCE · 2023 → NOW',
    now: 'NOW',
    role: 'Software Engineer',
    stops: [
      { years: '2023', org: 'Startup company', short: 'Startup', tech: ['Laravel · MySQL · REST APIs', 'Docker · enterprise systems'] },
      { years: '2024 — 2026', org: 'Industrial computer company', short: 'Industrial PC', tech: ['ASP.NET Core · Vue.js', 'MSSQL / Oracle · internal platforms'] },
      { years: '2026 — now', org: 'Technology company', short: 'Tech company', tech: ['Vue.js · .NET Core APIs', 'Architecture · team practices'] },
    ],
    quote: ['I turn real operational problems into maintainable systems,', 'then carry what I learn into side projects and open source.'],
    quote4: ['I turn real operational problems', 'into maintainable systems, then', 'carry what I learn into side', 'projects and open source.'],
    certLabel: 'CERTIFICATIONS',
    aria: 'Experience: 2023 startup, 2024–2026 industrial computer company, 2026–now technology company',
  },
  zh: {
    label: '工作經歷 · 2023 → 現在',
    now: '現在',
    role: '軟體工程師',
    stops: [
      { years: '2023', org: '新創公司', short: '新創公司', tech: ['Laravel · MySQL · REST API', 'Docker · 企業內部系統'] },
      { years: '2024～2026', org: '工業電腦公司', short: '工業電腦', tech: ['ASP.NET Core · Vue.js', 'MSSQL / Oracle · 內部平台'] },
      { years: '2026～現在', org: '科技業', short: '科技業', tech: ['Vue.js · .NET Core API', '系統架構 · 團隊開發規範'] },
    ],
    quote: ['把真實營運問題轉成可維護的系統，', '再把學到的東西帶進 Side Project 與開源作品。'],
    quote4: ['把真實營運問題', '轉成可維護的系統，', '再把學到的東西帶進', 'Side Project 與開源作品。'],
    certLabel: '證照',
    aria: '工作經歷：2023 新創公司、2024～2026 工業電腦公司、2026～現在 科技業',
  },
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
    quoteShort: ['Real problems →', 'maintainable', 'systems →', 'open source.'],
  },
  zh: {
    heroA: '把小點子，', heroB: '做成', heroC: '真的作品。',
    heroSub: ['白天是軟體工程師，', '晚上做元件庫、開發工具和 3D 世界。'],
    uiHead: '做了 161 個元件之後',
    island: ['碼力獅', '專案島'],
    kinds: { contextlion: '擴充功能', 'ninefold-court': '視覺小說', 'cow-pasture': '3D 儀表板' },
    cta: ['追蹤我的', '開發筆記'],
    quote: ['把真實營運問題轉成可維護的系統，', '再把學到的東西帶進', 'Side Project 與開源作品。'],
    quoteShort: ['真實問題 →', '可維護的', '系統 →', '開源作品。'],
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
  const W = 600, H = 720
  const body = `${heroDefs}
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.hero}"/>
  <rect width="${W}" height="300" fill="url(#dots)"/>
  ${orbitScene(300, 160, 0.86)}
</g>
${text(44, 340, 'MALILION · AI × CODE × GAME', { size: 18, weight: 700, fill: GOLD, font: MONO, ls: 2 })}
${text(40, 404, esc(m.heroA), { size: 54, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(40, 466, esc(m.heroB), { size: 54, weight: 800, fill: t.heroInk, ls: -1.5 })}
${text(40, 528, esc(m.heroC), { size: 54, weight: 800, fill: GOLD, ls: -1.5 })}
${text(42, 576, esc(m.heroSub[0]), { size: 23, fill: t.heroMuted })}
${text(42, 608, esc(m.heroSub[1]), { size: 23, fill: t.heroMuted })}
${pillRow(42, 634, [{ t: 'malilion.com ↗', bg: GOLD, fg: '#111' }, { t: 'Threads @malilion.dev', bg: t.chip, fg: t.heroInk }], 20)}`
  return svg(W, H, c.heroAria, body, { style: heroStyle })
}

function uiM(c, m) {
  const W = 360, H = 420
  const body = `
<defs><linearGradient id="ui" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1611"/><stop offset="1" stop-color="#3D2A14"/></linearGradient></defs>
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="url(#ui)"/>${paw(300, 370, 2.6, GOLD, 0.08)}</g>
${rivet(26, 26)}${rivet(W - 26, 26)}
${text(32, 70, 'NPM @malilion/ui', { size: 18, weight: 600, fill: '#D9B27A', font: MONO })}
${text(30, 120, 'Malilion UI', { size: 40, weight: 800, fill: '#FFFFFF', ls: -1 })}
${text(32, 156, esc(m.uiHead), { size: 22, weight: 600, fill: GOLD })}
<rect x="32" y="180" width="118" height="40" rx="11" fill="${GOLD}"/>
${paw(54, 200, 0.6, '#3A2A06')}
${text(70, 206, 'Button', { size: 17, weight: 700, fill: '#1A1206' })}
<rect x="166" y="186" width="54" height="28" rx="14" fill="${GOLD}"/><circle cx="206" cy="200" r="10" fill="#FFF8E8"/>
<rect x="236" y="187" width="26" height="26" rx="7" fill="${TEAL}"/><path d="M242 200 l5 5 9 -10" fill="none" stroke="#0B2E28" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
${text(24, 344, '161', { size: 130, weight: 800, fill: GOLD, ls: -6 })}
${text(32, 382, esc(c.uiUnit), { size: 24, weight: 600, fill: '#CDBDA9' })}`
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
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <g transform="translate(-24 8) scale(0.62)">${projArt[slug]()}</g>
</g>
${text(20, 152, esc(p.name), { size: 25, weight: 800, fill: t.ink, ls: -0.5 })}
${text(20, 186, esc(m.kinds[slug]), { size: 20, fill: t.muted })}`
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



// ---------- Footer ----------
const FOOT = {
  en: {
    sub: ['Thanks for stopping by. Explore the projects, follow', 'the experiments, or say hi on Threads.'],
    thanks: 'Thanks for stopping by.',
    sign: ['Explore the projects, follow the experiments,', 'or say hi on Threads.'],
    signM: ['Explore the projects,', 'follow the experiments,', 'or say hi on Threads.'],
    loop: 'THE LOOP',
    steps: ['BUILD', 'LEARN', 'SHARE'],
    subM: ['Thanks for stopping by. Explore the', 'projects, follow the experiments,', 'or say hi on Threads.'],
    made: 'Made in Taiwan',
    aria: 'Build, learn, share, build again. Thanks for stopping by. malilion.com · Threads @malilion.dev · github.com/malilion',
  },
  zh: {
    sub: ['謝謝你逛到這裡。看看作品、追蹤實驗，', '或到 Threads 打聲招呼。'],
    thanks: '謝謝你逛到這裡。',
    sign: ['看看作品、追蹤實驗，', '或到 Threads 打聲招呼。'],
    signM: ['看看作品、追蹤實驗，', '或到 Threads', '打聲招呼。'],
    loop: '循環',
    steps: ['BUILD', 'LEARN', 'SHARE'],
    subM: ['謝謝你逛到這裡。', '看看作品、追蹤實驗，', '或到 Threads 打聲招呼。'],
    made: '在台灣製作',
    aria: 'Build、Learn、Share、Build again。謝謝你逛到這裡。malilion.com · Threads @malilion.dev · github.com/malilion',
  },
}
const CONTACTS = [['WEB', 'malilion.com'], ['THREADS', '@malilion.dev'], ['GITHUB', 'github.com/malilion']]



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

// ---------- Project index: category banners + one card per project ----------
const GHU = 'https://github.com/malilion/'
const PG = 'https://malilion.github.io/'
const CAT_COLOR = { 'ai-tools': '#B6AFF1', games: TEAL, worlds: '#3C6FA8', creative: GOLD }
const INDEX = {
  'ai-tools': [
    { slug: 'aura-rec', name: 'AURA REC', href: `${PG}AURA-REC/`, act: 'site', en: 'Free, privacy-first screen recorder and tutorial editor for macOS, Windows and the browser.', zh: '免費開源、隱私優先的螢幕錄影與教學剪輯工具，桌面與瀏覽器都能用。' },
    { slug: 'stocklion', name: 'StockLion 股力獅', href: `${GHU}StockLion`, act: 'repo', en: 'Browser extension: Taiwan stock quotes and watchlists on any page.', zh: '瀏覽器擴充功能：在任何網頁看台股報價與自選清單。' },
    { slug: 'ai-radar', name: 'Malilion AI Radar', href: `${PG}Malilion-AI-Radar/`, act: 'site', en: 'Hourly news and AI intelligence site, built and updated automatically.', zh: '每小時自動更新的新聞與 AI 情報網站。' },
    { slug: 'devtrace', name: 'DevTrace Lion', href: `${GHU}DevTraceLion`, act: 'repo', en: 'Local-first API debugging inside DevTools, zero permissions.', zh: '在 DevTools 內做 Local-first API 除錯，不需任何權限。' },
    { slug: 'landing-skill', name: 'Repo Landing Page Skill', href: `${PG}github-repo-landing-page-skill/`, act: 'site', en: 'Agent skill that turns any GitHub repo into a landing page.', zh: '把任何 GitHub repo 變成形象頁的 agent skill。' },
    { slug: 'photo-skills', name: 'Codex photo skills', href: `${GHU}editorial-photo-poster`, act: 'repo', en: 'Photos into editorial posters, jewelry concepts and travel bookmarks.', zh: '照片轉成編輯風海報、珠寶概念與旅行書籤。' },
  ],
  games: [
    { slug: 'powder-rush', name: 'POWDER RUSH 粉雪狂飆', href: `${PG}Snowboarding/`, act: 'play', en: '3D snowboarding: a 3,200 m run, 18 kickers, tricks and gates.', zh: '單板滑雪 3D 動作遊戲：3,200 公尺賽道、18 個跳台。' },
    { slug: 'neon-taipei', name: 'Neon Taipei Overdrive', href: `${PG}neon-taipei-overdrive/`, act: 'play', en: 'Cyberpunk action on a rainy Taipei night, in one HTML file.', zh: '雨夜台北的賽博龐克動作遊戲，只有一個 HTML 檔。' },
    { slug: 'shuangyue', name: '霜月問劍', href: `${PG}shuangyue-wenjian/`, act: 'play', en: 'Top-down wuxia action: three stages, two-phase bosses.', zh: '俯視角武俠動作，三關，每關有兩階段 Boss。' },
    { slug: 'cloud-dive', name: 'Cloud Dive 雲海跳傘', href: `${PG}prachute/`, act: 'play', en: 'Skydive from 4,000 m through golden clouds onto the target.', zh: '從 4,000 公尺穿越金色雲海，降落在靶心。' },
    { slug: 'star-garden', name: 'Star Garden Rumble', href: `${PG}star-garden-rumble/`, act: 'play', en: 'Low-poly physics defence on a floating island.', zh: '浮島上的低面數 3D 物理防守遊戲。' },
    { slug: 'polar-bbq', name: 'Polar Bear BBQ 3D', href: `${PG}Polar-Bear-BBQ-Game/`, act: 'play', en: 'A grill-shop game modelled in Blender, played in Three.js.', zh: 'Blender 建模、Three.js 呈現的北極熊烤肉店。' },
  ],
  worlds: [
    { slug: 'nocturne', name: 'The Nocturne Atlas', href: `${PG}The-Nocturne-Atlas/`, act: 'site', en: 'Seed-driven 3D wizarding world in Three.js and TypeScript.', zh: '由種子驅動的 3D 魔法世界，Three.js + TypeScript。' },
    { slug: 'meadow', name: 'Painterly Meadow', zhName: '風之草原', href: `${PG}Painterly-Meadow/`, act: 'site', en: 'Hand-painted NPR nature sandbox in one Three.js file.', zh: '單一 Three.js 檔案的手繪風 NPR 自然沙盒。' },
    { slug: 'fuji', name: 'Fuji Sakura Vista', href: `${PG}fuji-sakura-vista/`, act: 'site', en: 'Procedural Blender scene of Fuji at dawn, with a Three.js showcase.', zh: 'Blender 程式生成的富士山黎明場景，附 Three.js 展示。' },
    { slug: 'bee', name: 'Realistic Bee & Flowers', href: `${PG}bee_scene/`, act: 'site', en: 'A honeybee forages a 3D meadow, in one offline HTML file.', zh: '蜜蜂在草原採花的互動 3D 場景，單一離線 HTML 檔。' },
    { slug: 'gummy', name: 'Gummy/Bears.', href: `${PG}my-bear-jelly/`, act: 'site', en: 'Wobbly gummy bears, every pixel raymarched in one shader.', zh: '會晃動的軟糖熊，每個像素都由 shader 算出。' },
    { slug: 'all-repos', name: 'All 32 repos', zhName: '全部 32 個 repo', href: 'https://github.com/malilion?tab=repositories', act: 'more', en: 'Everything else, from experiments to tools.', zh: '其他實驗、工具與作品都在這裡。' },
  ],
  creative: [
    { slug: 'blockui', name: 'BlockUI', href: 'https://malilion.github.io/BlockUI/', act: 'site', en: 'Pixel-crafting React UI, five themes, WCAG 2.2 AA.', zh: '像素合成遊戲風 React 元件庫，五種主題，WCAG 2.2 AA。' },
    { slug: 'lyricreel', name: 'lyricreel', href: `${GHU}lyricreel`, act: 'repo', en: 'Song + lyrics in, beat-synced lyric video out.', zh: '輸入歌曲與歌詞，輸出跟著節拍走的歌詞 MV。' },
    { slug: 'riso', name: 'riso-mv-kit', href: `${GHU}riso-mv-kit`, act: 'repo', en: 'Riso-print picture-book music videos drawn in code.', zh: '用程式繪製的 Riso 印刷風繪本 MV。' },
    { slug: 'inkfx', name: 'InkFX', href: `${PG}inkfx/`, act: 'site', en: 'Procedural ink and wuxia effects: 132 seeded effects.', zh: '程式生成的水墨武俠特效：132 種可重現效果。' },
    { slug: 'oledfx', name: 'oledfx', href: `${PG}oledfx/`, act: 'site', en: 'Small-screen animations exported as C headers for OLEDs.', zh: '小螢幕動畫，匯出成 OLED 可用的 C 標頭檔。' },
    { slug: 'fx-skill-kit', name: 'fx-skill-kit', href: `${PG}fx-skill-kit/`, act: 'site', en: 'Zero-dependency FX suite with quality gates and MCP tools.', zh: '零依賴特效套件，含品質檢查與 MCP 工具。' },
  ],
}
const ACT = {
  en: { play: '▶ PLAY', site: '↗ SITE', repo: 'REPO', more: 'VIEW ALL →', count: (n) => `${n} PROJECTS` },
  zh: { play: '▶ 試玩', site: '↗ 網站', repo: 'REPO', more: '看全部 →', count: (n) => `${n} 個作品` },
}

function wrapLines(str, size, maxW, maxLines) {
  // Words stay whole; a word wider than the line (long CJK text) breaks
  // between characters instead.
  const tokens = []
  str.split(' ').forEach((word, wi) => {
    if (textWidth(word, size) > maxW) [...word].forEach((ch, ci) => tokens.push({ t: ch, sp: wi > 0 && ci === 0 }))
    else tokens.push({ t: word, sp: wi > 0 })
  })
  const lines = []
  let cur = ''
  for (const { t: tok, sp } of tokens) {
    const next = cur ? cur + (sp ? ' ' : '') + tok : tok
    if (textWidth(next, size) > maxW && cur) {
      lines.push(cur)
      cur = tok
    } else cur = next
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,，、]*\S?$/, '') + '…'
    return kept
  }
  return lines
}

function catBanner(cat, count, lang, t, phone = false) {
  const W = phone ? 600 : 1200, H = phone ? 150 : 128
  const k = phone ? 0.6 : 0.75
  const artW = 400 * k
  const body = `
<defs><clipPath id="art"><rect x="8" y="8" width="${artW}" height="${H - 16}" rx="0"/></clipPath></defs>
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <g clip-path="url(#art)"><g transform="translate(8 ${(H - 150 * k) / 2}) scale(${k})">${catArt[cat.slug]}</g></g>
</g>
${phone
  ? `${text(artW + 32, 66, esc(cat.label), { size: 18, weight: 700, fill: t.muted, font: MONO, ls: 2 })}${text(artW + 30, 108, ACT[lang].count(count), { size: 26, weight: 800, fill: t.ink })}`
  : `${label(artW + 36, 50, cat.label, t.muted)}${text(artW + 34, 92, esc(cat.head), { size: 30, weight: 800, fill: t.ink, ls: -0.6 })}
${text(W - 44, 50, ACT[lang].count(count), { size: 13, weight: 700, fill: CAT_COLOR[cat.slug] === GOLD ? '#B97A0F' : t.muted, font: MONO, anchor: 'end', ls: 2 })}
${text(W - 44, 92, esc(cat.sub), { size: 15, fill: t.muted, font: MONO, anchor: 'end' })}`}`
  return svg(W, H, `${cat.label}: ${cat.head}`, body)
}

function projectCard(item, cat, lang, t, phone = false) {
  const W = phone ? 200 : 400, H = phone ? 170 : 200
  const color = CAT_COLOR[cat]
  const name = lang === 'zh' && item.zhName ? item.zhName : item.name
  const more = item.act === 'more'
  const bg = more ? GOLD : t.tile
  const ink = more ? '#111' : t.ink
  const mut = more ? '#3A2A06' : t.muted
  const tag = ACT[lang][item.act]
  const tagW = Math.round(textWidth(tag, phone ? 16 : 12) + (phone ? 22 : 20))
  if (phone) {
    const nl = wrapLines(name, 22, 160, 3)
    const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${bg}"/><rect x="8" y="8" width="${W - 16}" height="6" fill="${more ? '#111' : color}" opacity="${more ? 0.2 : 1}"/></g>
${nl.map((l, i) => text(20, 54 + i * 28, esc(l), { size: 22, weight: 800, fill: ink, ls: -0.3 })).join('')}
<rect x="20" y="${H - 50}" width="${tagW}" height="30" rx="15" fill="${more ? '#111' : color}" opacity="${more ? 1 : 0.22}"/>
${text(20 + tagW / 2, H - 30, esc(tag), { size: 16, weight: 700, fill: more ? GOLD : ink, font: MONO, anchor: 'middle' })}`
    return svg(W, H, `${name}: ${item[lang]}`, body)
  }
  const dl = wrapLines(item[lang], 14.5, 330, 2)
  const body = `
<g clip-path="url(#tile)"><rect width="${W}" height="${H}" fill="${bg}"/><rect x="8" y="8" width="6" height="${H - 16}" fill="${more ? '#111' : color}" opacity="${more ? 0.2 : 1}"/></g>
${text(36, 64, esc(name), { size: 23, weight: 800, fill: ink, ls: -0.4 })}
${dl.map((l, i) => text(36, 98 + i * 22, esc(l), { size: 14.5, fill: mut })).join('')}
<rect x="36" y="${H - 54}" width="${tagW}" height="26" rx="13" fill="${more ? '#111' : color}" opacity="${more ? 1 : 0.22}"/>
${text(36 + tagW / 2, H - 36, esc(tag), { size: 12, weight: 700, fill: more ? GOLD : ink, font: MONO, anchor: 'middle', ls: 1 })}`
  return svg(W, H, `${name}: ${item[lang]}`, body)
}

// ---------- Experience: three role tiles, a quote and certifications ----------
// The role tiles share one timeline track drawn edge to edge at the same
// height, so it reads as one line running through all three images.
function chipsWrap(items, x0, y0, maxW, fs, bg, fg) {
  let x = x0, y = y0
  const h = Math.round(fs * 2)
  return items
    .map((it) => {
      const w = Math.round(textWidth(it, fs) + fs * 1.6)
      if (x + w > x0 + maxW) { x = x0; y += h + 8 }
      const g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/>${text(x + w / 2, y + h / 2 + fs * 0.36, esc(it), { size: fs, weight: 600, fill: fg, anchor: 'middle' })}`
      x += w + 8
      return g
    })
    .join('')
}

function roleTile(e, i, t) {
  const W = 400, H = 300
  const s = e.stops[i], cur = i === e.stops.length - 1
  const bg = cur ? GOLD : t.tile, ink = cur ? '#111' : t.ink, mut = cur ? '#4A3508' : t.muted
  const tech = s.tech.flatMap((l) => l.split(' · '))
  const node = cur
    ? `<circle cx="44" cy="40" r="15" fill="#111" opacity="0.15"><animate attributeName="r" values="11;17;11" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="44" cy="40" r="9" fill="#111"/>`
    : `<circle cx="44" cy="40" r="8" fill="${t.tile}" stroke="${t.ink}" stroke-width="3"/>`
  const body = `
<line x1="0" y1="40" x2="${W}" y2="40" stroke="${cur ? GOLD : t.line}" stroke-width="4"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${bg}"/>
<line x1="8" y1="40" x2="${W - 8}" y2="40" stroke="${cur ? '#111' : t.line}" stroke-opacity="${cur ? 0.18 : 1}" stroke-width="4"/>
${node}
${cur ? `<rect x="${W - 32 - Math.round(textWidth(e.now, 12) + 24)}" y="28" width="${Math.round(textWidth(e.now, 12) + 24)}" height="24" rx="12" fill="#111"/>${text(W - 32 - Math.round(textWidth(e.now, 12) + 24) / 2, 45, esc(e.now), { size: 12, weight: 700, fill: GOLD, font: MONO, anchor: 'middle' })}` : ''}
${text(34, 112, esc(s.years), { size: 38, weight: 800, fill: ink, ls: -1 })}
${text(36, 146, esc(e.role), { size: 18, weight: 700, fill: ink })}
${text(36, 170, esc(s.org), { size: 15, fill: mut })}
${chipsWrap(tech, 36, 194, 328, 12.5, cur ? 'rgba(17,17,17,0.12)' : t.line, ink)}`
  return svg(W, H, `${s.years}: ${e.role}, ${s.org} — ${tech.join(', ')}`, body, { style: '@media (prefers-reduced-motion:reduce){animate{display:none}}' })
}

function roleTileM(e, i, t) {
  const W = 200, H = 220
  const s = e.stops[i], cur = i === e.stops.length - 1
  const bg = cur ? GOLD : t.tile, ink = cur ? '#111' : t.ink, mut = cur ? '#4A3508' : t.muted
  const body = `
<line x1="0" y1="36" x2="${W}" y2="36" stroke="${cur ? GOLD : t.line}" stroke-width="5"/>
<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="20" fill="${bg}"/>
<circle cx="32" cy="36" r="9" fill="${cur ? '#111' : t.tile}" stroke="${cur ? '#111' : t.ink}" stroke-width="3"/>
${text(22, 104, esc(s.years.split(/\s*[—～]\s*/)[0]), { size: 40, weight: 800, fill: ink, ls: -1 })}
${text(24, 140, esc(cur ? e.now : s.years.split(/\s*[—～]\s*/)[1] ? `→ ${s.years.split(/\s*[—～]\s*/)[1]}` : ''), { size: 19, weight: 700, fill: cur ? ink : mut })}
${text(24, 180, esc(s.short), { size: 20, weight: 600, fill: mut })}`
  return svg(W, H, `${s.years}: ${e.role}, ${s.org}`, body)
}

function quoteTile(e, m, t, phone = false) {
  const W = phone ? 240 : 480, H = phone ? 300 : 280
  const lines = phone ? m.quoteShort : e.quote4
  const fs = phone ? 22 : 20
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.hero}"/>
${text(phone ? 22 : 36, phone ? 92 : 96, '“', { size: phone ? 90 : 110, weight: 800, fill: GOLD })}
${lines.map((l, i) => text(phone ? 24 : 40, (phone ? 122 : 134) + i * (fs + 9), esc(l), { size: fs, weight: 600, fill: t.heroInk })).join('')}
${text(phone ? 24 : 40, H - (phone ? 32 : 36), '— MaliLion', { size: phone ? 16 : 14, weight: 700, fill: GOLD, font: MONO })}`
  return svg(W, H, lines.join(' '), body)
}

function certTile(e, t, phone = false) {
  const W = phone ? 360 : 720, H = phone ? 300 : 280
  const names = [['AWS Cloud', 'Practitioner'], ['AWS AI', 'Practitioner'], ['MTA', 'Database'], ['MTA', 'Networking'], ['MTA', 'Software Dev']]
  const pos = phone
    ? [[100, 88], [260, 88], [70, 198], [180, 198], [290, 198]]
    : [[92, 104], [212, 104], [380, 104], [500, 104], [620, 104]]
  const size = phone ? 76 : 92
  const badges = CERTS.map((c, i) => {
    const [x, y] = pos[i]
    return `<image href="${certImg[c.file]}" x="${x - size / 2}" y="${y}" width="${size}" height="${size}"/>${phone ? '' : `${text(x, y + size + 26, names[i][0], { size: 12.5, fill: t.muted, anchor: 'middle' })}${text(x, y + size + 44, names[i][1], { size: 13.5, weight: 700, fill: t.ink, anchor: 'middle' })}`}`
  }).join('')
  const group = (x1, x2, y, label) => `${text((x1 + x2) / 2, y, label, { size: phone ? 15 : 12, weight: 700, fill: GOLD, font: MONO, anchor: 'middle', ls: 2 })}<line x1="${x1}" y1="${y + 10}" x2="${x2}" y2="${y + 10}" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>`
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.tile}"/>
${label(phone ? 26 : 36, phone ? 46 : 52, e.certLabel, t.muted, phone ? 16 : 13)}
${phone ? `${group(40, 320, 70, 'AWS')}${group(30, 330, 178, 'MICROSOFT MTA')}` : `${group(40, 264, 82, 'AWS')}${group(320, 680, 82, 'MICROSOFT MTA')}`}
${badges}`
  return svg(W, H, `${e.certLabel}: AWS Cloud Practitioner, AWS AI Practitioner, MTA Database, MTA Networking, MTA Software Development`, body)
}

// Footer: the Build → Learn → Share loop drawn as a cycle around the mascot,
// next to a sign-off card.
function loopTile(f, t, phone = false) {
  const W = phone ? 240 : 480, H = phone ? 340 : 320
  const cx = W / 2, cy = phone ? 190 : 172, r = phone ? 70 : 104
  const colors = [GOLD, TEAL, '#B6AFF1']
  const nodes = f.steps.map((st, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
    const w = phone ? 64 : 92, h = phone ? 28 : 34
    return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${h / 2}" fill="${colors[i]}"/>${text(x.toFixed(1), (y + (phone ? 6 : 6)).toFixed(1), st, { size: phone ? 13 : 14, weight: 800, fill: '#15131F', font: MONO, anchor: 'middle', ls: phone ? 0.8 : 1.5 })}`
  }).join('')
  // Arrow heads sit between the nodes, pointing clockwise.
  const heads = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / 3
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
    const deg = (a * 180) / Math.PI + 90
    return `<path d="M-7 -6 L5 0 L-7 6 Z" fill="${GOLD}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})"/>`
  }).join('')
  const m = phone ? 36 : 56
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.hero}"/>
${text(phone ? 26 : 36, phone ? 50 : 52, f.loop, { size: phone ? 16 : 13, weight: 700, fill: GOLD, font: MONO, ls: 2 })}
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="6 8" class="loop"/>
${heads}
<circle cx="${cx}" cy="${cy}" r="${m + 6}" fill="${GOLD}"/>
<clipPath id="lm"><circle cx="${cx}" cy="${cy}" r="${m}"/></clipPath>
<image href="${logo}" x="${cx - m}" y="${cy - m}" width="${m * 2}" height="${m * 2}" clip-path="url(#lm)"/>
${nodes}`
  return svg(W, H, `${f.steps.join(' → ')} → ${f.steps[0]}`, body, {
    style: `.loop{animation:loop 12s linear infinite}@keyframes loop{to{stroke-dashoffset:-140}}@media (prefers-reduced-motion:reduce){.loop{animation:none}}`,
  })
}

function signTile(f, t, phone = false) {
  const W = phone ? 360 : 720, H = phone ? 340 : 320
  const chips = CONTACTS.map(([, v]) => v)
  let x = phone ? 28 : 44
  const chipRow = phone
    ? chips.map((v, i) => `${text(30, 112 + f.signM.length * 26 + 22 + i * 30, v, { size: 19, weight: 700, fill: t.ink })}`).join('')
    : chips.map((v, i) => {
        const w = Math.round(textWidth(v, 15) + 30)
        const g = `<rect x="${x}" y="196" width="${w}" height="36" rx="18" fill="${i === 0 ? GOLD : 'none'}" stroke="${i === 0 ? GOLD : t.muted}" stroke-opacity="${i === 0 ? 1 : 0.5}" stroke-width="1.5"/>${text(x + w / 2, 219, v, { size: 15, weight: 700, fill: i === 0 ? '#111' : t.ink, anchor: 'middle' })}`
        x += w + 10
        return g
      }).join('')
  const sub = phone ? f.signM.slice(0, 3) : f.sign
  const body = `
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="${t.tile}"/>
${phone
  ? `${text(28, 72, esc(f.thanks), { size: f.thanks.length > 12 ? 26 : 28, weight: 800, fill: t.ink, ls: -0.5 })}${f.signM.map((l, i) => text(30, 112 + i * 26, esc(l), { size: 19, fill: t.muted })).join('')}`
  : `${text(42, 92, esc(f.thanks), { size: 40, weight: 800, fill: t.ink, ls: -1 })}${sub.map((l, i) => text(44, 134 + i * 26, esc(l), { size: 18, fill: t.muted })).join('')}`}
${chipRow}
${text(phone ? 30 : W - 44, H - (phone ? 26 : 40), `© 2026 MaliLion · ${f.made}`, { size: phone ? 15 : 13, fill: t.muted, font: MONO, anchor: phone ? 'start' : 'end' })}
${phone ? '' : `${paw(60, H - 46, 0.7, GOLD, 0.7)}${paw(96, H - 56, 0.7, GOLD, 0.5)}${paw(132, H - 46, 0.7, GOLD, 0.3)}`}`
  return svg(W, H, `${f.thanks} ${f.sign.join(' ')} malilion.com · @malilion.dev · github.com/malilion`, body)
}

// Stack tiles: one per group, with the Skill Icons (assets/brand/icons,
// MIT) embedded as data URIs so the tile is a single self-contained image.
const STACK_ICONS = {
  core: ['html', 'css', 'js', 'ts', 'php', 'cs', 'dotnet'],
  frontend: ['laravel', 'vue', 'react', 'nextjs', 'vite', 'pinia', 'tailwind'],
  cloud: ['aws', 'docker', 'vercel', 'cloudflare', 'supabase', 'postgres', 'mysql'],
  tools: ['git', 'github', 'gitlab', 'pnpm', 'obsidian', 'threejs', 'godot'],
}
const iconUri = (id, theme) =>
  `data:image/svg+xml;base64,${readFileSync(join(brand, 'icons', `${id}-${theme}.svg`)).toString('base64')}`

function stackTile(s, t, theme) {
  const W = 600, H = 240, size = 64, gap = 12
  const icons = STACK_ICONS[s.slug].map((id, i) => `<image href="${iconUri(id, theme)}" x="${36 + i * (size + gap)}" y="134" width="${size}" height="${size}"/>`).join('')
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <rect x="8" y="8" width="${W - 16}" height="8" fill="${STACK_DOT[s.slug]}"/>
</g>
<circle cx="44" cy="62" r="8" fill="${STACK_DOT[s.slug]}"/>
${text(62, 70, esc(s.name), { size: 25, weight: 800, fill: t.ink, ls: -0.4 })}
${text(38, 104, esc(s.sub), { size: 14, fill: t.muted, font: MONO })}
${icons}`
  return svg(W, H, `${s.name}: ${STACK_ICONS[s.slug].join(', ')}`, body)
}

// Phone version: drawn for half of a ~360px screen, icons in a 4 + 3 grid.
function stackTileM(s, t, theme) {
  const W = 300, H = 260, size = 56, gap = 10
  const icons = STACK_ICONS[s.slug].map((id, i) => `<image href="${iconUri(id, theme)}" x="${26 + (i % 4) * (size + gap)}" y="${92 + Math.floor(i / 4) * (size + gap)}" width="${size}" height="${size}"/>`).join('')
  const body = `
<g clip-path="url(#tile)">
  <rect width="${W}" height="${H}" fill="${t.tile}"/>
  <rect x="8" y="8" width="${W - 16}" height="8" fill="${STACK_DOT[s.slug]}"/>
</g>
${text(26, 66, esc(s.name), { size: 23, weight: 800, fill: t.ink, ls: -0.4 })}
${icons}`
  return svg(W, H, `${s.name}: ${STACK_ICONS[s.slug].join(', ')}`, body)
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
    for (const st of STACK[lang]) {
      files[`stack-${st.slug}`] = stackTile(st, t, theme)
      files[`stack-${st.slug}-m`] = stackTileM(st, t, theme)
    }
    for (const cat of CATS[lang]) {
      const items = INDEX[cat.slug]
      files[`band-${cat.slug}`] = catBanner(cat, items.filter((i) => i.act !== 'more').length, lang, t)
      files[`band-${cat.slug}-m`] = catBanner(cat, items.filter((i) => i.act !== 'more').length, lang, t, true)
      for (const item of items) {
        files[`proj-${item.slug}`] = projectCard(item, cat.slug, lang, t)
        files[`proj-${item.slug}-m`] = projectCard(item, cat.slug, lang, t, true)
      }
    }
    EXP[lang].stops.forEach((_, i) => {
      files[`role-${i + 1}`] = roleTile(EXP[lang], i, t)
      files[`role-${i + 1}-m`] = roleTileM(EXP[lang], i, t)
    })
    files['exp-quote'] = quoteTile(EXP[lang], MOBILE[lang], t)
    files['exp-quote-m'] = quoteTile(EXP[lang], MOBILE[lang], t, true)
    files.certs = certTile(EXP[lang], t)
    files['certs-m'] = certTile(EXP[lang], t, true)
    const m = MOBILE[lang]
    Object.assign(files, {
      'hero-m': heroM(c, m, t),
      'ticker-m': ticker(c, t, { W: 600, H: 150, fs: 21 }),
      'malilion-ui-m': uiM(c, m),
      'project-island-m': islandM(c, m),
      'now-building-m': nowM(c, t),
      'threads-m': threadsM(c, m),
      'foot-loop': loopTile(FOOT[lang], t),
      'foot-loop-m': loopTile(FOOT[lang], t, true),
      'foot-sign': signTile(FOOT[lang], t),
      'foot-sign-m': signTile(FOOT[lang], t, true),
    })
    for (const [slug, p] of Object.entries(c.row3)) files[`${slug}-m`] = rowM(slug, p, m, t)
    for (const [name, data] of Object.entries(files)) {
      writeFileSync(join(out, `${name}-${lang}-${theme}.svg`), data)
      n++
    }
  }
}
console.log(`${n} bento tiles written to`, out)
