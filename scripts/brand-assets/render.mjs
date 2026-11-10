// Generates the MaliLion brand SVGs in assets/brand/: hero banner, featured
// project cards and the ecosystem diagram. No dependencies:
//   node scripts/brand-assets/render.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const out = join(root, 'assets', 'brand')
mkdirSync(out, { recursive: true })

// Shared orange / dark visual language.
const C = {
  bg: '#14110F',
  panel: '#1E1915',
  line: '#3A2E25',
  orange: '#F0AD2F',
  copper: '#CD7631',
  teal: '#14CFB2',
  text: '#F5EDE3',
  muted: '#A8998A',
}
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans TC', 'PingFang TC', sans-serif"
const MONO = "'Fira Code', 'SFMono-Regular', Consolas, monospace"

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const logo = `data:image/png;base64,${readFileSync(join(out, 'logo-160.png')).toString('base64')}`

const paw = (x, y, s, fill, opacity = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${opacity}">
    <ellipse cx="0" cy="8" rx="9" ry="7.5"/>
    <ellipse cx="-10" cy="-4" rx="3.6" ry="4.6"/>
    <ellipse cx="-3.6" cy="-10" rx="3.6" ry="4.8"/>
    <ellipse cx="3.6" cy="-10" rx="3.6" ry="4.8"/>
    <ellipse cx="10" cy="-4" rx="3.6" ry="4.6"/>
  </g>`

const defs = `
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.copper}"/><stop offset="1" stop-color="${C.orange}"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.8" cy="0.2" r="0.8">
    <stop offset="0" stop-color="${C.orange}" stop-opacity="0.22"/>
    <stop offset="1" stop-color="${C.orange}" stop-opacity="0"/>
  </radialGradient>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M32 0H0V32" fill="none" stroke="${C.line}" stroke-width="1" opacity="0.5"/>
  </pattern>`

// ---------- Hero banner ----------
function hero() {
  const W = 1200, H = 320
  const trail = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const x = 780 + i * 70, y = 250 - (i % 2) * 30 - i * 14
      return `<g class="p" style="animation-delay:${i * 0.35}s">${paw(x, y, 1.1, C.orange)}</g>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="MaliLion — AI × Code × Game Development">
