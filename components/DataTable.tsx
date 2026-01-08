'use client'

import { useState, useMemo } from 'react'
import { Paper, stripHtmlTags, extractLinks } from '@/lib/utils'

interface DataTableProps {
  data: Paper[]
}

type SortConfig = {
  key: keyof Paper | null
  direction: 'asc' | 'desc'
}

export default function DataTable({ data }: DataTableProps) {
  const [globalSearch, setGlobalSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const columns: Array<{ key: keyof Paper; label: string }> = useMemo(() => [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author(s)' },
    { key: 'venue_name', label: 'Venue' },
    { key: 'publish_date', label: 'Publish Date' },
    { key: 'url', label: 'URL' },
    { key: 'code', label: 'Code' },
    { key: 'crawl_timestamp', label: 'Crawl Timestamp' },
  ], [])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data]

    // Apply global search
    if (globalSearch.trim()) {
      const searchLower = globalSearch.toLowerCase().trim()
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key] || ''
          return stripHtmlTags(String(value)).toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue.trim()) {
        const filterLower = filterValue.toLowerCase().trim()
        filtered = filtered.filter((row) => {
          const value = row[key as keyof Paper] || ''
          return stripHtmlTags(String(value)).toLowerCase().includes(filterLower)
        })
      }
    })

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = stripHtmlTags(String(a[sortConfig.key!] || ''))
        const bValue = stripHtmlTags(String(b[sortConfig.key!] || ''))
        
        // Handle date columns (publish_date, crawl_timestamp)
        if (sortConfig.key === 'publish_date' || sortConfig.key === 'crawl_timestamp') {
          // Try to parse as date (handles formats like "2025-12-15" or "2025-12-18 19:13:09")
          const parseDate = (dateStr: string): number => {
            if (!dateStr || dateStr.trim() === '' || dateStr === '-') return 0
            
            // Clean the string - remove any extra whitespace
            const cleanDate = dateStr.trim()
            
            // Try ISO format first (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss)
            // Replace space with T for ISO 8601 format
            const isoFormat = cleanDate.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')
            const isoDate = new Date(isoFormat)
            
            if (!isNaN(isoDate.getTime()) && isoDate.getTime() > 0) {
              return isoDate.getTime()
            }
            
            // Fallback: try to extract year-month-day pattern (YYYY-MM-DD)
            const dateMatch = cleanDate.match(/(\d{4})-(\d{2})-(\d{2})/)
            if (dateMatch) {
              const [, year, month, day] = dateMatch
              const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              if (!isNaN(dateObj.getTime())) {
                return dateObj.getTime()
              }
            }
            
            return 0
          }
          
          const aDate = parseDate(aValue)
          const bDate = parseDate(bValue)
          
          if (aDate !== 0 && bDate !== 0) {
            const comparison = aDate - bDate
            return sortConfig.direction === 'asc' ? comparison : -comparison
          } else if (aDate !== 0) {
            // a has valid date, b doesn't - put a first in asc, last in desc
            return sortConfig.direction === 'asc' ? -1 : 1
          } else if (bDate !== 0) {
            // b has valid date, a doesn't - put b first in asc, last in desc
            return sortConfig.direction === 'asc' ? 1 : -1
          }
          // Both invalid, fall through to string comparison
        }
        
        // Try numeric comparison for other numeric fields
        const aNum = parseFloat(aValue)
        const bNum = parseFloat(bValue)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
        }
        
        // String comparison
        let comparison = 0
        if (aValue < bValue) comparison = -1
        else if (aValue > bValue) comparison = 1
        
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, globalSearch, columnFilters, sortConfig, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedData.slice(start, start + itemsPerPage)
  }, [filteredAndSortedData, currentPage, itemsPerPage])

  const handleSort = (key: keyof Paper) => {
    setSortConfig((prev) => {
      // If clicking the same column, toggle direction
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      // If clicking a different column, start with ascending
      return {
        key,
        direction: 'asc',
      }
    })
    setCurrentPage(1)
  }

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const getSortIcon = (key: keyof Paper) => {
    if (sortConfig.key !== key) {
      return (
        <span className="text-purple-300 text-xs ml-1">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <span className="text-pink-400 text-xs ml-1 font-bold">↑</span>
    ) : (
      <span className="text-pink-400 text-xs ml-1 font-bold">↓</span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Global Search */}
      <div className="glass-effect rounded-2xl shadow-xl p-6 border-2 border-purple-200/50">
        <label className="block text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Global Search (all fields)
        </label>
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search across all columns..."
          className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-inner bg-white/50"
        />
      </div>

      {/* Items per page selector */}
      <div className="flex items-center justify-between glass-effect rounded-2xl shadow-xl p-4 border-2 border-purple-200/50">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-purple-700">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-medium text-purple-700 cursor-pointer hover:border-purple-400 transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm font-medium text-purple-600">entries</span>
        </div>
        <div className="text-sm font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          Showing <span className="font-bold text-pink-600">{paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="font-bold text-pink-600">{Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
          <span className="font-bold text-pink-600">{filteredAndSortedData.length}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-purple-600/80 transition-all transform hover:scale-105"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Column filters */}
              <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                {columns.map((column) => (
                  <th key={`filter-${column.key}`} className="px-6 py-3">
                    <input
                      type="text"
                      value={columnFilters[column.key] || ''}
                      onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                      placeholder={`Filter ${column.label.toLowerCase()}...`}
                      className="w-full px-3 py-2 text-xs border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-white/80 transition-all"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-purple-600 font-semibold text-lg">No papers found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all border-b border-purple-100 hover:shadow-md"
                  >
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm font-bold text-purple-700 max-w-md">
                        {stripHtmlTags(row.title)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-700 max-w-xs font-medium">
                        {stripHtmlTags(row.author)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-pink-600 max-w-xs font-medium">
                        {stripHtmlTags(row.venue_name)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-semibold">
                        {stripHtmlTags(row.publish_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm">
                        {extractLinks(row.url).map((link, i) => (
                          link.url ? (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium text-xs"
                            >
                              🔗 {link.text || 'Link'}
                            </a>
                          ) : (
                            <span key={i} className="text-gray-400">-</span>
                          )
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm">
                        {row.code && stripHtmlTags(row.code) ? (
                          <a
                            href={stripHtmlTags(row.code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium text-xs"
                          >
                            💻 Code
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">
                        {stripHtmlTags(row.crawl_timestamp) || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-effect rounded-2xl shadow-xl p-6 border-2 border-purple-200/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium disabled:hover:scale-100"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  )
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-2 text-purple-600 font-bold">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-xl transition-all transform hover:scale-110 font-bold ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl scale-110'
                            : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium disabled:hover:scale-100"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

