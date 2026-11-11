'use client'
import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import PaperCard from '@/components/PaperCard'
import PaperTable, { SortKey, SortState } from '@/components/PaperTable'
import VenueFilter from '@/components/VenueFilter'
import { Download, Search } from '@/components/icons'
import { loadPapers, loadTopics, Paper, Topic, topicColor } from '@/lib/data'

type View = 'table' | 'cards'
interface Filters {
  q: string; title: string; author: string; venues: string[]
  y1: string; y2: string; source: string; code: boolean
}
const EMPTY: Filters = { q: '', title: '', author: '', venues: [], y1: '', y2: '', source: '', code: false }

function useDebounced<T>(v: T, ms = 200) {
  const [d, setD] = useState(v)
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t) }, [v, ms])
  return d
}

function match(p: Paper, f: Filters, skipVenue = false) {
  const has = (s: string, q: string) => s.toLowerCase().includes(q.toLowerCase())
  return (!f.q || has(p.title, f.q) || has(p.authors, f.q) || has(p.venue, f.q)) &&
    (!f.title || has(p.title, f.title)) &&
    (!f.author || has(p.authors, f.author)) &&
    (skipVenue || !f.venues.length || f.venues.includes(p.venue)) &&
    (!f.y1 || p.year >= f.y1) && (!f.y2 || p.year <= f.y2) &&
    (!f.source || p.links.some(l => l[0] === f.source)) &&
    (!f.code || p.code.includes('github.com'))
}

function toCsv(rows: Paper[]) {
  const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
  const lines = ['title,authors,date,venue,url,code']
  for (const p of rows) lines.push([p.title, p.authors, p.date, p.venue, p.links[0]?.[1] || '', p.code].map(esc).join(','))
  return lines.join('\n')
}

