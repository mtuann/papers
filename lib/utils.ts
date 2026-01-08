import Papa from 'papaparse'

export interface Paper {
  title: string
  author: string
  venue_name: string
  publish_date: string
  url: string
  code: string
  crawl_timestamp: string
}

export function stripHtmlTags(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

export function extractLinks(html: string): Array<{ text: string; url: string }> {
  if (!html) return []
  const links: Array<{ text: string; url: string }> = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi
  let match
  
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({ url: match[1], text: stripHtmlTags(match[2]) })
  }
  
  return links.length > 0 ? links : [{ text: stripHtmlTags(html), url: '' }]
}

export async function loadPapersData(topic: string): Promise<Paper[]> {
  try {
    // Use relative path for static export - Next.js handles basePath automatically
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    
    // Try both naming patterns: papers_<topic> and paper_<topic>
    const possiblePaths = [
      `${basePath}/data/papers_${topic}.csv`,
      `${basePath}/data/paper_${topic}.csv`,
    ]
    
    let csvText = ''
    let found = false
    
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path)
        if (response.ok) {
          csvText = await response.text()
          found = true
          break
        }
      } catch (e) {
        // Try next path
        continue
      }
    }
    
    if (!found) {
      throw new Error(`Failed to load data for topic: ${topic}`)
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as Paper[])
        },
        error: (error: unknown) => {
          reject(error instanceof Error ? error : new Error(String(error)))
        },
      })
    })
  } catch (error) {
    console.error('Error loading papers data:', error)
    return []
  }
}

export function getAvailableTopics(): string[] {
  // List of all available topics extracted from CSV filenames
  // Topics are extracted by removing 'paper_' or 'papers_' prefix and '.csv' suffix
  return [
    'advex',
    'backdoor_attack',
    'federated',
    'fl_awe',
    'llm',
    'multi_modal',
    'serverless',
    'unlearning',
  ]
}

export function formatTopicName(topic: string): string {
  return topic
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

