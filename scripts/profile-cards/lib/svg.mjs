// Wraps server-rendered component HTML in a standalone SVG via <foreignObject>,
// which GitHub shows as a plain image (no scripts, no external requests).

import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { MlConfigProvider } from '@malilion/ui'
import { componentCss, fontFace, themeTokens, usedClasses } from './styles.mjs'

export async function ssr(locale, render) {
  return renderToString(createSSRApp({ render: () => h(MlConfigProvider, { locale }, render) }))
}

const VOID = 'area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr'

/** Vue's SSR output is HTML; foreignObject content must be well-formed XHTML. */
function toXhtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(new RegExp(`<(${VOID})\\b([^>]*?)\\s*/?>`, 'g'), '<$1$2/>')
    .replace(/<svg(?![^>]*\bxmlns=)/g, '<svg xmlns="http://www.w3.org/2000/svg"')
    .replace(/&nbsp;/g, '&#160;')
}

export const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * @param {object} o
 * @param {string} o.html   Rendered markup for the card.
 * @param {number} o.width
 * @param {number} o.height
 * @param {'dark'|'light'} o.theme
 * @param {string} o.label  Accessible summary of the card.
 * @param {string} [o.css]  Extra layout rules for the card's own wrapper classes.
 */
export function htmlCard({ html, width, height, theme, label, css = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
<style>
${fontFace}
.root{${themeTokens(theme)};height:100%;color:var(--ml-text);font-family:var(--ml-font-body);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.root,.root *{box-sizing:border-box}
/* A still image: show every component in its settled state. */
.root *{animation:none!important;transition:none!important}
${componentCss(usedClasses(html))}
${css}
</style>
<foreignObject x="0" y="0" width="${width}" height="${height}">
<div xmlns="http://www.w3.org/1999/xhtml" class="root" data-ml-theme="${theme}">${toXhtml(html)}</div>
</foreignObject>
</svg>
`
}
