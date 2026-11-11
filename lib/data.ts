export interface Topic {
  key: string; title: string; about: string; repo: string
  count: number; with_code: number; new_30d: number; updated: string
}
export interface Paper {
  title: string; authors: string; date: string; venue: string
  links: [string, string][]; code: string; seen: string; year: string
  also: [string, string][]   // other versions of the same work: [venue, url]
  first: string              // first appearance (arXiv) when `date` is the published version's date, else ''
  kind: Kind
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const dataUrl = (file: string) => `${base}/data/${file}`
// GitHub Pages lets browsers reuse data files for 10 min; 'no-cache' revalidates them on every load
// (a cheap 304 when nothing changed), so a new weekly build shows up without a hard reload.
const FRESH: RequestInit = { cache: 'no-cache' }

export async function loadTopics(): Promise<Topic[]> {
  const r = await fetch(dataUrl('topics.json'), FRESH)
  return r.ok ? r.json() : []
}

export type Kind = 'published' | 'preprint' | 'other'
const REPOSITORY = /^(zenodo|figshare|research square|ssrn|ssrn electronic journal|osf preprints|hal|doaj|biorxiv|medrxiv|techrxiv|preprints\.org|authorea|engrxiv|psyarxiv|qeios|deleted journal)$|universit|repository|thesis|dissertation/
/** Same classes as crawler/dedupe.py rank(): published venue / preprint or submission / repository or unknown. */
export function kindOf(venue: string): Kind {
  const v = venue.toLowerCase()
  if (!v || REPOSITORY.test(v)) return 'other'
  if (v === 'arxiv' || /\((submission|withdrawn|desk rejected)\)$/.test(v)) return 'preprint'
  return 'published'
}

/** "ECCV 2024" -> "ECCV", "ICLR 2026 (submission)" -> "ICLR", "VTC 2024-Fall" -> "VTC"; journals stay as they are. */
export function venueFamily(venue: string): string {
  return venue.replace(/\s*\((submission|withdrawn|desk rejected)\)$/i, '').replace(/\s+(19|20)\d{2}(-(Spring|Fall))?$/, '').trim()
}
/** A venue filter value: an exact venue, or "@ECCV" for every year of a family. */
export const FAMILY = '@'
export const venueLabel = (v: string) => v.startsWith(FAMILY) ? `${v.slice(1)} (all years)` : v

type Row = [string, string[] | string, string, string, Record<string, string>, string, string, [string, string][]?, string?]

export async function loadPapers(key: string): Promise<Paper[]> {
  const r = await fetch(dataUrl(`${key}.json`), FRESH)
  if (!r.ok) return []
  const { papers } = (await r.json()) as { papers: Row[] }
  return papers.map(([title, authors, date, venue, links, code, seen, also, first]) => ({
    title, date, venue, code, seen, also: also || [], first: first || '', kind: kindOf(venue),
    // double-blind submissions have no authors until the venue decides
    authors: (Array.isArray(authors) ? authors.join(', ') : authors) || (/submission\)$/i.test(venue) ? 'Anonymous (under review)' : ''),
    links: Object.entries(links),
    year: date.slice(0, 4),
  }))
}

export function repoName(url: string) {
  const m = url.match(/github\.com\/([A-Za-z0-9-]+\/[A-Za-z0-9_.-]+)/)
  // drop sentence punctuation and .git picked up with the link ("…/repo." or "…/repo.git")
  return m ? m[1].replace(/[.,;:]+$/, '').replace(/(\.git)+$/, '') : ''
}

// one quiet colour per topic (used for the dot / stat accents)
export const TOPIC_COLOR: Record<string, string> = {
  llm_serving: '#7C3AED', rag: '#2563EB', agent_cdn: '#0891B2', federated: '#0F9F8F', backdoor_attack: '#E11D48', unlearning: '#D97706',
}
export const topicColor = (k: string) => TOPIC_COLOR[k] || '#4F46E5'
