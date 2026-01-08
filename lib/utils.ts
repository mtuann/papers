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
    const response = await fetch(`${basePath}/data/paper_${topic}.csv`)
    if (!response.ok) {
      throw new Error(`Failed to load data for topic: ${topic}`)
    }
    
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as Paper[])
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error('Error loading papers data:', error)
    return []
  }
}

export function getAvailableTopics(): string[] {
  // This would ideally be dynamic, but for now we'll return known topics
  // You can modify this to scan the data directory
  return ['backdoor_attack']
}

export function formatTopicName(topic: string): string {
  return topic
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

