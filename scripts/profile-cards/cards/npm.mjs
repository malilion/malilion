// Malilion UI npm tiles for the README, in the same style as the brand's
// Malilion UI tile (warm metal gradient, gold accents). Plain SVG.
//
//   npm-version    600 × 150  |  npm-downloads 600 × 150
//   *-m            300 × 200  (phone, half of a ~360px screen)

const FONT = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
const MONO = "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace"
const GOLD = '#F0AD2F'
const INK = '#FFFFFF'
const MUTED = '#CDBDA9'
const LABEL = '#D9B27A'

const strings = {
  en: { pkg: 'NPM PACKAGE', latest: 'latest', downloads: 'DOWNLOADS', perMonth: 'last 30 days', install: 'npm i @malilion/ui' },
  zh: { pkg: 'NPM 套件', latest: '最新版本', downloads: '下載次數', perMonth: '近 30 天', install: 'npm i @malilion/ui' },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const text = (x, y, s, { size = 16, weight = 400, fill, font = FONT, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`
const numWidth = (s, size, ls = 0) => [...String(s)].reduce((w, ch) => w + (/[,.]/.test(ch) ? size * 0.28 : size * 0.6) + ls, 0)

function svg(W, H, aria, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<title>${esc(aria)}</title>
<defs>
  <linearGradient id="ui" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1611"/><stop offset="1" stop-color="#3D2A14"/></linearGradient>
  <clipPath id="tile"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24"/></clipPath>
</defs>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="24" fill="url(#ui)"/>
${body}
</svg>
`
}

// A generic package box (not the npm logo).
const box = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -26 L26 -13 L26 15 L0 28 L-26 15 L-26 -13 Z" fill="${GOLD}" opacity="0.18"/>
  <path d="M0 -26 L26 -13 L0 0 L-26 -13 Z" fill="${GOLD}"/>
  <path d="M-26 -13 L0 0 V28 L-26 15 Z" fill="#C98A18"/><path d="M26 -13 L0 0 V28 L26 15 Z" fill="#A86E10"/>
  <path d="M-13 -19.5 L13 -6.5" stroke="#FFF3D1" stroke-width="3" opacity="0.7"/></g>`

function spark(values, x0, x1, top, bottom) {
  const max = Math.max(1, ...values)
  const step = (x1 - x0) / Math.max(1, values.length - 1)
  const pts = values.map((v, i) => `${(x0 + i * step).toFixed(1)},${(bottom - ((bottom - top) * v) / max).toFixed(1)}`)
  const last = pts[pts.length - 1].split(',')
  return `<polyline points="${x0},${bottom} ${pts.join(' ')} ${x1},${bottom}" fill="${GOLD}" fill-opacity="0.16" stroke="none"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="${GOLD}"/>`
}

export function renderNpmCards(npm, lang) {
  const s = strings[lang]
  const v = `v${npm.version}`
  const dl = npm.monthly.toLocaleString(lang === 'zh' ? 'zh-TW' : 'en-US')
  const verAria = `@malilion/ui ${v} (${s.latest}) — ${s.install}`
  const dlAria = `@malilion/ui: ${dl} ${s.downloads.toLowerCase()} (${s.perMonth})`
  return {
    'npm-version': svg(600, 150, verAria, `
${text(36, 50, `${s.pkg} · @malilion/ui`, { size: 13, weight: 700, fill: LABEL, font: MONO, ls: 1.8 })}
${text(34, 110, v, { size: 52, weight: 800, fill: GOLD, ls: -1.5 })}
${text(34 + numWidth(v, 52, -1.5) + 4, 110, s.latest, { size: 16, weight: 600, fill: MUTED })}
<rect x="300" y="84" width="212" height="36" rx="10" fill="#120E0A" stroke="${GOLD}" stroke-opacity="0.35"/>
${text(316, 108, `$ ${s.install}`, { size: 14, fill: '#F3DDB6', font: MONO })}
${box(540, 60, 0.9)}`),
    'npm-downloads': svg(600, 150, dlAria, `
${text(36, 50, `${s.downloads} · ${s.perMonth}`, { size: 13, weight: 700, fill: LABEL, font: MONO, ls: 1.8 })}
${text(34, 112, dl, { size: 56, weight: 800, fill: INK, ls: -2 })}
<g clip-path="url(#tile)">${spark(npm.daily, 250, 560, 52, 116)}</g>`),
    'npm-version-m': svg(300, 200, verAria, `
${text(24, 52, 'NPM', { size: 18, weight: 700, fill: LABEL, font: MONO, ls: 2 })}
${text(22, 124, v, { size: 50, weight: 800, fill: GOLD, ls: -1.5 })}
${text(24, 164, s.latest, { size: 20, weight: 600, fill: MUTED })}
${box(250, 50, 0.7)}`),
    'npm-downloads-m': svg(300, 200, dlAria, `
${text(24, 52, s.downloads, { size: 18, weight: 700, fill: LABEL, font: MONO, ls: 2 })}
${text(22, 124, dl, { size: 54, weight: 800, fill: INK, ls: -2 })}
${text(24, 164, s.perMonth, { size: 20, weight: 600, fill: MUTED })}
<g clip-path="url(#tile)">${spark(npm.daily, 150, 280, 72, 120)}</g>`),
  }
}