<title>MaliLion — AI × Code × Game Development</title>
<defs>${defs}
  <clipPath id="r"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<style>
  .p { opacity: 0; animation: step 4.2s ease-in-out infinite; }
  @keyframes step { 0%,5% {opacity:0} 15%,60% {opacity:.55} 80%,100% {opacity:0} }
  .cursor { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  @media (prefers-reduced-motion: reduce) { .p { animation: none; opacity: .4 } .cursor { animation: none } }
</style>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${trail}
  <rect y="${H - 6}" width="${W}" height="6" fill="url(#brand)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${C.line}"/>
<circle cx="150" cy="160" r="92" fill="${C.panel}" stroke="url(#brand)" stroke-width="4"/>
<clipPath id="lc"><circle cx="150" cy="160" r="88"/></clipPath><image href="${logo}" x="62" y="72" width="176" height="176" clip-path="url(#lc)"/>
<text x="280" y="128" font-family="${MONO}" font-size="18" fill="${C.teal}">~/malilion $ whoami<tspan class="cursor">▍</tspan></text>
<text x="278" y="190" font-family="${FONT}" font-size="64" font-weight="800" fill="url(#brand)">MaliLion</text>
<text x="280" y="232" font-family="${FONT}" font-size="26" font-weight="600" fill="${C.text}">AI × Code × Game Development</text>
<text x="280" y="268" font-family="${FONT}" font-size="17" fill="${C.muted}">Turning learning into projects, and projects into a brand.</text>
</svg>
`
}

// ---------- Featured project cards ----------
const projects = [
  { slug: 'project-island', name: 'MaliLion Project Island', tag: 'Interactive 3D portfolio island', stack: ['Three.js', 'Web 3D'], art: 'island' },
  { slug: 'contextlion', name: 'ContextLion', tag: 'Web → AI-ready Markdown', stack: ['Extension', 'Local-first'], art: 'doc' },
  { slug: 'ninefold-court', name: '九重燼', tag: 'Visual novel & game architecture', stack: ['Vue 3', 'PixiJS', 'Ink.js'], art: 'ember' },
  { slug: 'devtrace-lion', name: 'DevTrace Lion', tag: 'API debugging in DevTools', stack: ['DevTools', 'Zero perms'], art: 'trace' },
  { slug: 'nocturne-atlas', name: 'The Nocturne Atlas', tag: 'Seed-driven wizarding world', stack: ['Three.js', 'Procedural'], art: 'moon' },
  { slug: 'malilion-com', name: 'MaliLion.com', tag: 'Projects, build notes & brand home', stack: ['Website', 'Build Notes'], art: 'web' },
  { slug: 'cow-pasture', name: 'Cow Pasture', tag: '3D Taiwan-stock pasture dashboard', stack: ['3D', 'Dashboard'], art: 'cow' },
  { slug: 'painterly-meadow', name: 'Painterly Meadow', tag: 'Hand-painted NPR nature sandbox', stack: ['Three.js', 'NPR'], art: 'meadow' },
  { slug: 'fuji-sakura-vista', name: 'Fuji Sakura Vista', tag: 'Procedural Blender scene at dawn', stack: ['Blender', 'Three.js'], art: 'fuji' },
]

const arts = {
  cube: `<g transform="translate(300 92)" fill="none" stroke-width="3" stroke-linejoin="round">
    <path d="M0 -50 L48 -24 L48 30 L0 56 L-48 30 L-48 -24 Z" stroke="${C.orange}"/>
    <path d="M-48 -24 L0 2 L48 -24 M0 2 V56" stroke="${C.copper}"/>
    <path d="M0 -50 L48 -24 L0 2 L-48 -24 Z" fill="${C.orange}" fill-opacity="0.18" stroke="none"/></g>`,
  island: `<g transform="translate(300 84)">
    <ellipse cx="0" cy="44" rx="86" ry="10" fill="${C.teal}" opacity="0.25"/>
    ${[[0,0],[-1,1],[1,1],[0,2],[-2,0],[2,0],[-1,-1],[1,-1],[0,-2],[-2,2],[2,2],[-3,1],[3,1]].sort((a, b) => a[1] - b[1] || a[0] - b[0])
      .map(([q, r], i) => {
        const x = q * 22, y = r * 13 + (i % 3) * -2
        const top = [C.orange, C.copper, C.teal][i % 3]
        return `<g transform="translate(${x} ${y})"><path d="M0 -12 L22 0 L0 12 L-22 0 Z" fill="${top}"/><path d="M-22 0 L0 12 V22 L-22 10 Z" fill="${C.bg}" opacity="0.55"/><path d="M22 0 L0 12 V22 L22 10 Z" fill="${C.bg}" opacity="0.35"/></g>`
      })
      .join('')}
    ${paw(0, -48, 1.1, C.orange)}</g>`,
  web: `<g transform="translate(300 84)">
    <rect x="-74" y="-56" width="148" height="104" rx="10" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>
    <path d="M-74 -36 H74" stroke="${C.line}" stroke-width="2"/>
    <circle cx="-62" cy="-46" r="3" fill="${C.copper}"/><circle cx="-52" cy="-46" r="3" fill="${C.orange}"/><circle cx="-42" cy="-46" r="3" fill="${C.teal}"/>
    <rect x="-28" y="-50" width="88" height="8" rx="4" fill="${C.panel}"/>
    <clipPath id="wl"><circle cx="-36" cy="0" r="22"/></clipPath>
    <circle cx="-36" cy="0" r="24" fill="${C.panel}" stroke="${C.orange}" stroke-width="2"/>
    <image href="${logo}" x="-62" y="-26" width="52" height="52" clip-path="url(#wl)"/>
    <rect x="0" y="-16" width="58" height="9" rx="4" fill="${C.orange}"/>
    <rect x="0" y="0" width="46" height="6" rx="3" fill="${C.muted}" opacity="0.6"/>
    <rect x="0" y="12" width="52" height="6" rx="3" fill="${C.muted}" opacity="0.6"/>
    <rect x="-58" y="30" width="34" height="10" rx="3" fill="${C.copper}" opacity="0.7"/><rect x="-18" y="30" width="34" height="10" rx="3" fill="${C.teal}" opacity="0.6"/><rect x="22" y="30" width="34" height="10" rx="3" fill="${C.orange}" opacity="0.7"/></g>`,
  doc: `<g transform="translate(300 92)" fill="none" stroke-width="3">
    <rect x="-40" y="-52" width="80" height="104" rx="8" stroke="${C.orange}"/>
    <text x="-26" y="-18" font-family="${MONO}" font-size="20" font-weight="700" fill="${C.teal}" stroke="none">#</text>
    <path d="M-8 -24 H26 M-26 0 H26 M-26 18 H14 M-26 36 H20" stroke="${C.copper}" stroke-linecap="round"/></g>`,
  ember: `<g transform="translate(300 96)">
    <path d="M0 -58 C24 -24 40 -6 30 22 C22 46 -22 46 -30 22 C-40 -6 -18 -18 -10 -40 C-4 -24 4 -20 0 -58 Z" fill="${C.copper}"/>
    <path d="M0 -14 C14 4 18 14 12 28 C6 40 -8 40 -12 28 C-16 16 -6 6 0 -14 Z" fill="${C.orange}"/>
    <circle cx="-38" cy="-40" r="3" fill="${C.orange}"/><circle cx="40" cy="-30" r="2.5" fill="${C.orange}"/><circle cx="30" cy="-56" r="2" fill="${C.copper}"/></g>`,
  trace: `<g transform="translate(300 92)" fill="none" stroke-width="3" stroke-linecap="round">
    <rect x="-60" y="-46" width="120" height="92" rx="10" stroke="${C.line}" fill="${C.bg}"/>
    <path d="M-60 -26 H60" stroke="${C.line}"/>
    <circle cx="-48" cy="-36" r="3" fill="${C.copper}" stroke="none"/><circle cx="-38" cy="-36" r="3" fill="${C.orange}" stroke="none"/>
    <path d="M-46 22 L-26 22 L-16 -6 L-2 32 L10 4 L20 14 L46 14" stroke="${C.teal}"/></g>`,
  moon: `<g transform="translate(300 92)">
    <circle r="44" fill="${C.orange}"/><circle cx="18" cy="-12" r="40" fill="${C.panel}"/>
    <path d="M44 -44 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="${C.teal}"/>
    <circle cx="-50" cy="34" r="2.5" fill="${C.copper}"/><circle cx="56" cy="30" r="2" fill="${C.orange}"/></g>`,
  cow: `<g transform="translate(300 78) scale(0.85)">
    <path d="M-70 52 Q-20 30 30 44 T80 50 V64 H-70 Z" fill="${C.teal}" opacity="0.35"/>
    <path d="M-48 -34 l20 26 -14 4 z M14 -34 l-20 26 14 4 z" fill="${C.copper}"/>
    <rect x="-40" y="-20" width="48" height="58" rx="22" fill="${C.text}"/>
    <ellipse cx="-16" cy="26" rx="20" ry="13" fill="${C.copper}"/>
    <circle cx="-22" cy="26" r="2.5" fill="${C.bg}"/><circle cx="-10" cy="26" r="2.5" fill="${C.bg}"/>
    <circle cx="-26" cy="0" r="3.5" fill="${C.bg}"/><circle cx="-6" cy="0" r="3.5" fill="${C.bg}"/>
    <path d="M30 -40 L48 -20 L60 -30 L76 -6" fill="none" stroke="${C.teal}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  meadow: `<g transform="translate(300 78) scale(0.85)" stroke-linecap="round">
    <circle cx="30" cy="-30" r="20" fill="${C.orange}"/>
    <path d="M-80 50 Q-40 10 0 30 T80 22 V60 H-80 Z" fill="${C.copper}" opacity="0.55"/>
    <path d="M-80 60 Q-30 30 20 46 T80 44 V64 H-80 Z" fill="${C.teal}" opacity="0.45"/>
    <path d="M-50 56 q4 -24 10 -34 M-40 58 q0 -20 -6 -30 M10 56 q4 -18 12 -26 M22 58 q-2 -16 -8 -24" fill="none" stroke="${C.orange}" stroke-width="3"/></g>`,
  fuji: `<g transform="translate(300 78) scale(0.85)">
    <path d="M-80 56 L-14 -36 Q0 -48 14 -36 L80 56 Z" fill="${C.copper}"/>
    <path d="M-14 -36 Q0 -48 14 -36 L28 -16 L14 -22 L4 -12 L-6 -22 L-28 -16 Z" fill="${C.text}"/>
    <rect x="38" y="6" width="22" height="50" fill="${C.bg}" opacity="0.6"/>
    <path d="M34 8 h30 M36 24 h26 M38 40 h22" stroke="${C.orange}" stroke-width="3"/>
    <circle cx="-56" cy="-30" r="5" fill="${C.orange}"/><circle cx="-44" cy="-40" r="4" fill="${C.orange}" opacity="0.8"/><circle cx="-62" cy="-46" r="3" fill="${C.copper}"/>
    <circle cx="60" cy="-44" r="4" fill="${C.orange}" opacity="0.8"/></g>`,
}

function card(p) {
  const W = 400, H = 260
  let x = 24
  const chips = p.stack
    .map((s) => {
      const w = s.length * 8 + 22
      const g = `<rect x="${x}" y="214" width="${w}" height="24" rx="12" fill="none" stroke="${C.copper}"/><text x="${x + w / 2}" y="230.5" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${C.orange}">${esc(s)}</text>`
      x += w + 8
      return g
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(p.name)} — ${esc(p.tag)}">
<title>${esc(p.name)} — ${esc(p.tag)}</title>
<defs>${defs}<clipPath id="r"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="${C.panel}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.6"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${paw(360, 236, 1.6, C.orange, 0.08)}
  <rect width="${W}" height="5" fill="url(#brand)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${C.line}"/>
