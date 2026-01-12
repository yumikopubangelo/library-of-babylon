'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Creator = {
  id: string;
  name: string;
  worksCount: number;
  completeness: number;
};

export default function Home() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [totalWorks, setTotalWorks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        const creatorList = data.creators || [];
        setCreators(creatorList);
        setTotalWorks(creatorList.reduce((sum: number, c: Creator) => sum + c.worksCount, 0));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const featuredCreator = creators.find(c => c.id === "Hoshimachi_Suisei");

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="text-7xl mb-4 animate-bounce">Library</div>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
            Library of Babylon
          </h1>

          <p className="text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Preserving ephemeral beauty for eternity
          </p>
          
          <p className="text-gray-400 max-w-xl mx-auto">
            A digital archive dedicated to preserving the works of digital creators, musicians, and artists for future generations
          </p>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          <StatCard
            title="Creators Archived"
            value={loading ? '...' : creators.length}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Works Preserved"
            value={loading ? '...' : totalWorks}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Days Since Genesis"
            value={1}
            gradient="from-orange-500 to-red-500"
          />
        </section>

        {/* Featured Creator */}
        <section className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-4xl font-bold">Featured Creator</h2>
          </div>

          {featuredCreator ? (
            <CreatorCard
              name={featuredCreator.name}
              description="A pioneering VTuber known for her exceptional music and performances. Her works blend powerful vocals with meaningful lyrics, creating timeless pieces of digital culture."
              worksCount={featuredCreator.worksCount}
              completeness={featuredCreator.completeness}
              href={`/creator/${featuredCreator.id}`}
            />
          ) : (
            <div className="text-center py-8 text-gray-400">
              {loading ? 'Loading featured creator...' : 'Featured creator not found'}
            </div>
          )}
        </section>

        {/* Mission Statement */}
        <section className="max-w-4xl mx-auto mb-16 text-center">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-300 leading-relaxed">
              In the digital age, countless works of art, music, and culture exist only as ephemeral streams and videos. 
              The Library of Babylon is dedicated to preserving these treasures with proper context, metadata, and historical 
              significance, ensuring they remain accessible for research, appreciation, and cultural understanding for generations to come.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-pink-500/50 transform hover:scale-105 mr-4"
          >
            <span>🔍 Search Archive</span>
          </Link>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-105"
          >
            <span>Browse All Creators</span>
            <span className="text-2xl">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

/* ------------------ COMPONENTS ------------------ */

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: string;
  gradient: string;
};

function StatCard({ title, value, icon, gradient }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-500 transition-all hover:shadow-xl hover:scale-105 group">
      {icon && (
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-gray-400 text-lg">{title}</div>
    </div>
  );
}

type CreatorCardProps = {
  name: string;
  description: string;
  worksCount: number;
  completeness: number;
  href: string;
};

function CreatorCard({
  name,
  description,
  worksCount,
  completeness,
  href,
}: CreatorCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Link href={href}>
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex gap-8 items-center">
          {/* Creator Image */}
          <div className="w-48 h-48 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/50 transition-all">
              <img
                src="/api/image?path=creators/Hoshimachi_Suisei/outfit/suisei.png"
                alt={name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                onError={handleImageError}
              />
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
              {name}
            </h3>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {description}
            </p>

            <div className="flex gap-8 text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{worksCount} works archived</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{Math.round(completeness * 100)}% complete</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 group-hover:from-blue-400 group-hover:to-purple-400"
                  style={{ width: `${completeness * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}