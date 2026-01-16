'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <main className="min-h-screen pt-20 relative overflow-hidden text-babylon-sand-100">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-babylon-lapis-900/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-babylon-gold-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className="text-babylon-gold-500 hover:text-babylon-gold-400 text-sm tracking-widest uppercase mb-8 inline-block">
             ← Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-babylon-sand-100 font-serif">
              Search Archive
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl relative">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search works, creators, themes..."
                className="w-full px-8 py-5 bg-babylon-lapis-800/80 backdrop-blur-sm border border-babylon-gold-600/30 text-xl font-serif text-babylon-sand-100 placeholder-babylon-sand-200/30 focus:outline-none focus:border-babylon-gold-500 focus:ring-1 focus:ring-babylon-gold-500/20 transition-all"
              />
               {/* Decorative corners for search input */}
               <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-babylon-gold-600/50 pointer-events-none group-focus-within:border-babylon-gold-500"></div>
               <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-babylon-gold-600/50 pointer-events-none group-focus-within:border-babylon-gold-500"></div>
               <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-babylon-gold-600/50 pointer-events-none group-focus-within:border-babylon-gold-500"></div>
               <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-babylon-gold-600/50 pointer-events-none group-focus-within:border-babylon-gold-500"></div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-babylon-gold-500/50 hover:text-babylon-gold-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-6 bg-babylon-lapis-900/90 backdrop-blur-sm border border-babylon-gold-600/20 shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-babylon-gold-500/70">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => updateFilter('type', e.target.value)}
                        className="w-full px-3 py-2 bg-babylon-lapis-800 border border-babylon-gold-600/20 text-babylon-sand-100 focus:outline-none focus:border-babylon-gold-500/50"
                      >
                        <option value="">All Types</option>
                        <option value="song">Song</option>
                        <option value="video">Video</option>
                        <option value="art">Art</option>
                      </select>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-babylon-gold-500/70">Creator</label>
                      <input
                        type="text"
                        value={filters.creator}
                        onChange={(e) => updateFilter('creator', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-2 bg-babylon-lapis-800 border border-babylon-gold-600/20 text-babylon-sand-100 placeholder-babylon-sand-200/20 focus:outline-none focus:border-babylon-gold-500/50"
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-babylon-gold-500/70">Genre</label>
                      <input
                        type="text"
                        value={filters.genre}
                        onChange={(e) => updateFilter('genre', e.target.value)}
                        placeholder="Genre"
                        className="w-full px-3 py-2 bg-babylon-lapis-800 border border-babylon-gold-600/20 text-babylon-sand-100 placeholder-babylon-sand-200/20 focus:outline-none focus:border-babylon-gold-500/50"
                      />
                  </div>

                  <div className="space-y-1">
                       <label className="text-xs uppercase tracking-widest text-babylon-gold-500/70">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => updateFilter('dateFrom', e.target.value)}
                        className="w-full px-3 py-2 bg-babylon-lapis-800 border border-babylon-gold-600/20 text-babylon-sand-100 focus:outline-none focus:border-babylon-gold-500/50"
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-babylon-gold-500/70">To Date</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => updateFilter('dateTo', e.target.value)}
                        className="w-full px-3 py-2 bg-babylon-lapis-800 border border-babylon-gold-600/20 text-babylon-sand-100 focus:outline-none focus:border-babylon-gold-500/50"
                      />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-babylon-gold-500"></div>
            <p className="mt-4 text-babylon-gold-600 tracking-widest uppercase text-sm">Searching archive...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-8 border-b border-babylon-gold-600/10 pb-4">
              <p className="text-babylon-gold-500 tracking-widest text-sm uppercase">Found {results.length} records</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </>
        ) : query || Object.values(filters).some(v => v) ? (
          <div className="text-center py-24 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
            <div className="text-6xl mb-6 opacity-30 grayscale">🔍</div>
            <h2 className="text-2xl font-serif text-babylon-sand-100 mb-2">No results found</h2>
            <p className="text-babylon-sand-200/60">The archives contain no matching records.</p>
          </div>
        ) : (
          <div className="text-center py-24 border border-babylon-gold-600/20 bg-babylon-lapis-900/50">
            <div className="text-6xl mb-6 opacity-30 grayscale">📚</div>
            <h2 className="text-2xl font-serif text-babylon-sand-100 mb-2">Search the Archive</h2>
            <p className="text-babylon-sand-200/60">Enter keywords or use filters to discover works.</p>
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
      <div className="bg-lapis-glass border border-babylon-gold-600/10 p-6 hover:border-babylon-gold-600/40 transition-all cursor-pointer group hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="w-full aspect-square mb-4 bg-babylon-lapis-900 border border-babylon-gold-600/10 flex items-center justify-center relative overflow-hidden">
          {result.thumbnail ? (
            <img
              src={`/api/image?path=${result.thumbnail}`}
              alt={result.title}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              onError={handleImageError}
            />
          ) : (
            <span className="text-4xl opacity-50">🎵</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-babylon-lapis-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Content */}
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold font-serif text-babylon-sand-100 group-hover:text-gold-gradient transition-all line-clamp-2">
            {result.title}
          </h3>
          <p className="text-sm text-babylon-gold-500 tracking-widest uppercase">{result.artist}</p>
          <div className="flex justify-between items-center border-t border-babylon-gold-600/10 pt-2 mt-2">
             <p className="text-xs text-babylon-sand-200/50 uppercase tracking-wider">{result.type}</p>
             {result.release_date && (
                <p className="text-xs text-babylon-sand-200/50 font-mono">{result.release_date}</p>
             )}
          </div>
          
          {result.description && (
            <p className="text-sm text-babylon-sand-200/60 line-clamp-2 mt-2 font-serif italic">
              "{result.description}"
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
