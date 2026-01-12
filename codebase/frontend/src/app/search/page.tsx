'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  creatorId: string;
  title: string;
  artist: string;
  type: string;
  release_date: string;
  thumbnail?: string;
  description?: string;
  source?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    creator: '',
    genre: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = async () => {
    if (!query.trim() && !Object.values(filters).some(v => v)) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent h-64" />
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 transition-colors">
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Search Archive
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search works, creators, themes..."
                className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">All Types</option>
                    <option value="song">Song</option>
                    <option value="video">Video</option>
                    <option value="art">Art</option>
                  </select>

                  <input
                    type="text"
                    value={filters.creator}
                    onChange={(e) => updateFilter('creator', e.target.value)}
                    placeholder="Creator name"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />

                  <input
                    type="text"
                    value={filters.genre}
                    onChange={(e) => updateFilter('genre', e.target.value)}
                    placeholder="Genre"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />

                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />

                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Searching archive...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-8">
              <p className="text-gray-400">Found {results.length} results</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </>
        ) : query || Object.values(filters).some(v => v) ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">Search the Archive</h2>
            <p className="text-gray-400">Enter keywords or use filters to discover works</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={`/creator/${result.creatorId}`}>
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02]">
        {/* Thumbnail */}
        <div className="w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {result.thumbnail ? (
            <img
              src={`/api/image?path=${result.thumbnail}`}
              alt={result.title}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              onError={handleImageError}
            />
          ) : (
            <span className="text-4xl">🎵</span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors line-clamp-2">
            {result.title}
          </h3>
          <p className="text-sm text-gray-400">{result.artist}</p>
          <p className="text-sm text-gray-500 capitalize">{result.type}</p>
          {result.release_date && (
            <p className="text-xs text-gray-500">{result.release_date}</p>
          )}
          {result.description && (
            <p className="text-sm text-gray-300 line-clamp-2 mt-2">
              {result.description}
            </p>
          )}
        </div>

        {/* Hover Arrow */}
        <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-purple-400 text-xl">→</span>
        </div>
      </div>
    </Link>
  );
}