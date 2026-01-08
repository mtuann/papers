import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research Papers - MTUANN',
  description: 'Browse and search research papers by topic',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Script
          id="clustrmaps"
          strategy="lazyOnload"
          src="https://clustrmaps.com/map_v2.js?d=7-Udvej828PGj6gVsaVm-bV7Pu4M0wfCk72xPaD7RNM&cl=ffffff&w=300"
        />
      </body>
    </html>
  )
}