function pageList(page: number, pages: number): (number | '…')[] {
  const s = new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages))
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of Array.from(s).sort((a, b) => a - b)) { if (n - prev > 1) out.push('…'); out.push(n); prev = n }
  return out
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [topic, setTopic] = useState('')
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [raw, setRaw] = useState<Filters>(EMPTY)
  const f = useDebounced(raw)
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' })
  const [view, setView] = useState<View>('table')
  const [size, setSize] = useState(100)
  const [page, setPage] = useState(1)
  const set = (patch: Partial<Filters>) => setRaw(r => ({ ...r, ...patch }))

  // initial state from URL / screen size
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setRaw({ q: p.get('q') || '', title: p.get('ti') || '', author: p.get('au') || '',
      venues: p.get('v') ? p.get('v')!.split('|') : [], y1: p.get('y1') || '', y2: p.get('y2') || '',
      source: p.get('src') || '', code: p.get('code') === '1' })
    const [k, d] = (p.get('sort') || 'date.desc').split('.')
    setSort({ key: (k as SortKey) || 'date', dir: d === 'asc' ? 'asc' : 'desc' })
    let v = p.get('view') as View | null
    if (!v) { try { v = localStorage.getItem('view') as View | null } catch {} }
    setView(v || (window.matchMedia('(min-width: 768px)').matches ? 'table' : 'cards'))
    loadTopics().then(ts => { setTopics(ts); setTopic(ts.find(t => t.key === p.get('topic'))?.key || ts[0]?.key || '') })
  }, [])

  useEffect(() => {
    if (!topic) return
    setLoading(true)
    loadPapers(topic).then(ps => { setPapers(ps); setLoading(false) })
  }, [topic])

  useEffect(() => setPage(1), [topic, f, sort, size])

  // shareable URL
  useEffect(() => {
    if (!topic) return
    const p = new URLSearchParams({ topic })
    const put = (k: string, v: string) => v && p.set(k, v)
    put('q', f.q); put('ti', f.title); put('au', f.author); put('v', f.venues.join('|'))
    put('y1', f.y1); put('y2', f.y2); put('src', f.source); put('code', f.code ? '1' : '')
    if (sort.key !== 'date' || sort.dir !== 'desc') p.set('sort', `${sort.key}.${sort.dir}`)
    p.set('view', view)
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [topic, f, sort, view])

  const years = useMemo(() => Array.from(new Set(papers.map(p => p.year).filter(Boolean))).sort(), [papers])
  const sources = useMemo(() => Array.from(new Set(papers.flatMap(p => p.links.map(l => l[0])))).sort(), [papers])
  const venueCounts = useMemo(() => {
    const c = new Map<string, number>()
    for (const p of papers) if (p.venue && match(p, f, true)) c.set(p.venue, (c.get(p.venue) || 0) + 1)
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1])
  }, [papers, f])
  const filtered = useMemo(() => {
    const out = papers.filter(p => match(p, f))
    const cmp: Record<SortKey, (a: Paper, b: Paper) => number> = {
      date: (a, b) => a.date.localeCompare(b.date), title: (a, b) => a.title.localeCompare(b.title),
      venue: (a, b) => a.venue.localeCompare(b.venue) || b.date.localeCompare(a.date),
    }
    out.sort(cmp[sort.key])
    if (sort.dir === 'desc') out.reverse()
    return out
  }, [papers, f, sort])

  const current = topics.find(t => t.key === topic)
  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const shown = filtered.slice((page - 1) * size, page * size)
  const newSince = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0, 10) }, [])
  const go = (n: number) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const onSort = (k: SortKey) => setSort(s => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : k === 'date' ? 'desc' : s.key === k ? 'desc' : 'asc' }))
  const chooseView = (v: View) => { setView(v); try { localStorage.setItem('view', v) } catch {} }
  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `papers_${topic}_filtered.csv`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // active-filter chips
  const chips: [string, () => void][] = []
  if (raw.q) chips.push([`“${raw.q}”`, () => set({ q: '' })])
  if (raw.title) chips.push([`title: ${raw.title}`, () => set({ title: '' })])
  if (raw.author) chips.push([`author: ${raw.author}`, () => set({ author: '' })])
  raw.venues.forEach(v => chips.push([v, () => set({ venues: raw.venues.filter(x => x !== v) })]))
  if (raw.y1 || raw.y2) chips.push([`${raw.y1 || '…'}–${raw.y2 || '…'}`, () => set({ y1: '', y2: '' })])
  if (raw.source) chips.push([`source: ${raw.source}`, () => set({ source: '' })])
  if (raw.code) chips.push(['with code', () => set({ code: false })])

  const small = 'input !h-8 w-full !px-2 text-xs'
  const yearSel = (val: string, k: 'y1' | 'y2', ph: string) => (
    <select value={val} onChange={e => set({ [k]: e.target.value })} className={small} aria-label={ph}>
      <option value="">{ph}</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  )
  const filterCells = [
    <div key="d" className="flex gap-1 [&>select]:min-w-0 [&>select]:flex-1">{yearSel(raw.y1, 'y1', 'from')}{yearSel(raw.y2, 'y2', 'to')}</div>,
    <input key="t" value={raw.title} onChange={e => set({ title: e.target.value })} placeholder="Filter title…" className={small} />,
    <input key="a" value={raw.author} onChange={e => set({ author: e.target.value })} placeholder="Filter author…" className={small} />,
    <VenueFilter key="v" counts={venueCounts} selected={raw.venues} onChange={v => set({ venues: v })} />,
    <select key="s" value={raw.source} onChange={e => set({ source: e.target.value })} className={small} aria-label="Source">
      <option value="">All</option>{sources.map(s => <option key={s}>{s}</option>)}
    </select>,
    <label key="c" className="flex h-8 cursor-pointer items-center gap-2 text-xs font-medium">
      <input type="checkbox" checked={raw.code} onChange={e => set({ code: e.target.checked })} className="h-4 w-4 accent-[#4F46E5]" /> Has code
    </label>,
  ]

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16">
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 py-5" aria-label="Topics">
          {topics.map(t => {
            const active = t.key === topic
            return (
              <button key={t.key} onClick={() => { setTopic(t.key); setRaw(EMPTY) }}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active
                  ? 'border-transparent bg-ink text-white shadow-card dark:bg-ink-dark dark:text-canvas-dark'
                  : 'border-line bg-surface hover:border-accent/50 dark:border-line-dark dark:bg-surface-dark'}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: topicColor(t.key) }} />
                {t.title}<span className={`tabular-nums text-xs ${active ? 'opacity-70' : 'muted'}`}>{t.count.toLocaleString()}</span>
              </button>
            )
          })}
        </nav>

        {current && (
          <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{current.title}</h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed muted">{current.about}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {([['Papers', current.count], ['With code', current.with_code], ['New in 30 days', current.new_30d]] as const).map(([label, n]) => (
                <div key={label} className="card px-4 py-3">
                  <div className="text-xl font-bold tabular-nums" style={{ color: topicColor(current.key) }}>{n.toLocaleString()}</div>
                  <div className="text-xs muted">{label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* global search + view switch */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 muted"><Search /></span>
            <input value={raw.q} onChange={e => set({ q: e.target.value })} placeholder="Search everything: title, author, venue…"
                   className="input w-full pl-9" aria-label="Search papers" />
          </label>
          <div className="inline-flex rounded-lg border border-line p-0.5 dark:border-line-dark" role="tablist" aria-label="View">
            {(['table', 'cards'] as View[]).map(v => (
              <button key={v} onClick={() => chooseView(v)} aria-selected={view === v} role="tab"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === v ? 'bg-surface shadow-card dark:bg-surface-dark' : 'muted'}`}>
                {v === 'table' ? '☰ Table' : '▤ Cards'}
              </button>
            ))}
          </div>
        </div>

        {/* active filters + counts */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{loading ? 'Loading…' : `${filtered.length.toLocaleString()} papers`}</span>
          {chips.map(([label, clear]) => (
            <button key={label} onClick={clear} className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent dark:bg-accent-softdark dark:text-accent-dark">
              {label}<span aria-label="remove">✕</span>
            </button>
          ))}
          {chips.length > 1 && <button onClick={() => setRaw(EMPTY)} className="text-xs muted hover:underline">Clear all</button>}
          <button onClick={download} disabled={!filtered.length} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline disabled:opacity-40 dark:text-accent-dark">
            <Download /> CSV{chips.length ? ' (filtered)' : ''}
          </button>
        </div>

        {loading ? (
          <div className="card h-96 animate-pulse" />
        ) : view === 'table' ? (
          <PaperTable rows={shown} sort={sort} onSort={onSort} filters={filterCells} newSince={newSince} />
        ) : (
          <>
            <div className="card mb-3 grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
              {filterCells.map((c, i) => <div key={i}>{c}</div>)}
              <select value={`${sort.key}.${sort.dir}`} onChange={e => { const [k, d] = e.target.value.split('.'); setSort({ key: k as SortKey, dir: d as 'asc' | 'desc' }) }}
                      className={small} aria-label="Sort">
                <option value="date.desc">Newest first</option><option value="date.asc">Oldest first</option>
                <option value="title.asc">Title A–Z</option><option value="venue.asc">Venue A–Z</option>
              </select>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3">{shown.map((p, i) => <PaperCard key={p.title + i} p={p} q={f.q} isNew={p.seen >= newSince} />)}</div>
          </>
        )}

        {!loading && !filtered.length && (
          <div className="card mt-3 p-10 text-center">
            <p className="font-medium">No papers match these filters.</p>
            <button className="mt-2 text-sm text-accent hover:underline dark:text-accent-dark" onClick={() => setRaw(EMPTY)}>Clear filters</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <nav className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Pagination">
            <span className="muted tabular-nums">{((page - 1) * size + 1).toLocaleString()}–{Math.min(page * size, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => go(page - 1)} className="input !h-8 !px-2.5 disabled:opacity-40">‹</button>
              {pageList(page, pages).map((n, i) => n === '…' ? <span key={`e${i}`} className="px-1 muted">…</span> : (
                <button key={n} onClick={() => go(n)} className={`input !h-8 min-w-[2rem] !px-2 tabular-nums ${n === page ? '!border-accent bg-accent-soft font-semibold text-accent dark:bg-accent-softdark dark:text-accent-dark' : ''}`}>{n}</button>
              ))}
              <button disabled={page === pages} onClick={() => go(page + 1)} className="input !h-8 !px-2.5 disabled:opacity-40">›</button>
            </div>
            <select value={size} onChange={e => setSize(Number(e.target.value))} className="input !h-8 text-xs" aria-label="Rows per page">
              {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </nav>
        )}
      </main>

      <footer className="border-t border-line py-8 text-sm dark:border-line-dark">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:justify-between">
          <div className="max-w-xl muted">
            <p>Collected automatically from arXiv, OpenAlex, DBLP, OpenReview, Semantic Scholar, Crossref, Hugging Face Papers and conference proceedings, merged by title. Maintained by{' '}
              <a className="font-medium text-ink hover:underline dark:text-ink-dark" href="https://github.com/mtuann" target="_blank" rel="noreferrer">Tuan Nguyen</a>.</p>
            <p className="mt-1">If this helps your research, you can support it on{' '}
              <a className="font-medium text-ink hover:underline dark:text-ink-dark" href="https://ko-fi.com/miutheladycat" target="_blank" rel="noreferrer">Ko-fi</a>.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {topics.filter(t => t.repo).map(t => (
              <a key={t.key} href={`https://github.com/${t.repo}`} target="_blank" rel="noreferrer" className="muted hover:text-accent dark:hover:text-accent-dark">{t.title} on GitHub</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
