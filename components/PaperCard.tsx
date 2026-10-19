import { Paper, repoName } from '@/lib/data'
import { GitHub } from './icons'

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return <>{text.slice(0, i)}<mark className="rounded bg-yellow-200/70 px-0.5 text-inherit dark:bg-yellow-500/30">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
}

export default function PaperCard({ p, q, isNew }: { p: Paper; q: string; isNew: boolean }) {
  const url = p.links[0]?.[1]
  const repo = repoName(p.code)
  return (
    <article className="card min-w-0 overflow-hidden p-4 transition hover:border-accent/40 sm:p-5">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
        <time className="font-medium tabular-nums muted">{p.date}</time>
        {p.venue && <span title={p.venue} className="max-w-[70%] truncate rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent dark:bg-accent-softdark dark:text-accent-dark">{p.venue}</span>}
        {isNew && <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">New</span>}
      </div>
      <h3 className="text-[15px] font-semibold leading-snug sm:text-base">
        {url ? <a href={url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline dark:hover:text-accent-dark">{highlight(p.title, q)}</a> : highlight(p.title, q)}
      </h3>
      {p.authors && <p className="mt-1 line-clamp-1 text-sm muted">{highlight(p.authors, q)}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {p.links.map(([src, u]) => (
          <a key={src} href={u} target="_blank" rel="noreferrer" className="chip">{src}</a>
        ))}
        {repo && (
          <span className="ml-auto inline-flex min-w-0 max-w-full items-center gap-2">
            <a href={p.code} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 dark:bg-ink-dark dark:text-canvas-dark">
              <GitHub className="h-3.5 w-3.5" />
              <span className="max-w-[9rem] truncate sm:max-w-[14rem]">{repo}</span>
            </a>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" loading="lazy" className="h-5" src={`https://img.shields.io/github/stars/${repo}?style=social&label=`} />
          </span>
        )}
      </div>
    </article>
  )
}
