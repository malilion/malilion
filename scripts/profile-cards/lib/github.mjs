// Fetches everything the profile cards need from the GitHub GraphQL API.

async function graphql(token, query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) throw new Error(`GitHub API error: ${JSON.stringify(json.errors ?? json)}`)
  return json.data
}

const CALENDAR = 'contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }'

const PROFILE = `query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      ${CALENDAR}
    }
  }
}`

/** One aliased contributionsCollection per year since the account was created. */
async function allTimeDays(token, login, createdAt) {
  const start = new Date(createdAt)
  const now = new Date()
  const fields = []
  for (let year = start.getUTCFullYear(); year <= now.getUTCFullYear(); year++) {
    const from = year === start.getUTCFullYear() ? start : new Date(Date.UTC(year, 0, 1))
    const to = year === now.getUTCFullYear() ? now : new Date(Date.UTC(year, 11, 31, 23, 59, 59))
    fields.push(`y${year}: contributionsCollection(from: "${from.toISOString()}", to: "${to.toISOString()}") { ${CALENDAR} }`)
  }
  const data = await graphql(token, `query($login: String!) { user(login: $login) { ${fields.join('\n')} } }`, { login })
  const byDate = new Map()
  for (const collection of Object.values(data.user)) {
    for (const week of collection.contributionCalendar.weeks) {
      for (const d of week.contributionDays) byDate.set(d.date, d.contributionCount)
    }
  }
  return [...byDate].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
}

/** Streaks over consecutive calendar days. A quiet today doesn't break the current streak yet. */
function streaks(days) {
  let longest = 0
  let run = 0
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  let i = days.length - 1
  if (i >= 0 && days[i].count === 0) i--
  let current = 0
  while (i >= 0 && days[i].count > 0) {
    current++
    i--
  }
  return { current, longest }
}

function topLanguages(repos, limit) {
  const sizes = new Map()
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) sizes.set(node.name, (sizes.get(node.name) ?? 0) + size)
  }
  const sorted = [...sizes].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, limit).map(([label, value]) => ({ label, value }))
  const rest = sorted.slice(limit).reduce((sum, [, size]) => sum + size, 0)
  return { top, rest, count: sorted.length }
}

export async function fetchProfile(token, login) {
  const { user } = await graphql(token, PROFILE, { login })
  const c = user.contributionsCollection
  const yearDays = c.contributionCalendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount }))
  // The yearly windows end at the request time in UTC; let the past-year calendar win where they overlap.
  const merged = new Map((await allTimeDays(token, login, user.createdAt)).map((d) => [d.date, d.count]))
  for (const d of yearDays) merged.set(d.date, d.count)
  const history = [...merged].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
  const repos = user.repositories.nodes

  return {
    yearDays,
    year: {
      contributions: c.contributionCalendar.totalContributions,
      commits: c.totalCommitContributions,
      pullRequests: c.totalPullRequestContributions,
      issues: c.totalIssueContributions,
      reviews: c.totalPullRequestReviewContributions,
    },
    allTime: history.reduce((sum, d) => sum + d.count, 0),
    since: user.createdAt,
    streak: streaks(history),
    stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
    repos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    languages: topLanguages(repos, 5),
  }
}
