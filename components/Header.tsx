'use client'
import { useEffect, useState } from 'react'
import { GitHub, Moon, Sun } from './icons'

export default function Header() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur dark:border-line-dark/80 dark:bg-canvas-dark/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="./" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white dark:bg-accent-dark dark:text-canvas-dark">P</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Research Papers</span>
            <span className="block text-xs muted">auto-updated paper lists</span>
          </span>
        </a>
        <div className="flex items-center gap-1">
          <a href="https://github.com/mtuann" target="_blank" rel="noreferrer" aria-label="GitHub"
             className="grid h-9 w-9 place-items-center rounded-lg muted hover:bg-line/60 dark:hover:bg-line-dark"><GitHub /></a>
          <button onClick={toggle} aria-label="Toggle dark mode"
                  className="grid h-9 w-9 place-items-center rounded-lg muted hover:bg-line/60 dark:hover:bg-line-dark">
            {dark ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </header>
  )
}
