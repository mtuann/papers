import { Paper, repoName } from '@/lib/data'
import { GitHub } from './icons'

export type SortKey = 'date' | 'title' | 'venue'
export type SortState = { key: SortKey; dir: 'asc' | 'desc' }

function shortAuthors(a: string) {
  const parts = a.split(', ')
  return parts.length > 2 ? `${parts[0]}, ${parts[1]} …` : a
}

export default function PaperTable({ rows, sort, onSort, filters, newSince }: {
  rows: Paper[]; sort: SortState; onSort: (k: SortKey) => void; filters: React.ReactNode[]; newSince: string
}) {
  const head = (k: SortKey | null, label: string, cls = '') => (
    <th className={`px-3 pt-3 pb-1.5 text-left text-xs font-semibold uppercase tracking-wide muted ${cls}`}>
      {k ? (
        <button onClick={() => onSort(k)} className="inline-flex items-center gap-1 hover:text-accent dark:hover:text-accent-dark">
          {label}<span className={sort.key === k ? 'text-accent dark:text-accent-dark' : 'opacity-30'}>{sort.key === k && sort.dir === 'asc' ? '▲' : '▼'}</span>
        </button>
      ) : label}
    </th>
  )
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
        <colgroup><col className="w-[150px]" /><col /><col className="w-[180px]" /><col className="w-[170px]" /><col className="w-[120px]" /><col className="w-[150px]" /></colgroup>
        <thead className="bg-surface dark:bg-surface-dark">
          <tr>{head('date', 'Date')}{head('title', 'Title')}{head(null, 'Authors')}{head('venue', 'Venue')}{head(null, 'Source')}{head(null, 'Code')}</tr>
          <tr className="border-b border-line dark:border-line-dark">
            {filters.map((f, i) => <th key={i} className="px-2 pb-2 align-top font-normal">{f}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const repo = repoName(p.code)
            const url = p.links[0]?.[1]
            return (
              <tr key={p.title + i} className="border-b border-line/70 align-top last:border-0 hover:bg-accent-soft/40 dark:border-line-dark/70 dark:hover:bg-accent-softdark/40">
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums muted">
                  {p.date}{p.seen >= newSince && <span className="mt-1 block w-fit rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">NEW</span>}
                </td>
                <td className="px-3 py-2.5">
                  <div className="line-clamp-2 font-medium leading-snug" title={p.title}>
                    {url ? <a href={url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline dark:hover:text-accent-dark">{p.title}</a> : p.title}
                  </div>
                </td>
                <td className="truncate px-3 py-2.5 muted" title={p.authors}>{shortAuthors(p.authors)}</td>
                <td className="px-3 py-2.5"><span className="line-clamp-2 text-xs font-medium text-accent dark:text-accent-dark" title={p.venue}>{p.venue}</span></td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {p.links.map(([s, u]) => <a key={s} href={u} target="_blank" rel="noreferrer" className="chip !px-1.5 !text-[11px]">{s}</a>)}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {repo && (
                    <a href={p.code} target="_blank" rel="noreferrer" title={repo} className="inline-flex max-w-full flex-col gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-medium hover:text-accent dark:hover:text-accent-dark">
                        <GitHub className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{repo.split('/')[1]}</span>
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" loading="lazy" className="h-4 self-start" src={`https://img.shields.io/github/stars/${repo}?style=flat&label=%E2%98%85&color=4F46E5`} />
                    </a>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
