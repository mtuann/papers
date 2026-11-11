'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

/** Multi-select with search and per-venue counts (counts respect the other active filters). */
export default function VenueFilter({ counts, selected, onChange }: {
  counts: [string, number][]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const list = useMemo(() => {
    const ql = q.toLowerCase()
    return counts.filter(([v]) => !ql || v.toLowerCase().includes(ql)).slice(0, 200)
  }, [counts, q])
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  const label = selected.length === 0 ? 'All venues' : selected.length === 1 ? selected[0] : `${selected.length} venues`

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className={`input flex w-full items-center justify-between gap-1 !h-8 !px-2 text-xs font-normal ${selected.length ? '!border-accent text-accent dark:text-accent-dark' : 'muted'}`}>
        <span className="truncate">{label}</span><span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="card absolute left-0 z-30 mt-1 w-72 p-2">
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Find a venue…" className="input mb-2 h-8 w-full text-xs" />
          <div className="max-h-72 overflow-y-auto">
            {list.map(([v, n]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-canvas dark:hover:bg-canvas-dark">
                <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} className="accent-[#4F46E5]" />
                <span className="flex-1 truncate" title={v}>{v}</span>
                <span className="tabular-nums muted">{n.toLocaleString()}</span>
              </label>
            ))}
            {!list.length && <p className="px-2 py-3 text-xs muted">No venue matches.</p>}
          </div>
          {selected.length > 0 && <button onClick={() => onChange([])} className="mt-2 w-full text-xs text-accent hover:underline dark:text-accent-dark">Clear venues</button>}
        </div>
      )}
    </div>
  )
}
