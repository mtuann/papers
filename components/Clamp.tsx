import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

// Static class names so Tailwind keeps them.
const CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' } as const

/**
 * Text cut to a few lines with an ellipsis. The full text is always available:
 * hover shows it as a tooltip, and a click/tap (useful on phones, which have no hover)
 * expands the cell in place; click again to collapse. Clicks on links inside still navigate.
 */
export default function Clamp({ text, lines = 2, className = '', as = 'div', children }: {
  text: string; lines?: 1 | 2 | 3; className?: string; as?: 'div' | 'span'; children?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [cut, setCut] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || open) return
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, open])

  const toggle = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    if (cut || open) setOpen(o => !o)
  }
  const Tag = as
  return (
    <Tag
      ref={ref as never}
      title={cut && !open ? text : undefined}
      onClick={toggle}
      className={`${open ? 'whitespace-normal break-words' : CLAMP[lines]} ${cut || open ? 'cursor-pointer' : ''} ${className}`}
    >
      {children ?? text}
    </Tag>
  )
}
