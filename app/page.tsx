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
            <p className="text-gray-600 text-sm mb-4 italic">
              The data is sourced from IEEE Xplore, ACM, ScienceDirect, Springer, OpenReview, arXiv, DBLP, OpenAlex, and Google Scholar.
            </p>

            {/* Topic Selection */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Topic:</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-purple-400 transition-all cursor-pointer shadow-lg text-sm min-w-[220px] font-medium"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {formatTopicName(topic)}
                  </option>
                ))}
              </select>
            </div>

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

      {/* Footer with ClustrMaps */}
      <footer className="mt-12 py-8 px-4 lg:px-8 border-t border-purple-200/30">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} MTUANN. All rights reserved.
            </p>
            <div className="flex justify-center w-full" id="clustrmaps-container">
              {/* ClustrMaps will inject the map here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

