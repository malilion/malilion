// Live npm numbers for the Malilion UI tiles: latest version and the last
// 30 days of downloads (total plus the daily series for a sparkline).

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`npm request failed: ${res.status} ${url}`)
  return res.json()
}

export async function fetchNpm(pkg) {
  const enc = pkg.replace('/', '%2F')
  const [latest, range] = await Promise.all([
    getJson(`https://registry.npmjs.org/${pkg}/latest`),
    getJson(`https://api.npmjs.org/downloads/range/last-month/${enc}`),
  ])
  const daily = range.downloads.map((d) => d.downloads)
  return { pkg, version: latest.version, monthly: daily.reduce((a, b) => a + b, 0), daily }
}
