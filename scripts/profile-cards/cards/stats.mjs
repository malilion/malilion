// GitHub statistics laid out with Malilion UI components: stats, streak, languages, monthly bars.

import { h } from 'vue'
import { MlBarChart, MlCard, MlDonut, MlRing, MlStat } from '@malilion/ui'
import { htmlCard, ssr } from '../lib/svg.mjs'

export const FULL = 840
export const HALF = 412

const strings = {
  en: {
    stats: 'GitHub Stats',
    since: (year) => `Since ${year}`,
    allTime: 'All time',
    year: 'Past year',
    commits: 'Commits',
    pullRequests: 'Pull requests',
    issues: 'Issues',
    reviews: 'Code reviews',
    stars: 'Stars earned',
    repos: 'Public repos',
    streak: 'Contribution Streak',
    current: 'Current streak',
    longest: 'Longest streak',
    days: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
    languages: 'Top Languages',
    languageCount: 'languages',
    other: 'Other',
    monthly: 'Contributions per Month',
    monthlyEyebrow: 'Past 12 months',
    numberLocale: 'en-US',
  },
  zh: {
    stats: 'GitHub 統計',
    since: (year) => `${year} 年加入`,
    allTime: '累計貢獻',
    year: '近一年貢獻',
    commits: 'Commits',
    pullRequests: 'Pull Requests',
    issues: 'Issues',
    reviews: 'Code Reviews',
    stars: '獲得星星',
    repos: '公開專案',
    streak: '連續貢獻',
    current: '目前連續',
    longest: '最長連續',
    days: (n) => `${n} 天`,
    languages: '常用語言',
    languageCount: '種語言',
    other: '其他',
    monthly: '每月貢獻',
    monthlyEyebrow: '近 12 個月',
    numberLocale: 'zh-TW',
  },
}

// Measured in Chrome, plus slack for viewers whose fallback body font runs taller.
const HEIGHT = { stats: 346, half: 318, monthly: 302 }

const css = `
/* Bottom padding keeps the card's drop shadow inside the image. */
.card{width:100%;height:100%;padding-bottom:10px}
.card>.ml-card{height:100%}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 16px}
.streak{display:flex;align-items:center;gap:24px}
.streak-stats{display:grid;gap:14px}
.ring-days{display:block;font-family:var(--ml-font-display);font-size:28px;font-weight:600;line-height:1;color:var(--ml-gold-300)}
.ring-unit{display:block;margin-top:4px;font-size:11px;color:var(--ml-text-dim)}
`

function monthly(days, numberLocale) {
  const months = new Map()
  for (const d of days) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count)
  const fmt = new Intl.DateTimeFormat(numberLocale, { month: 'short', timeZone: 'UTC' })
  return [...months]
    .slice(-12)
    .map(([key, value]) => ({ label: fmt.format(new Date(`${key}-01T00:00:00Z`)), value }))
}

export async function renderStatCards(profile, locale, lang, theme) {
  const t = strings[lang]
  const n = (v) => v.toLocaleString(t.numberLocale)
  const card = (props, body) => () => h('div', { class: 'card' }, [h(MlCard, props, { default: body })])

  const overview = await ssr(
    locale,
    card({ title: t.stats, eyebrow: `@malilion · ${t.since(new Date(profile.since).getUTCFullYear())}`, rivets: true }, () =>
      h(
        'div',
        { class: 'stats' },
        [
          [t.allTime, profile.allTime],
          [t.year, profile.year.contributions],
          [t.commits, profile.year.commits],
          [t.pullRequests, profile.year.pullRequests],
          [t.issues, profile.year.issues],
          [t.reviews, profile.year.reviews],
          [t.stars, profile.stars],
          [t.repos, profile.repos],
        ].map(([label, value]) => h(MlStat, { label, value: n(value) })),
      ),
    ),
  )

  const { current, longest } = profile.streak
  const streak = await ssr(
    locale,
    card({ title: t.streak, rivets: true }, () =>
      h('div', { class: 'streak' }, [
        h(MlRing, { value: current, max: Math.max(longest, 1), size: 120, thickness: 10, tone: 'gold' }, () => [
          h('span', { class: 'ring-days' }, n(current)),
          h('span', { class: 'ring-unit' }, t.days(current).replace(/^[\d,]+\s*/, '')),
        ]),
        h('div', { class: 'streak-stats' }, [
          h(MlStat, { label: t.current, value: t.days(current) }),
          h(MlStat, { label: t.longest, value: t.days(longest) }),
        ]),
      ]),
    ),
  )

  const { top, rest, count } = profile.languages
  const languages = await ssr(
    locale,
    card({ title: t.languages, rivets: true }, () =>
      h(MlDonut, {
        data: rest ? [...top, { label: t.other, value: rest }] : top,
        size: 132,
        thickness: 14,
        title: String(count),
        caption: t.languageCount,
        legend: true,
      }),
    ),
  )

  const bars = await ssr(
    locale,
    card({ title: t.monthly, eyebrow: t.monthlyEyebrow, rivets: true }, () =>
      h(MlBarChart, { data: monthly(profile.yearDays, t.numberLocale), height: 150, highlight: 'max', tone: 'gold', format: n }),
    ),
  )

  return {
    stats: htmlCard({ html: overview, width: FULL, height: HEIGHT.stats, theme, css, label: `${t.stats}: ${t.allTime} ${n(profile.allTime)}` }),
    streak: htmlCard({ html: streak, width: HALF, height: HEIGHT.half, theme, css, label: `${t.current} ${t.days(current)}, ${t.longest} ${t.days(longest)}` }),
    languages: htmlCard({ html: languages, width: HALF, height: HEIGHT.half, theme, css, label: `${t.languages}: ${top.map((l) => l.label).join(', ')}` }),
    monthly: htmlCard({ html: bars, width: FULL, height: HEIGHT.monthly, theme, css, label: t.monthly }),
  }
}
