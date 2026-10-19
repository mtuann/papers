export interface Topic {
  key: string; title: string; about: string; csv: string; repo: string
  count: number; with_code: number; new_30d: number; updated: string
}
export interface Paper {
  title: string; authors: string; date: string; venue: string
  links: [string, string][]; code: string; seen: string; year: string
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const dataUrl = (file: string) => `${base}/data/${file}`

export async function loadTopics(): Promise<Topic[]> {
  const r = await fetch(dataUrl('topics.json'))
  return r.ok ? r.json() : []
}

type Row = [string, string[] | string, string, string, Record<string, string>, string, string]

export async function loadPapers(key: string): Promise<Paper[]> {
  const r = await fetch(dataUrl(`${key}.json`))
  if (!r.ok) return []
  const { papers } = (await r.json()) as { papers: Row[] }
  return papers.map(([title, authors, date, venue, links, code, seen]) => ({
    title, date, venue, code, seen,
    authors: Array.isArray(authors) ? authors.join(', ') : authors,
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
  llm_serving: '#7C3AED', federated: '#0F9F8F', backdoor_attack: '#E11D48', unlearning: '#D97706',
}
export const topicColor = (k: string) => TOPIC_COLOR[k] || '#4F46E5'
