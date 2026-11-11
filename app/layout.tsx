import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research Papers · Tuan Nguyen',
  description: 'Auto-updated, searchable lists of research papers: LLM serving, federated learning, backdoor learning and machine unlearning.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

// set the colour theme before paint to avoid a flash
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Script id="clustrmaps" strategy="lazyOnload"
          src="https://clustrmaps.com/map_v2.js?d=7-Udvej828PGj6gVsaVm-bV7Pu4M0wfCk72xPaD7RNM&cl=ffffff&w=200" />
      </body>
    </html>
  )
}
