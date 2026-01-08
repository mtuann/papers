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

export function extractListItems(html: string): string[] {
  if (!html) return []
  const items: string[] = []
  
  // Extract items from <ul><li> lists
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi
  let match
  
  while ((match = liRegex.exec(html)) !== null) {
    const itemText = stripHtmlTags(match[1])
    if (itemText.trim()) {
      items.push(itemText.trim())
    }
  }
  
  // If no list items found, try to extract from the whole string
  if (items.length === 0) {
    const text = stripHtmlTags(html)
    if (text.trim()) {
      items.push(text.trim())
    }
  }
  
  return items
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
  // Map topic keys to their display names
  const topicMap: Record<string, string> = {
    'federated': 'Federated Learning',
    'fl_awe': 'FL - Awesome (by Yuwen Yang)',
    'backdoor_attack': 'Backdoor Learning',
    'advex': 'Adversarial Learning (by Nicholas Carlini)',
    'unlearning': 'Machine Unlearning',
    'llm': 'Large Language Models',
    'multi_modal': 'Multimodal Machine Learning',
    'serverless': 'Serverless Computing',
  }
  
  return topicMap[topic] || topic
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function exportToCSV(data: Paper[], filename: string = 'papers') {
  // Create CSV header
  const headers = ['Title', 'Author', 'Venue', 'Publish Date', 'URL', 'Code', 'Crawl Timestamp']
  
  // Create CSV rows
  const rows = data.map(paper => [
    stripHtmlTags(paper.title),
    stripHtmlTags(paper.author),
    stripHtmlTags(paper.venue_name),
    stripHtmlTags(paper.publish_date),
    extractLinks(paper.url).map(l => l.url).filter(Boolean).join('; '),
    extractLinks(paper.code).map(l => l.url).filter(Boolean).join('; '),
    stripHtmlTags(paper.crawl_timestamp),
  ])
  
  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
  
  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
