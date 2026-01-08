'use client'

import { useState, useEffect } from 'react'
import { getAvailableTopics, formatTopicName } from '@/lib/utils'

interface SidebarProps {
  selectedTopic: string
  onTopicChange: (topic: string) => void
}

export default function Sidebar({ selectedTopic, onTopicChange }: SidebarProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setTopics(getAvailableTopics())
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transform transition-all duration-200"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40
          w-72 glass-dark text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-2xl
        `}
      >
        <div className="p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Research Papers
          </h1>
          <p className="text-purple-200 text-sm">Browse by topic</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium mb-3 text-purple-200">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                onTopicChange(e.target.value)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-800/80 to-pink-800/80 border-2 border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-purple-400 transition-all cursor-pointer shadow-lg"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {formatTopicName(topic)}
                </option>
              ))}
            </select>
          </div>

          {/* Author Information */}
          <div className="pt-6 border-t border-purple-500/30">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              About
            </h2>
            <div className="space-y-4 text-sm text-purple-100">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-800/40 to-pink-800/40 border border-purple-500/30">
                <p className="font-bold text-white mb-1 text-base">MTUANN</p>
                <p className="text-purple-200">
                  Research paper curator and enthusiast
                </p>
              </div>
              
              <div>
                <p className="font-medium text-white mb-2">Connect</p>
                <div className="space-y-2">
                  <a
                    href="https://github.com/mtuann"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-200 hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-purple-800/30 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Donation */}
          <div className="pt-6 border-t border-purple-500/30">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Support
            </h2>
            <p className="text-sm text-purple-200 mb-4">
              If you find this resource helpful, consider supporting the project.
            </p>
            <a
              href="https://github.com/sponsors/mtuann"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Donate
            </a>
          </div>
        </div>

        <div className="p-6 border-t border-purple-500/30 text-xs text-purple-300 text-center">
          <p>© {new Date().getFullYear()} MTUANN. All rights reserved.</p>
        </div>
      </aside>
    </>
  )
}

