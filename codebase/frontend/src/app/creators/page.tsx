'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

type Creator = {
  id: string;
  name: string;
  worksCount: number;
  completeness: number;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent h-64" />
        
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 transition-colors">
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Creators
              </h1>
              <p className="text-xl text-gray-400 mt-2">
                {loading ? 'Loading...' : `${creators.length} ${creators.length === 1 ? 'creator' : 'creators'} preserved in the archive`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">No creators archived yet</h2>
            <p className="text-gray-400">Start building the archive of digital culture</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c: Creator) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ------------------ COMPONENTS ------------------ */

function CreatorCard({ creator }: { creator: Creator }) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={`/creator/${creator.id}`}>
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] h-full flex flex-col">
        {/* Creator Image/Icon */}
        <div className="w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <img
            src={`/api/image?path=creators/${creator.id}/outfit/suisei.png`}
            alt={creator.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        </div>

        {/* Creator Info */}
        <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
          {creator.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <span className="font-medium">
            {creator.worksCount} {creator.worksCount === 1 ? 'work' : 'works'} archived
          </span>
        </div>

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Archive Progress</span>
            <span className="text-sm font-semibold text-purple-400">
              {Math.round(creator.completeness * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 group-hover:from-blue-400 group-hover:to-purple-400"
              style={{ width: `${creator.completeness * 100}%` }}
            />
          </div>
        </div>

        {/* Hover Effect */}
        <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
      </div>
    </Link>
  );
}