${arts[p.art]}
<text x="24" y="168" font-family="${FONT}" font-size="26" font-weight="800" fill="${C.text}">${esc(p.name)}</text>
<text x="24" y="195" font-family="${FONT}" font-size="15" fill="${C.muted}">${esc(p.tag)}</text>
${chips}
</svg>
`
}

// ---------- Ecosystem diagram ----------
function ecosystem() {
  const W = 900, H = 360, cx = 450, cy = 180
  const nodes = [
    { label: 'Projects', sub: ['Project Island · 九重燼 · Atlas', 'Cow Pasture · Meadow · Fuji'], x: 170, y: 84 },
    { label: 'Dev Tools', sub: ['ContextLion · DevTraceLion', 'FX kits · Codex skills'], x: 170, y: 276 },
    { label: 'Open Source', sub: ['Malilion UI · BlockUI', 'lyricreel · riso-mv-kit'], x: 730, y: 84 },
    { label: 'Content', sub: ['Build notes · Courses', 'Threads · iThome series'], x: 730, y: 276 },
  ]
  const links = nodes
    .map((n) => `<path d="M${cx} ${cy} C${(cx + n.x) / 2} ${cy} ${(cx + n.x) / 2} ${n.y} ${n.x} ${n.y}" fill="none" stroke="url(#brand)" stroke-width="2.5" stroke-dasharray="6 6" class="flow"/>`)
    .join('')
  const boxes = nodes
    .map((n) => `<g transform="translate(${n.x} ${n.y})">
    <rect x="-130" y="-48" width="260" height="96" rx="14" fill="${C.panel}" stroke="${C.line}"/>
    <rect x="-130" y="-48" width="5" height="96" rx="2" fill="${C.orange}"/>
    <text y="-14" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.text}">${esc(n.label)}</text>
    ${n.sub.map((t, i) => `<text y="${12 + i * 20}" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${C.muted}">${esc(t)}</text>`).join('')}</g>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="MaliLion ecosystem: projects, dev tools, open source and content around one brand">
<title>MaliLion ecosystem</title>
<defs>${defs}<clipPath id="r"><rect width="${W}" height="${H}" rx="20"/></clipPath></defs>
<style>
  .flow { animation: dash 1.6s linear infinite; }
  @keyframes dash { to { stroke-dashoffset: -24 } }
  @media (prefers-reduced-motion: reduce) { .flow { animation: none } }
</style>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${C.line}"/>
${links}
${boxes}
<circle cx="${cx}" cy="${cy}" r="70" fill="${C.panel}" stroke="url(#brand)" stroke-width="4"/>
<clipPath id="lc"><circle cx="${cx}" cy="${cy}" r="66"/></clipPath><image href="${logo}" x="${cx - 52}" y="${cy - 62}" width="104" height="104" clip-path="url(#lc)"/>
<text x="${cx}" y="${cy + 52}" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="800" fill="${C.orange}">MaliLion</text>
</svg>
`
}

writeFileSync(join(out, 'hero.svg'), hero())
for (const p of projects) writeFileSync(join(out, `project-${p.slug}.svg`), card(p))
writeFileSync(join(out, 'ecosystem.svg'), ecosystem())
console.log('brand assets written to', out)
