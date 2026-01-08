'use client'

import { useState, useEffect } from 'react'
import TopNav from '@/components/TopNav'
import DataTable from '@/components/DataTable'
import { loadPapersData, Paper, getAvailableTopics, formatTopicName } from '@/lib/utils'

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState('backdoor_attack')
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    const availableTopics = getAvailableTopics()
    setTopics(availableTopics)
    // Set default topic from available topics
    if (availableTopics.length > 0 && !availableTopics.includes(selectedTopic)) {
      setSelectedTopic(availableTopics[0])
    }
  }, [selectedTopic])

  // Ensure ClustrMaps renders in the correct container
  useEffect(() => {
    // Wait for the script to load and ensure it targets the correct container
    const checkAndMoveMap = () => {
      const container = document.getElementById('clustrmaps-container')
      if (container) {
        // Find any ClustrMaps iframe or div that might have been injected elsewhere
        const maps = document.querySelectorAll('iframe[src*="clustrmaps"], div[id*="clustrmaps"]')
        maps.forEach((map) => {
          if (map.parentElement !== container) {
            container.appendChild(map)
          }
        })
      }
    }

    // Check periodically after script loads
    const interval = setInterval(checkAndMoveMap, 500)
    setTimeout(() => clearInterval(interval), 10000) // Stop after 10 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await loadPapersData(selectedTopic)
        setPapers(data)
      } catch (err) {
        setError('Failed to load papers data. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (selectedTopic) {
      fetchData()
    }
  }, [selectedTopic])

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav selectedTopic={selectedTopic} onTopicChange={setSelectedTopic} />

      <main className="flex-1 pt-20 lg:pt-24 p-4 lg:p-8 overflow-x-hidden w-full">
        <div className="w-full">
          <div className="mb-6 glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-200/50">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left side: Content */}
              <div className="flex-1">
                <p className="text-gray-600 text-sm mb-4 italic">
                  The data is sourced from IEEE Xplore, ACM, ScienceDirect, Springer, OpenReview, arXiv, DBLP, OpenAlex, and Google Scholar.
                </p>


                <p className="text-gray-700 text-lg">
                  Browse and search through research papers on{' '}
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatTopicName(selectedTopic)}
                  </span>
                </p>
                {!loading && !error && papers.length > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    <span className="text-purple-700 font-semibold">📚 Total: {papers.length} papers</span>
                  </div>
                )}
              </div>

              {/* Right side: Topic Selection & ClustrMaps */}
              <div className="flex-shrink-0 w-full lg:w-[300px] lg:ml-auto">
                <div className="p-5 bg-white/40 dark:bg-black/20 rounded-2xl border border-purple-200/50 shadow-lg backdrop-blur-md flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 px-1">
                      Select Topic
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-purple-400 transition-all cursor-pointer shadow-lg text-sm font-medium pr-10"
                      >
                        {topics.map((topic) => (
                          <option key={topic} value={topic}>
                            {formatTopicName(topic)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/80">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                      Visitor Map
                    </label>
                    <div id="clustrmaps-container" className="flex justify-center overflow-hidden rounded-xl bg-white/50 p-2 shadow-inner min-h-[100px] items-center">
                      {/* ClustrMaps will inject the map here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-6"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-pink-400 opacity-20"></div>
              </div>
              <span className="text-purple-700 font-medium text-lg">Loading papers...</span>
            </div>
          )}

          {error && (
            <div className="glass-effect rounded-xl p-4 mb-4 border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && papers.length === 0 && (
            <div className="glass-effect rounded-xl p-4 mb-4 border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-yellow-700 font-medium">No papers found for this topic.</span>
              </div>
            </div>
          )}

          {!loading && !error && papers.length > 0 && <DataTable data={papers} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 px-4 lg:px-8 border-t border-purple-200/30">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} MTUANN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

